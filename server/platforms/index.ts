import { Platform } from '@shared/schema';
import { logger } from '../logger';

// Import platform-specific API modules
import { pinterestApi } from './pinterest';
import { youtubeApi } from './youtube';
import { linkedinApi } from './linkedin';
import { instagramApi } from './instagram';
import { twitterApi } from './twitter';

// Map platform names to their API modules
const platformApis: Record<string, any> = {
  pinterest: pinterestApi,
  youtube: youtubeApi,
  linkedin: linkedinApi,
  instagram: instagramApi,
  twitter: twitterApi
};

/**
 * Generates an OAuth URL for a specific platform
 * @param platformName Name of the platform
 * @param state CSRF protection token
 * @returns OAuth URL for the platform
 */
export function generateOAuthUrl(platformName: string, state: string): string {
  const api = platformApis[platformName.toLowerCase()];
  
  if (!api || !api.generateOAuthUrl) {
    throw new Error(`Platform ${platformName} not supported or missing OAuth implementation`);
  }
  
  return api.generateOAuthUrl(state);
}

/**
 * Exchanges an authorization code for access tokens for a specific platform
 * @param code Authorization code from OAuth callback
 * @param state The state parameter used in the original request
 * @param platformName Optional name of the platform 
 * @returns Object containing access token and refresh token (if available)
 */
export async function exchangeCodeForTokens(
  code: string, 
  state?: string, 
  platformName?: string
): Promise<{ access_token: string, refresh_token?: string }> {
  // If platformName is provided, use the specific platform's exchange function
  if (platformName) {
    const api = platformApis[platformName.toLowerCase()];
    
    if (!api || !api.exchangeCodeForTokens) {
      throw new Error(`Platform ${platformName} not supported or missing OAuth implementation`);
    }
    
    // Some platforms require state for PKCE validation (like Twitter)
    if (state && api.exchangeCodeForTokens.length > 1) {
      return api.exchangeCodeForTokens(code, state);
    } else {
      return api.exchangeCodeForTokens(code);
    }
  }
  
  // If no platform name is provided, extract it from the state parameter (implementation specific)
  throw new Error('Platform name must be provided for token exchange');
}

/**
 * Tests a platform's API connection
 * @param platform Platform object with credentials
 * @returns Connection test result
 */
export async function testPlatformConnection(platform: Platform): Promise<{ success: boolean, message: string }> {
  const api = platformApis[platform.name.toLowerCase()];
  
  if (!api || !api.testConnection) {
    return {
      success: false,
      message: `Platform ${platform.name} not supported or missing test implementation`
    };
  }
  
  try {
    return await api.testConnection(platform);
  } catch (error) {
    logger.error(`Error testing ${platform.name} connection:`, error);
    return {
      success: false,
      message: `Error testing connection: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Posts content to a specific platform
 * @param platform Platform object with credentials
 * @param content The content to post
 * @param options Additional platform-specific options for the post
 * @returns Post result
 */
export async function postToPlatform(
  platform: Platform, 
  content: string,
  options: any = {}
): Promise<{ success: boolean, message: string, postId?: string, postUrl?: string }> {
  const api = platformApis[platform.name.toLowerCase()];
  
  if (!api || !api.postContent) {
    return {
      success: false,
      message: `Platform ${platform.name} not supported or missing posting implementation`
    };
  }
  
  try {
    return await api.postContent(platform, content, options);
  } catch (error) {
    logger.error(`Error posting to ${platform.name}:`, error);
    return {
      success: false,
      message: `Error posting content: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Creates platform-specific formatted content from generic content
 * @param platformName Name of the platform
 * @param content Generic content to format
 * @param options Additional formatting options
 * @returns Formatted content for the platform
 */
export function formatContentForPlatform(
  platformName: string, 
  content: string, 
  options: any = {}
): string {
  const api = platformApis[platformName.toLowerCase()];
  
  if (!api || !api.formatContent) {
    // If no specific formatter exists, just return the original content
    return content;
  }
  
  try {
    return api.formatContent(content, options);
  } catch (error) {
    logger.error(`Error formatting content for ${platformName}:`, error);
    return content;
  }
}