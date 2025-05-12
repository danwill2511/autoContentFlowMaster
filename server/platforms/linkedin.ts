/**
 * LinkedIn API Integration
 * 
 * This module provides functionality for interacting with the LinkedIn API
 * for authenticating users and posting content to company pages.
 * 
 * LinkedIn API docs: https://learn.microsoft.com/en-us/linkedin/marketing/
 */

import { Platform } from '@shared/schema';
import axios from 'axios';
import { URLSearchParams } from 'url';
import { logger } from '../logger';

// LinkedIn API configuration
const LINKEDIN_API_URL = 'https://api.linkedin.com/v2';
const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2';

// Environment variables
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || '';
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || 'https://app.autocontentflow.repl.co/api/platforms/oauth/callback?platform=linkedin';

// Check if LinkedIn API keys are configured
const isLinkedInConfigured = !!(LINKEDIN_CLIENT_ID && LINKEDIN_CLIENT_SECRET);

/**
 * Generates an OAuth URL for LinkedIn authentication
 * @param state CSRF protection token
 * @returns LinkedIn OAuth URL
 */
function generateOAuthUrl(state: string): string {
  if (!isLinkedInConfigured) {
    throw new Error('LinkedIn API credentials not configured');
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    state,
    scope: 'r_liteprofile w_member_social r_organization_social w_organization_social rw_organization_admin'
  });

  return `${LINKEDIN_AUTH_URL}/authorization?${params.toString()}`;
}

/**
 * Exchanges an authorization code for LinkedIn access tokens
 * @param code Authorization code from OAuth callback
 * @returns Object containing access token and refresh token (if available)
 */
