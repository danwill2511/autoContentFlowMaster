/**
 * Pinterest API Integration
 * 
 * This module provides functionality for interacting with the Pinterest API
 * for authenticating users and creating pins.
 * 
 * Pinterest API docs: https://developers.pinterest.com/docs/api/v5/
 */

import { Platform } from '@shared/schema';
import axios from 'axios';
import { URLSearchParams } from 'url';
import { logger } from '../logger';

// Pinterest API configuration
const PINTEREST_API_URL = 'https://api.pinterest.com/v5';
const PINTEREST_AUTH_URL = 'https://www.pinterest.com/oauth';

// Environment variables
const PINTEREST_APP_ID = process.env.PINTEREST_APP_ID || '';
const PINTEREST_APP_SECRET = process.env.PINTEREST_APP_SECRET || '';
const REDIRECT_URI = process.env.PINTEREST_REDIRECT_URI || 'https://app.autocontentflow.repl.co/api/platforms/oauth/callback?platform=pinterest';

// Check if Pinterest API keys are configured
const isPinterestConfigured = !!(PINTEREST_APP_ID && PINTEREST_APP_SECRET);

/**
 * Generates an OAuth URL for Pinterest authentication
 * @param state CSRF protection token
 * @returns Pinterest OAuth URL
 */
function generateOAuthUrl(state: string): string {
  if (!isPinterestConfigured) {
    throw new Error('Pinterest API credentials not configured');
  }

  const params = new URLSearchParams({
    client_id: PINTEREST_APP_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'boards:read,pins:read,pins:write',
    state
  });

  return `${PINTEREST_AUTH_URL}/authorize?${params.toString()}`;
}

/**
 * Exchanges an authorization code for Pinterest access tokens
 * @param code Authorization code from OAuth callback
 * @returns Object containing access token and refresh token
 */
