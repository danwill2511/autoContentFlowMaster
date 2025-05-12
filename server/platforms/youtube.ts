/**
 * YouTube API Integration
 * 
 * This module provides functionality for interacting with the YouTube API
 * for authenticating users and uploading videos.
 * 
 * YouTube API docs: https://developers.google.com/youtube/v3/docs
 */

import { Platform } from '@shared/schema';
import axios from 'axios';
import { URLSearchParams } from 'url';
import { logger } from '../logger';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

// YouTube API configuration
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// Environment variables
const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID || '';
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.YOUTUBE_REDIRECT_URI || 'https://app.autocontentflow.repl.co/api/platforms/oauth/callback?platform=youtube';

// Check if YouTube API keys are configured
const isYouTubeConfigured = !!(YOUTUBE_CLIENT_ID && YOUTUBE_CLIENT_SECRET);

/**
 * Generates an OAuth URL for YouTube authentication
 * @param state CSRF protection token
 * @returns YouTube OAuth URL
 */
function generateOAuthUrl(state: string): string {
  if (!isYouTubeConfigured) {
    throw new Error('YouTube API credentials not configured');
  }

  const params = new URLSearchParams({
    client_id: YOUTUBE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube',
    access_type: 'offline',
    state,
    prompt: 'consent'
  });

  return `${GOOGLE_AUTH_URL}/auth?${params.toString()}`;
}

/**
 * Exchanges an authorization code for YouTube access tokens
 * @param code Authorization code from OAuth callback
 * @returns Object containing access token and refresh token
 */
