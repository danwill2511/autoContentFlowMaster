import { API_URL, DEFAULT_HEADERS } from '../utils/api';
import { 
  isOnline, 
  cacheData, 
  getCachedData, 
  queueAction,
  fetchWithOfflineSupport
} from '../utils/offlineSync';

export interface ContentGenerationOptions {
  contentType: string;
  contentTone: string;
  topics: string[];
  platforms: string[];
  length?: 'short' | 'medium' | 'long';
}

export interface ContentAdaptOptions {
  content: string;
  platform: string;
}

export interface PlatformContent {
  [platform: string]: string;
}

export interface GeneratedContent {
  general: string;
  platformVersions: PlatformContent;
  timestamp: number;
  topic: string;
  offline: boolean;
}

/**
 * Service for handling content generation with offline support
 */
export class ContentGenerationService {
  
  /**
   * Get trending topics with offline support
   * @param category The category to get trends for
   * @returns Array of trending topics and insights
   */
  static async getTrendingTopics(category: string): Promise<{topics: string[], insights: string}> {
    try {
      const cacheKey = `trends-${category}`;
      
      // Use fetchWithOfflineSupport to handle online/offline scenarios
      return await fetchWithOfflineSupport<{topics: string[], insights: string}>(
        `/api/trending-topics?category=${encodeURIComponent(category)}`,
        cacheKey,
        6 * 60 * 60 * 1000 // Cache for 6 hours
      );
    } catch (error) {
      console.error('Failed to get trending topics:', error);
      
      // If we can't get trending topics, return cached ones or empty array
      const cachedData = await getCachedData(`trends-${category}`);
      if (cachedData) {
        return cachedData;
      }
      
      // If no cache data, return an empty structure
      return {
        topics: [],
        insights: 'Unable to fetch trending topics. Please try again when online.'
      };
    }
  }
  
  /**
   * Generate content with offline support
   * @param options Content generation options
   * @returns Generated content
   */
  static async generateContent(options: ContentGenerationOptions): Promise<string> {
    try {
      const online = await isOnline();
      
      if (online) {
        // When online, use the API
        const response = await fetch(`${API_URL}/api/content/generate`, {
          method: 'POST',
          headers: DEFAULT_HEADERS,
          body: JSON.stringify(options),
        });
        
        if (!response.ok) {
          throw new Error('Failed to generate content');
        }
        
        const data = await response.json();
        
        // Cache the result with a key based on the options
        const cacheKey = this.getCacheKeyForOptions(options);
        await cacheData(cacheKey, data.content);
        
        return data.content;
      } else {
        // When offline, check for cached content for similar options
        const cacheKey = this.getCacheKeyForOptions(options);
        const cachedContent = await getCachedData(cacheKey);
        
        if (cachedContent) {
          return cachedContent;
        }
        
        // Queue the generation request for when we're back online
        await queueAction('/api/content/generate', 'POST', options);
        
        // Let user know we're offline
        throw new Error('Cannot generate new content while offline. Please try again when you have an internet connection.');
      }
    } catch (error) {
      console.error('Content generation error:', error);
      throw error;
    }
  }
  
