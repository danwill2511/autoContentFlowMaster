/**
 * Pinterest API Integration
 * 
 * This module provides functionality for interacting with the Pinterest API
 * for authenticating users and posting content.
 * 
 * Pinterest API docs: https://developers.pinterest.com/docs/api/v5/
 */

import { Platform } from '@shared/schema';
import axios from 'axios';
import { URLSearchParams } from 'url';
import { logger } from '../logger';

// Pinterest API configuration
const PINTEREST_API_VERSION = 'v5';
const PINTEREST_API_URL = `https://api.pinterest.com/${PINTEREST_API_VERSION}`;
const PINTEREST_AUTH_URL = 'https://www.pinterest.com/oauth/';

// Environment variables
const PINTEREST_CLIENT_ID = process.env.PINTEREST_CLIENT_ID || '';
const PINTEREST_CLIENT_SECRET = process.env.PINTEREST_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.PINTEREST_REDIRECT_URI || 'https://app.autocontentflow.repl.co/api/platforms/oauth/callback';

// Check if Pinterest API keys are configured
const isPinterestConfigured = !!(PINTEREST_CLIENT_ID && PINTEREST_CLIENT_SECRET);

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
    client_id: PINTEREST_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'boards:read,pins:read,pins:write',
    state
  });

  return `${PINTEREST_AUTH_URL}authorize?${params.toString()}`;
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
      client_id: PINTEREST_CLIENT_ID,
      client_secret: PINTEREST_CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI
    });

    const response = await axios.post(`${PINTEREST_AUTH_URL}token`, params.toString(), {
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
      throw new Error(`Pinterest authentication failed: ${error.response.data.error_description || error.response.data.error || error.message}`);
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
      client_id: PINTEREST_CLIENT_ID,
      client_secret: PINTEREST_CLIENT_SECRET,
      refresh_token: refreshToken
    });

    const response = await axios.post(`${PINTEREST_AUTH_URL}token`, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token || refreshToken
    };
  } catch (error) {
    logger.error('Pinterest token refresh error:', error);
    throw new Error(`Failed to refresh Pinterest token: ${error instanceof Error ? error.message : String(error)}`);
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
    // Try to get user data to verify the token
    const response = await axios.get(`${PINTEREST_API_URL}/user_account`, {
      headers: {
        'Authorization': `Bearer ${platform.accessToken}`
      }
    });

    return {
      success: true,
      message: `Successfully connected to Pinterest as ${response.data.username || 'user'}`
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
 * Gets the user's Pinterest boards
 * @param accessToken Pinterest access token
 * @returns Array of board objects
 */
async function getBoards(accessToken: string): Promise<any[]> {
  try {
    const response = await axios.get(`${PINTEREST_API_URL}/boards`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        page_size: 100
      }
    });
    
    return response.data.items || [];
  } catch (error) {
    logger.error('Error fetching Pinterest boards:', error);
    throw new Error(`Failed to fetch Pinterest boards: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Creates a new Pinterest pin
 * @param platform Platform object with Pinterest credentials
 * @param content The content to post
 * @param options Additional options (board, media URL, alt text, etc.)
 * @returns Post result with pin ID and URL
 */
async function postContent(
  platform: Platform, 
  content: string, 
  options: {
    title?: string;
    boardId?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    altText?: string;
  } = {}
): Promise<{ success: boolean, message: string, postId?: string, postUrl?: string }> {
  if (!platform.accessToken) {
    return {
      success: false,
      message: 'Pinterest access token not found. Please authenticate with Pinterest.'
    };
  }

  try {
    // If no boardId was provided, get the first available board
    let boardId = options.boardId;
    if (!boardId) {
      const boards = await getBoards(platform.accessToken);
      if (boards.length === 0) {
        return {
          success: false,
          message: 'No Pinterest boards found. Please create a board on Pinterest first.'
        };
      }
      boardId = boards[0].id;
    }

    // Prepare the pin data
    const pinData: any = {
      board_id: boardId,
      description: content.substring(0, 500), // Pinterest limit is 500 chars
      media_source: {
        source_type: options.mediaType === 'video' ? 'video_url' : 'image_url',
        url: options.mediaUrl || 'https://source.unsplash.com/random/800x600/?nature'
      },
      alt_text: options.altText || ''
    };

    if (options.title) {
      pinData.title = options.title.substring(0, 100); // Pinterest limit is 100 chars
    }

    // Create the pin
    const response = await axios.post(`${PINTEREST_API_URL}/pins`, pinData, {
      headers: {
        'Authorization': `Bearer ${platform.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    // Return success information
    const pinId = response.data.id;
    return {
      success: true,
      message: 'Successfully posted to Pinterest',
      postId: pinId,
      postUrl: `https://www.pinterest.com/pin/${pinId}/`
    };
  } catch (error) {
    logger.error('Pinterest post error:', error);
    
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
      message: `Failed to post to Pinterest: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Export the Pinterest API module
export const pinterestApi = {
  generateOAuthUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  testConnection,
  getBoards,
  postContent
};