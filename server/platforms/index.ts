/**
 * Platform Integration Module
 * 
 * This module provides a unified interface for interacting with various social media platforms.
 * Each platform has its own implementation that handles authentication and content posting.
 */

import { randomBytes } from 'crypto';
import { Platform } from '@shared/schema';
import { pinterestApi } from './pinterest';
import { youtubeApi } from './youtube';
import { linkedinApi } from './linkedin';
import { instagramApi } from './instagram';
import { twitterApi } from './twitter';
import { logger } from '../logger';

// Map platform names to their respective API implementations
const platformApis: Record<string, any> = {
  'Pinterest': pinterestApi,
  'YouTube': youtubeApi,
  'LinkedIn': linkedinApi,
  'Instagram': instagramApi,
  'Twitter': twitterApi,
};

/**
 * Generates an OAuth URL for a specific platform
 * @param platform The platform name (e.g., 'Pinterest', 'YouTube')
 * @param state A random state string for CSRF protection
 * @returns The authorization URL
 */
export function generateOAuthUrl(platform: string, state: string): string {
  const platformApi = platformApis[platform];
  if (!platformApi || !platformApi.generateOAuthUrl) {
    throw new Error(`OAuth not supported for platform: ${platform}`);
  }
  return platformApi.generateOAuthUrl(state);
}

/**
 * Exchanges an authorization code for access and refresh tokens
 * @param platform The platform name
 * @param code The authorization code from the OAuth callback
 * @returns Object containing access_token and refresh_token
 */
export async function exchangeCodeForTokens(platform: string, code: string): Promise<{ access_token: string, refresh_token?: string }> {
  const platformApi = platformApis[platform];
  if (!platformApi || !platformApi.exchangeCodeForTokens) {
    throw new Error(`OAuth token exchange not supported for platform: ${platform}`);
  }
  return platformApi.exchangeCodeForTokens(code);
}

/**
 * Tests the connection to a platform using the stored credentials
 * @param platform The platform object with authentication details
 * @returns Object containing success status and any additional info
 */
export async function testPlatformConnection(platform: Platform): Promise<{ success: boolean, message: string, status: string }> {
  const platformApi = platformApis[platform.name];
  if (!platformApi || !platformApi.testConnection) {
    return { 
      success: false, 
      message: `Testing not implemented for platform: ${platform.name}`,
      status: 'error'
    };
  }
  
  try {
    const result = await platformApi.testConnection(platform);
    return {
      ...result,
      status: result.success ? 'connected' : 'error'
    };
  } catch (error) {
    return {
      success: false,
      message: `Error testing connection: ${error instanceof Error ? error.message : String(error)}`,
      status: 'error'
    };
  }
}

/**
 * Posts content to a specific platform
 * @param platform The platform object with authentication details
 * @param content The content to post
 * @param options Additional platform-specific options
 * @returns Object containing success status and post information
 */
export async function postToPlatform(
  platform: Platform, 
  content: string, 
  options: Record<string, any> = {}
): Promise<{ success: boolean, message: string, postId?: string, postUrl?: string }> {
  const platformApi = platformApis[platform.name];
  if (!platformApi || !platformApi.postContent) {
    return { 
      success: false, 
      message: `Posting not implemented for platform: ${platform.name}`
    };
  }
  
  try {
    return await platformApi.postContent(platform, content, options);
  } catch (error) {
    logger.error(`Error posting to ${platform.name}:`, error);
    return {
      success: false,
      message: `Error posting to ${platform.name}: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}