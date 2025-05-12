
import { toast } from '@/hooks/use-toast';

export interface PlatformPost {
  content: string;
  media?: string[];
  scheduledTime?: Date;
}

class PlatformAPI {
  private token: string;
  
  constructor(token: string) {
    this.token = token;
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
