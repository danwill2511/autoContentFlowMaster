
import { toast } from '@/hooks/use-toast';

export interface PlatformPost {
  content: string;
  media?: string[];
  scheduledTime?: Date;
}

class PlatformAPI {
  protected token: string;
  protected apiKey?: string;
  
  constructor(token: string, apiKey?: string) {
    this.token = token;
    this.apiKey = apiKey;
  }

  protected async request(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "API Error",
        description: error instanceof Error ? error.message : "Failed to connect to platform",
      });
      throw error;
    }
  }
}

export class TwitterAPI extends PlatformAPI {
  async post(data: PlatformPost) {
    return this.request('https://api.twitter.com/2/tweets', {
      method: 'POST',
      body: JSON.stringify({ text: data.content }),
    });
  }
}

export class LinkedInAPI extends PlatformAPI {
  async post(data: PlatformPost) {
    return this.request('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      body: JSON.stringify({
        author: 'urn:li:person:{{PROFILE_ID}}',
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: data.content },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
      }),
    });
  }
}

export class FacebookAPI extends PlatformAPI {
  async post(data: PlatformPost) {
    return this.request('https://graph.facebook.com/v18.0/me/feed', {
      method: 'POST',
      body: JSON.stringify({ message: data.content }),
    });
  }
}
export class PinterestAPI extends PlatformAPI {
  async post(data: PlatformPost) {
    const payload = {
      board: data.boardId,
      media_source: {
        source_type: "image_url",
        url: data.media?.[0]
      },
      title: data.content,
      description: data.content
    };

    return this.request('https://api.pinterest.com/v5/pins', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
}

export class YouTubeAPI extends PlatformAPI {
  async post(data: PlatformPost) {
    const { title, description, tags } = JSON.parse(data.content);
    
    // First create video with metadata
    const metadata = await this.request('https://www.googleapis.com/youtube/v3/videos', {
      method: 'POST',
      body: JSON.stringify({
        snippet: {
          title,
          description,
          tags,
          categoryId: "22" // People & Blogs
        },
        status: {
          privacyStatus: "public",
          selfDeclaredMadeForKids: false
        }
      })
    });

    // Then upload video file
    if (data.media?.[0]) {
      await this.request(`https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status&videoId=${metadata.id}`, {
        method: 'PUT',
        body: data.media[0]
      });
    }

    return metadata;
  }
}

export class InstagramAPI extends PlatformAPI {
  async post(data: PlatformPost) {
    // First create container
    const container = await this.request('https://graph.facebook.com/v18.0/me/media', {
      method: 'POST',
      body: JSON.stringify({
        image_url: data.media?.[0],
        caption: data.content
      })
    });

    // Then publish
    return this.request(`https://graph.facebook.com/v18.0/me/media_publish`, {
      method: 'POST',
      body: JSON.stringify({
        creation_id: container.id
      })
    });
  }
}

export class LinkedInCompanyAPI extends PlatformAPI {
  async post(data: PlatformPost) {
    const payload = {
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: []
      },
      owner: `urn:li:organization:${data.companyId}`,
      content: {
        media: data.media?.map(url => ({
          type: "IMAGE",
          url
        })),
        article: {
          source: data.url,
          title: data.title,
          description: data.content
        }
      },
      visibility: "PUBLIC"
    };

    return this.request('https://api.linkedin.com/rest/posts', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
}

export class TwitterThreadAPI extends PlatformAPI {
  async post(data: PlatformPost) {
    // Split content into thread-sized chunks
    const tweets = this.splitIntoTweets(data.content);
    
    let lastTweetId: string | undefined;
    const thread = [];

    // Post each tweet in sequence
    for (const tweet of tweets) {
      const payload: any = {
        text: tweet
      };

      if (lastTweetId) {
        payload.reply = {
          in_reply_to_tweet_id: lastTweetId
        };
      }

      const response = await this.request('https://api.twitter.com/2/tweets', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      lastTweetId = response.data.id;
      thread.push(response.data);
    }

    return { thread };
  }

  private splitIntoTweets(content: string): string[] {
    const TWEET_LENGTH = 280;
    const words = content.split(' ');
    const tweets: string[] = [];
    let currentTweet = '';

    for (const word of words) {
      if ((currentTweet + ' ' + word).length <= TWEET_LENGTH) {
        currentTweet += (currentTweet ? ' ' : '') + word;
      } else {
        tweets.push(currentTweet);
        currentTweet = word;
      }
    }

    if (currentTweet) {
      tweets.push(currentTweet);
    }

    return tweets;
  }
}
