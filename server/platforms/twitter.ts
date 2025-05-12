/**
 * Twitter (X) API Integration
 * 
 * This module provides functionality for interacting with the Twitter API v2
 * for authenticating users, posting tweets, and creating threads.
 * 
 * Twitter API docs: https://developer.twitter.com/en/docs/twitter-api
 */

import { Platform } from '@shared/schema';
import axios from 'axios';
import { URLSearchParams } from 'url';
import { OAuth } from 'oauth';
import crypto from 'crypto';
import { logger } from '../logger';

// Twitter API configuration
const TWITTER_API_URL = 'https://api.twitter.com/2';
const TWITTER_AUTH_URL = 'https://twitter.com/i/oauth2/authorize';
const TWITTER_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';

// Environment variables
const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID || '';
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET || '';
const TWITTER_REDIRECT_URI = process.env.TWITTER_REDIRECT_URI || 'https://app.autocontentflow.repl.co/api/platforms/oauth/callback?platform=twitter';

// Token for PKCE (Proof Key for Code Exchange)
const generateCodeVerifier = (): string => {
  return crypto.randomBytes(32).toString('base64url');
};

const generateCodeChallenge = (verifier: string): string => {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
};

// Check if Twitter API keys are configured
const isTwitterConfigured = !!(TWITTER_CLIENT_ID && TWITTER_CLIENT_SECRET);

// Store code verifiers for authorization
const codeVerifiers = new Map<string, string>();

/**
 * Generates an OAuth URL for Twitter authentication
 * @param state CSRF protection token
 * @returns Twitter OAuth URL
 */