  /**
   * Adapt content for a specific platform with offline support
   * @param options Content adaptation options
   * @returns Platform-specific content
   */
  static async adaptContentForPlatform(options: ContentAdaptOptions): Promise<string> {
    try {
      const online = await isOnline();
      
      if (online) {
        // When online, use the API
        const response = await fetch(`${API_URL}/api/content/adapt`, {
          method: 'POST',
          headers: DEFAULT_HEADERS,
          body: JSON.stringify(options),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to adapt content for ${options.platform}`);
        }
        
        const data = await response.json();
        
        // Cache the result
        const cacheKey = `adapt-${options.platform}-${this.hashString(options.content)}`;
        await cacheData(cacheKey, data.content);
        
        return data.content;
      } else {
        // When offline, check for cached adaptation
        const cacheKey = `adapt-${options.platform}-${this.hashString(options.content)}`;
        const cachedContent = await getCachedData(cacheKey);
        
        if (cachedContent) {
          return cachedContent;
        }
        
        // Queue the adaptation request for when we're back online
        await queueAction('/api/content/adapt', 'POST', options);
        
        // If no cached adaptation, use a basic platform adaptation algorithm
        return this.performOfflineContentAdaptation(options.content, options.platform);
      }
    } catch (error) {
      console.error(`Content adaptation error for ${options.platform}:`, error);
      
      // If adaptation fails, use a basic platform adaptation algorithm
      return this.performOfflineContentAdaptation(options.content, options.platform);
    }
  }
  
  /**
   * Generate platform-specific content for all specified platforms
   * @param content The general content
   * @param platforms Array of platform names
   * @returns Object mapping platforms to adapted content
   */
  static async generateAllPlatformVersions(
    content: string,
    platforms: string[]
  ): Promise<PlatformContent> {
    const platformVersions: PlatformContent = {};
    
    for (const platform of platforms) {
      try {
        const adaptedContent = await this.adaptContentForPlatform({
          content,
          platform
        });
        
        platformVersions[platform] = adaptedContent;
      } catch (error) {
        console.error(`Failed to adapt for ${platform}:`, error);
        platformVersions[platform] = this.performOfflineContentAdaptation(content, platform);
      }
    }
    
    return platformVersions;
  }
  
  /**
   * Get a cached content generation if available, or generate new content
   * @param options Content generation options
   * @param platforms Platforms to generate for
   * @returns Generated content with platform versions
   */
  static async getOrGenerateContent(
    options: ContentGenerationOptions
  ): Promise<GeneratedContent> {
    try {
      const online = await isOnline();
      const cacheKey = this.getCacheKeyForOptions(options);
      const cachedGeneratedContent = await getCachedData(`full-${cacheKey}`);
      
      // If we have cached full content, return it
      if (cachedGeneratedContent) {
        return {
          ...cachedGeneratedContent,
          offline: !online
        };
      }
      
      // Generate new content
      const generalContent = await this.generateContent(options);
      
      // Generate platform-specific versions
      const platformVersions = await this.generateAllPlatformVersions(
        generalContent,
        options.platforms
      );
      
      // Create the complete content object
      const generatedContent: GeneratedContent = {
        general: generalContent,
        platformVersions,
        timestamp: Date.now(),
        topic: options.topics.join(', '),
        offline: !online
      };
      
      // Cache the complete content
      await cacheData(`full-${cacheKey}`, generatedContent);
      
      return generatedContent;
    } catch (error) {
      console.error('Error in getOrGenerateContent:', error);
      
      // Try to get any cached content for similar options
      const similarCacheKey = this.getSimilarCacheKey(options);
      const cachedContent = await getCachedData(`full-${similarCacheKey}`);
      
      if (cachedContent) {
        return {
          ...cachedContent,
          offline: true
        };
      }
      
      throw error;
    }
  }
  
  /**
   * Basic offline content adaptation for when API is unavailable
   * @param content Original content
   * @param platform Target platform
   * @returns Adapted content
   */
  private static performOfflineContentAdaptation(content: string, platform: string): string {
    // This is a fallback offline adaptation method
    // It applies basic platform-specific formatting rules
    
    // Basic character limits by platform
    const characterLimits: {[key: string]: number} = {
      'twitter': 280,
      'instagram': 2200,
      'linkedin': 3000,
      'facebook': 5000,
      'pinterest': 500,
    };
    
    // Get limit for this platform (default to 1000)
    const limit = characterLimits[platform.toLowerCase()] || 1000;
    
    // Truncate if needed
    let adaptedContent = content;
    if (content.length > limit) {
      adaptedContent = content.substring(0, limit - 3) + '...';
    }
    
    // Add platform-specific formatting
    switch (platform.toLowerCase()) {
      case 'twitter':
        // Add hashtags for Twitter
        const hashtags = this.generateHashtags(content, 3);
        adaptedContent = `${adaptedContent}\n\n${hashtags}`;
        break;
        
      case 'instagram':
        // Add hashtags and line breaks for Instagram
        const igHashtags = this.generateHashtags(content, 5);
        adaptedContent = `${adaptedContent}\n\n${igHashtags}`;
        break;
        
      case 'linkedin':
        // Make slightly more professional for LinkedIn
        adaptedContent = adaptedContent.replace(/!+/g, '.');
        break;
    }
    
    return adaptedContent;
  }
  
  /**
   * Generate hashtags from content
   * @param content Text to generate hashtags from
   * @param count Number of hashtags to generate
   * @returns String of hashtags
   */
  private static generateHashtags(content: string, count: number): string {
    const words = content
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && word.length < 15)
      .map(word => word.replace(/[^a-z0-9]/g, ''));
    
    const uniqueWords = Array.from(new Set(words));
    const hashtags = uniqueWords
      .slice(0, count)
      .map(word => `#${word}`);
    
    return hashtags.join(' ');
  }
  
  /**
   * Create a cache key based on content generation options
   * @param options Content generation options
   * @returns Cache key string
   */
  private static getCacheKeyForOptions(options: ContentGenerationOptions): string {
    return `content-${options.contentType}-${options.contentTone}-${this.hashString(options.topics.join(','))}`;
  }
  
  /**
   * Find a similar cache key for when exact match isn't available
   * @param options Content generation options
   * @returns Similar cache key
   */
  private static getSimilarCacheKey(options: ContentGenerationOptions): string {
    // Just use content type and tone as a fallback
    return `content-${options.contentType}-${options.contentTone}`;
  }
  
  /**
   * Simple string hashing function
   * @param str String to hash
   * @returns Hash as string
   */
  private static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }
}

export default ContentGenerationService;