async function exchangeCodeForTokens(code: string): Promise<{ access_token: string, refresh_token: string }> {
  if (!isYouTubeConfigured) {
    throw new Error('YouTube API credentials not configured');
  }

  try {
    const params = new URLSearchParams({
      code,
      client_id: YOUTUBE_CLIENT_ID,
      client_secret: YOUTUBE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    const response = await axios.post(GOOGLE_TOKEN_URL, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token
    };
  } catch (error) {
    logger.error('YouTube token exchange error:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`YouTube authentication failed: ${error.response.data.error_description || error.response.data.error || error.message}`);
    }
    throw new Error(`YouTube authentication failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Refreshes an expired YouTube access token
 * @param refreshToken The refresh token
 * @returns New access token
 */
async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string }> {
  if (!isYouTubeConfigured) {
    throw new Error('YouTube API credentials not configured');
  }

  try {
    const params = new URLSearchParams({
      refresh_token: refreshToken,
      client_id: YOUTUBE_CLIENT_ID,
      client_secret: YOUTUBE_CLIENT_SECRET,
      grant_type: 'refresh_token'
    });

    const response = await axios.post(GOOGLE_TOKEN_URL, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return {
      access_token: response.data.access_token
    };
  } catch (error) {
    logger.error('YouTube token refresh error:', error);
    throw new Error(`Failed to refresh YouTube token: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Tests the YouTube API connection
 * @param platform Platform object with YouTube credentials
 * @returns Connection test result
 */
async function testConnection(platform: Platform): Promise<{ success: boolean, message: string }> {
  if (!isYouTubeConfigured) {
    return { 
      success: false, 
      message: 'YouTube API credentials not configured in environment variables' 
    };
  }

  if (!platform.accessToken) {
    return { 
      success: false, 
      message: 'YouTube access token not found. Please authenticate with YouTube.' 
    };
  }

  try {
    // Try to get channel data to verify the token
    const response = await axios.get(`${YOUTUBE_API_URL}/channels`, {
      params: {
        part: 'snippet',
        mine: true
      },
      headers: {
        'Authorization': `Bearer ${platform.accessToken}`
      }
    });

    if (response.data.items && response.data.items.length > 0) {
      const channelTitle = response.data.items[0].snippet.title;
      return {
        success: true,
        message: `Successfully connected to YouTube channel: ${channelTitle}`
      };
    }

    return {
      success: true,
      message: 'Successfully connected to YouTube, but no channels found'
    };
  } catch (error) {
    logger.error('YouTube connection test error:', error);
    
    // Check if error is due to expired token
    if (axios.isAxiosError(error) && error.response?.status === 401 && platform.apiSecret) {
      try {
        // Try to refresh the token
        const refreshed = await refreshAccessToken(platform.apiSecret);
        // If we reach here, the refresh worked, but we'll still return false since the original token failed
        return {
          success: false,
          message: 'YouTube access token expired. Please re-authenticate with YouTube.'
        };
      } catch (refreshError) {
        return {
          success: false,
          message: 'YouTube authentication failed. Please re-authenticate with YouTube.'
        };
      }
    }
    
    return {
      success: false,
      message: `YouTube connection failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Uploads a video to YouTube
 * @param platform Platform object with YouTube credentials
 * @param content The description content
 * @param options Additional options for the video upload
 * @returns Upload result with video ID and URL
 */
async function postContent(
  platform: Platform, 
  content: string,
  options: {
    title: string;
    videoFilePath?: string;
    videoUrl?: string;
    tags?: string[];
    categoryId?: string;
    privacyStatus?: 'private' | 'unlisted' | 'public';
    thumbnailFilePath?: string;
  }
): Promise<{ success: boolean, message: string, postId?: string, postUrl?: string }> {
  if (!platform.accessToken) {
    return {
      success: false,
      message: 'YouTube access token not found. Please authenticate with YouTube.'
    };
  }

  if (!options.videoFilePath && !options.videoUrl) {
    return {
      success: false,
      message: 'No video file path or URL provided. Please provide a video to upload.'
    };
  }

  if (!options.title) {
    return {
      success: false,
      message: 'No video title provided. Please provide a title for the video.'
    };
  }

  try {
    // If we have a URL instead of a file path, we'd need to download the video first
    let videoPath = options.videoFilePath;
    if (!videoPath && options.videoUrl) {
      // Implement video download logic here if needed
      return {
        success: false,
        message: 'Video URL upload is not yet supported. Please provide a video file path.'
      };
    }

    // Prepare the video metadata
    const videoMetadata = {
      snippet: {
        title: options.title.substring(0, 100), // YouTube title limit
        description: content.substring(0, 5000), // YouTube description limit
        tags: options.tags?.slice(0, 500) || [], // YouTube tag limit
        categoryId: options.categoryId || '22' // 22 is "People & Blogs"
      },
      status: {
        privacyStatus: options.privacyStatus || 'private',
        selfDeclaredMadeForKids: false
      }
    };

    // Initialize video upload
    const initResponse = await axios.post(`${YOUTUBE_API_URL}/videos`, videoMetadata, {
      params: {
        part: 'snippet,status',
        uploadType: 'resumable'
      },
      headers: {
        'Authorization': `Bearer ${platform.accessToken}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': 'video/*'
      }
    });

    const uploadUrl = initResponse.headers.location;

    // Upload the video file
    if (!videoPath) {
      return {
        success: false,
        message: 'Video file path not provided.'
      };
    }

    const videoStat = fs.statSync(videoPath);
    const videoStream = fs.createReadStream(videoPath);

    const uploadResponse = await axios.put(uploadUrl, videoStream, {
      headers: {
        'Content-Length': videoStat.size.toString(),
        'Content-Type': 'video/*'
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });

    const videoId = uploadResponse.data.id;

    // Upload thumbnail if provided
    if (options.thumbnailFilePath) {
      const form = new FormData();
      form.append('image', fs.createReadStream(options.thumbnailFilePath));

      await axios.post(`${YOUTUBE_API_URL}/thumbnails/set`, form, {
        params: {
          videoId,
          uploadType: 'media'
        },
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${platform.accessToken}`
        }
      });
    }

    return {
      success: true,
      message: 'Successfully uploaded video to YouTube',
      postId: videoId,
      postUrl: `https://www.youtube.com/watch?v=${videoId}`
    };
  } catch (error) {
    logger.error('YouTube upload error:', error);
    
    // Handle expired token
    if (axios.isAxiosError(error) && error.response?.status === 401 && platform.apiSecret) {
      try {
        // Try to refresh the token and retry uploading
        const refreshed = await refreshAccessToken(platform.apiSecret);
        // We would need to update the platform object with the new tokens in the database
        // and then retry the upload, but for simplicity we'll just return an error
        return {
          success: false,
          message: 'YouTube access token expired. Please re-authenticate with YouTube.'
        };
      } catch (refreshError) {
        return {
          success: false,
          message: 'YouTube authentication failed. Please re-authenticate with YouTube.'
        };
      }
    }
    
    return {
      success: false,
      message: `Failed to upload video to YouTube: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Export the YouTube API module
export const youtubeApi = {
  generateOAuthUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  testConnection,
  postContent
};