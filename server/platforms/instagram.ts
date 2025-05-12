/**
 * Instagram API Integration
 * 
 * This module provides functionality for interacting with the Instagram Graph API
 * for authenticating users and posting content.
 * 
 * Instagram API docs: https://developers.facebook.com/docs/instagram-api/
 */

import { Platform } from '@shared/schema';
import axios from 'axios';
import { URLSearchParams } from 'url';
import { logger } from '../logger';

// Instagram API configuration
const FACEBOOK_API_URL = 'https://graph.facebook.com/v18.0';
const FACEBOOK_AUTH_URL = 'https://www.facebook.com/v18.0/dialog/oauth';
const FACEBOOK_TOKEN_URL = 'https://graph.facebook.com/v18.0/oauth/access_token';

// Environment variables
const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID || '';
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET || '';
const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI || 'https://app.autocontentflow.repl.co/api/platforms/oauth/callback';

// Check if Instagram API keys are configured
const isInstagramConfigured = !!(INSTAGRAM_APP_ID && INSTAGRAM_APP_SECRET);

/**
 * Generates an OAuth URL for Instagram authentication
 * @param state CSRF protection token
 * @returns Instagram OAuth URL
 */
function generateOAuthUrl(state: string): string {
  if (!isInstagramConfigured) {
    throw new Error('Instagram API credentials not configured');
  }

  const params = new URLSearchParams({
    client_id: INSTAGRAM_APP_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'instagram_basic,instagram_content_publish,pages_read_engagement,pages_show_list',
    state
  });

  return `${FACEBOOK_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchanges an authorization code for Instagram access tokens
 * @param code Authorization code from OAuth callback
 * @returns Object containing access token
 */
async function exchangeCodeForTokens(code: string): Promise<{ access_token: string }> {
  if (!isInstagramConfigured) {
    throw new Error('Instagram API credentials not configured');
  }

  try {
    // First, exchange the code for a short-lived access token
    const params = new URLSearchParams({
      client_id: INSTAGRAM_APP_ID,
      client_secret: INSTAGRAM_APP_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    const response = await axios.get(`${FACEBOOK_TOKEN_URL}?${params.toString()}`);
    const shortLivedToken = response.data.access_token;

    // Then, exchange for a long-lived access token
    const longLivedParams = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: INSTAGRAM_APP_ID,
      client_secret: INSTAGRAM_APP_SECRET,
      fb_exchange_token: shortLivedToken
    });

    const longLivedResponse = await axios.get(`${FACEBOOK_TOKEN_URL}?${longLivedParams.toString()}`);

    return {
      access_token: longLivedResponse.data.access_token
    };
  } catch (error) {
    logger.error('Instagram token exchange error:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Instagram authentication failed: ${error.response.data.error.message || error.message}`);
    }
    throw new Error(`Instagram authentication failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Gets the user's Facebook pages that have Instagram Business accounts
 * @param accessToken Facebook access token
 * @returns Array of Facebook pages with Instagram accounts
 */
async function getInstagramAccounts(accessToken: string): Promise<any[]> {
  try {
    // First, get all user's Facebook pages
    const pagesResponse = await axios.get(`${FACEBOOK_API_URL}/me/accounts`, {
      params: {
        access_token: accessToken
      }
    });

    const pages = pagesResponse.data.data || [];
    const instagramAccounts = [];

    // For each page, check if it has an Instagram Business account
    for (const page of pages) {
      try {
        const igResponse = await axios.get(`${FACEBOOK_API_URL}/${page.id}`, {
          params: {
            fields: 'instagram_business_account',
            access_token: accessToken
          }
        });

        if (igResponse.data.instagram_business_account) {
          // Get Instagram account details
          const igAccountId = igResponse.data.instagram_business_account.id;
          const igAccountResponse = await axios.get(`${FACEBOOK_API_URL}/${igAccountId}`, {
            params: {
              fields: 'id,username,profile_picture_url',
              access_token: accessToken
            }
          });

          instagramAccounts.push({
            pageId: page.id,
            pageName: page.name,
            pageAccessToken: page.access_token,
            instagramAccountId: igAccountId,
            instagramUsername: igAccountResponse.data.username,
            profilePictureUrl: igAccountResponse.data.profile_picture_url
          });
        }
      } catch (error) {
        logger.warn(`Error fetching Instagram account for page ${page.id}:`, error);
      }
    }

    return instagramAccounts;
  } catch (error) {
    logger.error('Error fetching Instagram accounts:', error);
    throw new Error(`Failed to fetch Instagram accounts: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Tests the Instagram API connection
 * @param platform Platform object with Instagram credentials
 * @returns Connection test result
 */
async function testConnection(platform: Platform): Promise<{ success: boolean, message: string }> {
  if (!isInstagramConfigured) {
    return { 
      success: false, 
      message: 'Instagram API credentials not configured in environment variables' 
    };
  }

  if (!platform.accessToken) {
    return { 
      success: false, 
      message: 'Instagram access token not found. Please authenticate with Instagram.' 
    };
  }

  try {
    // Try to get Instagram accounts to verify the token
    const instagramAccounts = await getInstagramAccounts(platform.accessToken);
    
    if (instagramAccounts.length === 0) {
      return {
        success: false,
        message: 'No Instagram Business accounts found. You need to connect a Facebook page to an Instagram Business account.'
      };
    }

    return {
      success: true,
      message: `Successfully connected to Instagram as ${instagramAccounts[0].instagramUsername}`
    };
  } catch (error) {
    logger.error('Instagram connection test error:', error);
    
    return {
      success: false,
      message: `Instagram connection failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Creates and publishes a post on Instagram
 * @param platform Platform object with Instagram credentials
 * @param content The caption for the post
 * @param options Additional options for the post
 * @returns Post result with post ID and URL
 */
async function postContent(
  platform: Platform, 
  content: string,
  options: {
    imageUrl?: string;
    videoUrl?: string;
    instagramAccountId?: string;
  } = {}
): Promise<{ success: boolean, message: string, postId?: string, postUrl?: string }> {
  if (!platform.accessToken) {
    return {
      success: false,
      message: 'Instagram access token not found. Please authenticate with Instagram.'
    };
  }

  if (!options.imageUrl && !options.videoUrl) {
    return {
      success: false,
      message: 'No image or video URL provided. Instagram posts require media.'
    };
  }

  try {
    // Get Instagram account if not specified
    let instagramAccountId = options.instagramAccountId;
    if (!instagramAccountId) {
      const instagramAccounts = await getInstagramAccounts(platform.accessToken);
      if (instagramAccounts.length === 0) {
        return {
          success: false,
          message: 'No Instagram Business accounts found. You need to connect a Facebook page to an Instagram Business account.'
        };
      }
      instagramAccountId = instagramAccounts[0].instagramAccountId;
    }

    let mediaId;
    
    // Determine if posting image or video
    if (options.imageUrl) {
      // Create a container for the image
      const createResponse = await axios.post(`${FACEBOOK_API_URL}/${instagramAccountId}/media`, null, {
        params: {
          image_url: options.imageUrl,
          caption: content,
          access_token: platform.accessToken
        }
      });
      
      mediaId = createResponse.data.id;
    } else if (options.videoUrl) {
      // Create a container for the video
      const createResponse = await axios.post(`${FACEBOOK_API_URL}/${instagramAccountId}/media`, null, {
        params: {
          media_type: 'VIDEO',
          video_url: options.videoUrl,
          caption: content,
          access_token: platform.accessToken
        }
      });
      
      mediaId = createResponse.data.id;
      
      // Check the upload status until it's finished
      let status = 'IN_PROGRESS';
      while (status === 'IN_PROGRESS' || status === 'SCHEDULED') {
        const statusResponse = await axios.get(`${FACEBOOK_API_URL}/${mediaId}`, {
          params: {
            fields: 'status_code',
            access_token: platform.accessToken
          }
        });
        
        status = statusResponse.data.status_code;
        
        if (status === 'ERROR') {
          return {
            success: false,
            message: 'Error processing video for Instagram. Please check the video format and try again.'
          };
        }
        
        if (status === 'IN_PROGRESS' || status === 'SCHEDULED') {
          // Wait a bit before checking again
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }
    
    // Publish the container
    const publishResponse = await axios.post(`${FACEBOOK_API_URL}/${instagramAccountId}/media_publish`, null, {
      params: {
        creation_id: mediaId,
        access_token: platform.accessToken
      }
    });
    
    const postId = publishResponse.data.id;
    
    // Get the username to construct the post URL
    const accountResponse = await axios.get(`${FACEBOOK_API_URL}/${instagramAccountId}`, {
      params: {
        fields: 'username',
        access_token: platform.accessToken
      }
    });
    
    const username = accountResponse.data.username;
    
    return {
      success: true,
      message: 'Successfully posted to Instagram',
      postId,
      postUrl: `https://www.instagram.com/p/${postId}/`
    };
  } catch (error) {
    logger.error('Instagram post error:', error);
    
    return {
      success: false,
      message: `Failed to post to Instagram: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Export the Instagram API module
export const instagramApi = {
  generateOAuthUrl,
  exchangeCodeForTokens,
  testConnection,
  getInstagramAccounts,
  postContent
};