async function exchangeCodeForTokens(code: string): Promise<{ access_token: string, refresh_token: string }> {
  if (!isPinterestConfigured) {
    throw new Error('Pinterest API credentials not configured');
  }

  try {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: PINTEREST_APP_ID,
      client_secret: PINTEREST_APP_SECRET
    });

    const response = await axios.post(`${PINTEREST_AUTH_URL}/token`, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token
    };
  } catch (error) {
    logger.error('Pinterest token exchange error:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Pinterest authentication failed: ${error.response.data.message || error.message}`);
    }
    throw new Error(`Pinterest authentication failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Refreshes an expired Pinterest access token
 * @param refreshToken The refresh token
 * @returns New access token and refresh token
 */
async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string, refresh_token: string }> {
  if (!isPinterestConfigured) {
    throw new Error('Pinterest API credentials not configured');
  }

  try {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: PINTEREST_APP_ID,
      client_secret: PINTEREST_APP_SECRET
    });

    const response = await axios.post(`${PINTEREST_AUTH_URL}/token`, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token
    };
  } catch (error) {
    logger.error('Pinterest token refresh error:', error);
    throw new Error(`Failed to refresh Pinterest token: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Gets user's Pinterest boards
 * @param accessToken Pinterest access token
 * @returns Array of user's boards
 */
async function getUserBoards(accessToken: string): Promise<any[]> {
  try {
    const response = await axios.get(`${PINTEREST_API_URL}/boards`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    return response.data.items || [];
  } catch (error) {
    logger.error('Pinterest get boards error:', error);
    throw new Error(`Failed to get Pinterest boards: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Tests the Pinterest API connection
 * @param platform Platform object with Pinterest credentials
 * @returns Connection test result
 */
async function testConnection(platform: Platform): Promise<{ success: boolean, message: string }> {
  if (!isPinterestConfigured) {
    return { 
      success: false, 
      message: 'Pinterest API credentials not configured in environment variables' 
    };
  }

  if (!platform.accessToken) {
    return { 
      success: false, 
      message: 'Pinterest access token not found. Please authenticate with Pinterest.' 
    };
  }

  try {
    // Try to get user's boards to verify the token
    const boards = await getUserBoards(platform.accessToken);
    
    return {
      success: true,
      message: `Successfully connected to Pinterest with ${boards.length} boards`
    };
  } catch (error) {
    logger.error('Pinterest connection test error:', error);
    
    // Check if error is due to expired token
    if (axios.isAxiosError(error) && error.response?.status === 401 && platform.apiSecret) {
      try {
        // Try to refresh the token
        const refreshed = await refreshAccessToken(platform.apiSecret);
        // If we reach here, the refresh worked, but we'll still return false since the original token failed
        return {
          success: false,
          message: 'Pinterest access token expired. Please re-authenticate with Pinterest.'
        };
      } catch (refreshError) {
        return {
          success: false,
          message: 'Pinterest authentication failed. Please re-authenticate with Pinterest.'
        };
      }
    }
    
    return {
      success: false,
      message: `Pinterest connection failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Creates a pin on Pinterest
 * @param platform Platform object with Pinterest credentials
 * @param content The description content for the pin
 * @param options Additional options for the pin
 * @returns Pin result with pin ID and URL
 */
async function postContent(
  platform: Platform, 
  content: string,
  options: {
    title?: string;
    boardId?: string;
    imageUrl: string;
    link?: string;
  }
): Promise<{ success: boolean, message: string, postId?: string, postUrl?: string }> {
  if (!platform.accessToken) {
    return {
      success: false,
      message: 'Pinterest access token not found. Please authenticate with Pinterest.'
    };
  }

  if (!options.imageUrl) {
    return {
      success: false,
      message: 'Image URL is required for Pinterest pins'
    };
  }

  try {
    let boardId = options.boardId;
    
    // If no board ID provided, get the first board from the user's account
    if (!boardId) {
      const boards = await getUserBoards(platform.accessToken);
      
      if (boards.length === 0) {
        return {
          success: false,
          message: 'No Pinterest boards found. Please create a board on Pinterest first.'
        };
      }
      
      boardId = boards[0].id;
    }

    // Create the pin
    const pinData = {
      board_id: boardId,
      media_source: {
        source_type: 'image_url',
        url: options.imageUrl
      },
      title: options.title || '',
      description: content,
      link: options.link || ''
    };

    const response = await axios.post(`${PINTEREST_API_URL}/pins`, pinData, {
      headers: {
        'Authorization': `Bearer ${platform.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const pinId = response.data.id;

    return {
      success: true,
      message: 'Successfully created pin on Pinterest',
      postId: pinId,
      postUrl: `https://www.pinterest.com/pin/${pinId}/`
    };
  } catch (error) {
    logger.error('Pinterest pin creation error:', error);
    
    // Handle expired token
    if (axios.isAxiosError(error) && error.response?.status === 401 && platform.apiSecret) {
      try {
        // Try to refresh the token and retry posting
        const refreshed = await refreshAccessToken(platform.apiSecret);
        // We would need to update the platform object with the new tokens in the database
        // and then retry the post, but for simplicity we'll just return an error
        return {
          success: false,
          message: 'Pinterest access token expired. Please re-authenticate with Pinterest.'
        };
      } catch (refreshError) {
        return {
          success: false,
          message: 'Pinterest authentication failed. Please re-authenticate with Pinterest.'
        };
      }
    }
    
    return {
      success: false,
      message: `Failed to create pin on Pinterest: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Formats content specifically for Pinterest
 * @param content Generic content to format
 * @param options Formatting options
 * @returns Pinterest-optimized content
 */
function formatContent(content: string, options: any = {}): string {
  // Pinterest works well with emojis and short paragraphs
  let formattedContent = content;
  
  // Keep it under Pinterest's description limit (500 characters)
  if (formattedContent.length > 500) {
    formattedContent = formattedContent.substring(0, 497) + '...';
  }
  
  // Add hashtags if requested
  if (options.addHashtags && options.hashtags) {
    const hashtags = Array.isArray(options.hashtags) 
      ? options.hashtags.join(' ') 
      : options.hashtags;
    
    formattedContent = `${formattedContent}\n\n${hashtags}`;
  }
  
  return formattedContent;
}

// Export the Pinterest API module
export const pinterestApi = {
  generateOAuthUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  testConnection,
  getUserBoards,
  postContent,
  formatContent
};