async function exchangeCodeForTokens(code: string): Promise<{ access_token: string, refresh_token?: string }> {
  if (!isLinkedInConfigured) {
    throw new Error('LinkedIn API credentials not configured');
  }

  try {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: LINKEDIN_CLIENT_ID,
      client_secret: LINKEDIN_CLIENT_SECRET
    });

    const response = await axios.post(`${LINKEDIN_AUTH_URL}/accessToken`, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return {
      access_token: response.data.access_token,
      // LinkedIn might not always return a refresh token
      refresh_token: response.data.refresh_token
    };
  } catch (error) {
    logger.error('LinkedIn token exchange error:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`LinkedIn authentication failed: ${error.response.data.error_description || error.response.data.error || error.message}`);
    }
    throw new Error(`LinkedIn authentication failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Gets the current user's LinkedIn profile
 * @param accessToken LinkedIn access token
 * @returns User profile data
 */
async function getUserProfile(accessToken: string): Promise<any> {
  try {
    const response = await axios.get(`${LINKEDIN_API_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (error) {
    logger.error('LinkedIn get user profile error:', error);
    throw new Error(`Failed to get LinkedIn profile: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Gets the user's LinkedIn company pages
 * @param accessToken LinkedIn access token
 * @returns Array of company pages
 */
async function getCompanyPages(accessToken: string): Promise<any[]> {
  try {
    // First, get the person URN (user ID)
    const profile = await getUserProfile(accessToken);
    const personId = profile.id;

    // Then, get the organizations (company pages) the user admin for
    const response = await axios.get(`${LINKEDIN_API_URL}/organizationAcls`, {
      params: {
        q: 'roleAssignee',
        roleAssignee: `urn:li:person:${personId}`,
        role: 'ADMINISTRATOR',
        state: 'APPROVED'
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const orgUrns = response.data.elements.map((element: any) => element.organization);
    
    // Now get details for each organization
    const companyPages = [];
    for (const orgUrn of orgUrns) {
      const orgId = orgUrn.split(':').pop();
      const orgDetailsResponse = await axios.get(`${LINKEDIN_API_URL}/organizations/${orgId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      companyPages.push(orgDetailsResponse.data);
    }

    return companyPages;
  } catch (error) {
    logger.error('LinkedIn get company pages error:', error);
    throw new Error(`Failed to get LinkedIn company pages: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Tests the LinkedIn API connection
 * @param platform Platform object with LinkedIn credentials
 * @returns Connection test result
 */
async function testConnection(platform: Platform): Promise<{ success: boolean, message: string }> {
  if (!isLinkedInConfigured) {
    return { 
      success: false, 
      message: 'LinkedIn API credentials not configured in environment variables' 
    };
  }

  if (!platform.accessToken) {
    return { 
      success: false, 
      message: 'LinkedIn access token not found. Please authenticate with LinkedIn.' 
    };
  }

  try {
    // Try to get user profile to verify the token
    const profile = await getUserProfile(platform.accessToken);
    
    // Check if user has admin access to any company pages
    const companyPages = await getCompanyPages(platform.accessToken);
    
    if (companyPages.length === 0) {
      return {
        success: true,
        message: 'Connected to LinkedIn, but no company pages found with admin access. You need admin access to at least one company page to post content.'
      };
    }

    return {
      success: true,
      message: `Successfully connected to LinkedIn with admin access to ${companyPages.length} company page(s)`
    };
  } catch (error) {
    logger.error('LinkedIn connection test error:', error);
    
    return {
      success: false,
      message: `LinkedIn connection failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Posts content to a LinkedIn company page
 * @param platform Platform object with LinkedIn credentials
 * @param content The content to post
 * @param options Additional options for the post
 * @returns Post result with activity ID and URL
 */
async function postContent(
  platform: Platform, 
  content: string,
  options: {
    companyId?: string;
    imageUrl?: string;
    articleUrl?: string;
    title?: string;
    linkDescription?: string;
  } = {}
): Promise<{ success: boolean, message: string, postId?: string, postUrl?: string }> {
  if (!platform.accessToken) {
    return {
      success: false,
      message: 'LinkedIn access token not found. Please authenticate with LinkedIn.'
    };
  }

  try {
    // If no company ID provided, get the first company page
    let companyId = options.companyId;
    if (!companyId) {
      const companyPages = await getCompanyPages(platform.accessToken);
      if (companyPages.length === 0) {
        return {
          success: false,
          message: 'No LinkedIn company pages found with admin access. You need admin access to at least one company page to post content.'
        };
      }
      companyId = companyPages[0].id;
    }

    // Prepare the post data
    let postData: any = {
      author: `urn:li:organization:${companyId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    // Add media if provided
    if (options.imageUrl) {
      postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE';
      postData.specificContent['com.linkedin.ugc.ShareContent'].media = [
        {
          status: 'READY',
          description: {
            text: options.title || 'Image'
          },
          media: options.imageUrl,
          title: {
            text: options.title || 'Image'
          }
        }
      ];
    } else if (options.articleUrl) {
      postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'ARTICLE';
      postData.specificContent['com.linkedin.ugc.ShareContent'].media = [
        {
          status: 'READY',
          description: {
            text: options.linkDescription || 'Article'
          },
          originalUrl: options.articleUrl,
          title: {
            text: options.title || 'Article'
          }
        }
      ];
    }

    // Create the post
    const response = await axios.post(`${LINKEDIN_API_URL}/ugcPosts`, postData, {
      headers: {
        'Authorization': `Bearer ${platform.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    // Get the post ID
    const postId = response.data.id;
    const postUrn = postId.split(':').pop();

    return {
      success: true,
      message: 'Successfully posted to LinkedIn company page',
      postId,
      postUrl: `https://www.linkedin.com/feed/update/${postUrn}/`
    };
  } catch (error) {
    logger.error('LinkedIn post error:', error);
    
    return {
      success: false,
      message: `Failed to post to LinkedIn: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Export the LinkedIn API module
export const linkedinApi = {
  generateOAuthUrl,
  exchangeCodeForTokens,
  testConnection,
  getUserProfile,
  getCompanyPages,
  postContent
};