function generateOAuthUrl(state: string): string {
  if (!isTwitterConfigured) {
    throw new Error('Twitter API credentials not configured');
  }

  // Generate a code verifier for PKCE
  const codeVerifier = generateCodeVerifier();
  // Store the code verifier for later use
  codeVerifiers.set(state, codeVerifier);
  // Generate code challenge from the verifier
  const codeChallenge = generateCodeChallenge(codeVerifier);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: TWITTER_CLIENT_ID,
    redirect_uri: TWITTER_REDIRECT_URI,
    scope: 'tweet.read tweet.write users.read offline.access',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });

  return `${TWITTER_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchanges an authorization code for Twitter access tokens
 * @param code Authorization code from OAuth callback
 * @param state The state parameter used in the original request
 * @returns Object containing access token and refresh token
 */
async function exchangeCodeForTokens(code: string, state: string): Promise<{ access_token: string, refresh_token: string }> {
  if (!isTwitterConfigured) {
    throw new Error('Twitter API credentials not configured');
  }

  // Get the code verifier that matches this state
  const codeVerifier = codeVerifiers.get(state);
  if (!codeVerifier) {
    throw new Error('Invalid state parameter');
  }

  try {
    const params = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: TWITTER_CLIENT_ID,
      redirect_uri: TWITTER_REDIRECT_URI,
      code_verifier: codeVerifier
    });

    const response = await axios.post(TWITTER_TOKEN_URL, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64')}`
      }
    });

    // Clean up the stored code verifier
    codeVerifiers.delete(state);

    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token
    };
  } catch (error) {
    logger.error('Twitter token exchange error:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Twitter authentication failed: ${error.response.data.error_description || error.response.data.error || error.message}`);
    }
    throw new Error(`Twitter authentication failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Refreshes an expired Twitter access token
 * @param refreshToken The refresh token
 * @returns New access token and refresh token
 */
async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string, refresh_token: string }> {
  if (!isTwitterConfigured) {
    throw new Error('Twitter API credentials not configured');
  }

  try {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    });

    const response = await axios.post(TWITTER_TOKEN_URL, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64')}`
      }
    });

    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token || refreshToken
    };
  } catch (error) {
    logger.error('Twitter token refresh error:', error);
    throw new Error(`Failed to refresh Twitter token: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Gets the authenticated user's Twitter profile
 * @param accessToken Twitter access token
 * @returns User profile data
 */
async function getUserProfile(accessToken: string): Promise<any> {
  try {
    const response = await axios.get(`${TWITTER_API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        'user.fields': 'id,name,username,profile_image_url'
      }
    });
    
    return response.data.data;
  } catch (error) {
    logger.error('Twitter get user profile error:', error);
    throw new Error(`Failed to get Twitter profile: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Tests the Twitter API connection
 * @param platform Platform object with Twitter credentials
 * @returns Connection test result
 */
async function testConnection(platform: Platform): Promise<{ success: boolean, message: string }> {
  if (!isTwitterConfigured) {
    return { 
      success: false, 
      message: 'Twitter API credentials not configured in environment variables' 
    };
  }

  if (!platform.accessToken) {
    return { 
      success: false, 
      message: 'Twitter access token not found. Please authenticate with Twitter.' 
    };
  }

  try {
    // Try to get user profile to verify the token
    const profile = await getUserProfile(platform.accessToken);
    
    return {
      success: true,
      message: `Successfully connected to Twitter as @${profile.username}`
    };
  } catch (error) {
    logger.error('Twitter connection test error:', error);
    
    // Check if error is due to expired token
    if (axios.isAxiosError(error) && error.response?.status === 401 && platform.apiSecret) {
      try {
        // Try to refresh the token
        const refreshed = await refreshAccessToken(platform.apiSecret);
        // If we reach here, the refresh worked, but we'll still return false since the original token failed
        return {
          success: false,
          message: 'Twitter access token expired. Please re-authenticate with Twitter.'
        };
      } catch (refreshError) {
        return {
          success: false,
          message: 'Twitter authentication failed. Please re-authenticate with Twitter.'
        };
      }
    }
    
    return {
      success: false,
      message: `Twitter connection failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Creates a tweet
 * @param accessToken Twitter access token
 * @param text Tweet text
 * @param inReplyToId Optional ID of tweet to reply to
 * @param mediaIds Optional array of media IDs to attach
 * @returns Tweet data
 */
async function createTweet(
  accessToken: string,
  text: string,
  inReplyToId?: string,
  mediaIds?: string[]
): Promise<any> {
  try {
    const tweetData: any = {
      text: text.substring(0, 280) // Twitter's character limit is 280
    };

    if (inReplyToId) {
      tweetData.reply = { in_reply_to_tweet_id: inReplyToId };
    }

    if (mediaIds && mediaIds.length > 0) {
      tweetData.media = { media_ids: mediaIds };
    }

    const response = await axios.post(`${TWITTER_API_URL}/tweets`, tweetData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.data;
  } catch (error) {
    logger.error('Twitter create tweet error:', error);
    throw new Error(`Failed to create tweet: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Uploads media to Twitter
 * @param accessToken Twitter access token
 * @param mediaUrl URL of the media to upload
 * @returns Media ID
 */
async function uploadMedia(accessToken: string, mediaUrl: string): Promise<string> {
  // Twitter API v2 doesn't support direct media upload via the standard endpoint
  // You would need to use the v1.1 API for media uploads
  // This is a simplified implementation that you would need to expand
  throw new Error('Direct media upload not supported in this implementation');
}

/**
 * Splits text into a thread of tweets
 * @param text Long text to split into tweets
 * @param maxLength Maximum length per tweet (default: 280)
 * @returns Array of tweet texts
 */
function splitIntoThread(text: string, maxLength: number = 280): string[] {
  const words = text.split(' ');
  const tweets: string[] = [];
  let currentTweet = '';

  for (const word of words) {
    // Check if adding this word would exceed the limit
    if ((currentTweet + ' ' + word).length > maxLength) {
      // If the current tweet already has content, add it to the tweets array
      if (currentTweet) {
        tweets.push(currentTweet.trim());
        currentTweet = word;
      } else {
        // If the word itself is too long, truncate it
        const truncatedWord = word.substring(0, maxLength - 3) + '...';
        tweets.push(truncatedWord);
        currentTweet = '';
      }
    } else {
      // Add the word to the current tweet
      currentTweet += (currentTweet ? ' ' : '') + word;
    }
  }

  // Add the last tweet if there's content
  if (currentTweet) {
    tweets.push(currentTweet.trim());
  }

  // Numbering the tweets in the thread (e.g., 1/3, 2/3, 3/3)
  const totalTweets = tweets.length;
  if (totalTweets > 1) {
    return tweets.map((tweet, i) => {
      const suffix = ` (${i + 1}/${totalTweets})`;
      // Make sure we don't exceed the max length even with the suffix
      return tweet.substring(0, maxLength - suffix.length) + suffix;
    });
  }

  return tweets;
}

/**
 * Posts content to Twitter, creating a thread if necessary
 * @param platform Platform object with Twitter credentials
 * @param content The content to post
 * @param options Additional options for the post
 * @returns Post result with tweet ID and URL
 */
async function postContent(
  platform: Platform, 
  content: string,
  options: {
    mediaUrl?: string;
    asThread?: boolean;
  } = {}
): Promise<{ success: boolean, message: string, postId?: string, postUrl?: string }> {
  if (!platform.accessToken) {
    return {
      success: false,
      message: 'Twitter access token not found. Please authenticate with Twitter.'
    };
  }

  try {
    let mediaId;
    if (options.mediaUrl) {
      try {
        mediaId = await uploadMedia(platform.accessToken, options.mediaUrl);
      } catch (error) {
        logger.warn('Failed to upload media to Twitter:', error);
        // Continue without media if upload fails
      }
    }

    let tweet;
    let threadIds = [];

    // Check if content should be posted as a thread
    if (options.asThread || content.length > 280) {
      // Split content into thread-sized tweets
      const tweetTexts = splitIntoThread(content);
      
      // Post the thread
      let previousTweetId;
      for (const tweetText of tweetTexts) {
        if (!previousTweetId) {
          // First tweet in the thread
          tweet = await createTweet(
            platform.accessToken, 
            tweetText, 
            undefined, 
            mediaId ? [mediaId] : undefined
          );
          previousTweetId = tweet.id;
          threadIds.push(previousTweetId);
          
          // Only attach media to the first tweet
          mediaId = undefined;
        } else {
          // Reply to the previous tweet
          const replyTweet = await createTweet(
            platform.accessToken, 
            tweetText, 
            previousTweetId
          );
          previousTweetId = replyTweet.id;
          threadIds.push(previousTweetId);
        }
      }
    } else {
      // Post as a single tweet
      tweet = await createTweet(
        platform.accessToken, 
        content, 
        undefined, 
        mediaId ? [mediaId] : undefined
      );
      threadIds.push(tweet.id);
    }

    // Get the user's profile to construct the tweet URL
    const profile = await getUserProfile(platform.accessToken);
    const username = profile.username;

    return {
      success: true,
      message: threadIds.length > 1 
        ? `Successfully posted a thread of ${threadIds.length} tweets to Twitter` 
        : 'Successfully posted to Twitter',
      postId: threadIds[0],
      postUrl: `https://twitter.com/${username}/status/${threadIds[0]}`
    };
  } catch (error) {
    logger.error('Twitter post error:', error);
    
    // Handle expired token
    if (axios.isAxiosError(error) && error.response?.status === 401 && platform.apiSecret) {
      try {
        // Try to refresh the token and retry posting
        const refreshed = await refreshAccessToken(platform.apiSecret);
        // We would need to update the platform object with the new tokens in the database
        // and then retry the post, but for simplicity we'll just return an error
        return {
          success: false,
          message: 'Twitter access token expired. Please re-authenticate with Twitter.'
        };
      } catch (refreshError) {
        return {
          success: false,
          message: 'Twitter authentication failed. Please re-authenticate with Twitter.'
        };
      }
    }
    
    return {
      success: false,
      message: `Failed to post to Twitter: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Export the Twitter API module
export const twitterApi = {
  generateOAuthUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  testConnection,
  getUserProfile,
  createTweet,
  splitIntoThread,
  postContent
};