import { API_URL, DEFAULT_HEADERS } from '../utils/api';
import { 
  isOnline, 
  cacheData, 
  getCachedData, 
  queueAction,
  fetchWithOfflineSupport
} from '../utils/offlineSync';

export interface ScheduledPost {
  id?: number;
  content: string;
  platforms: string[];
  scheduledFor: Date;
  status: 'pending' | 'published' | 'failed';
  workflowId?: number;
  offlineId?: string;
}

/**
 * Service for handling post scheduling with offline support
 */
export class SchedulerService {
  
  private static POSTS_CACHE_KEY = 'scheduled_posts';
  
  /**
   * Get all scheduled posts with offline support
   * @returns Array of scheduled posts
   */
  static async getScheduledPosts(): Promise<ScheduledPost[]> {
    try {
      const online = await isOnline();
      
      if (online) {
        // When online, fetch fresh data from API
        const response = await fetch(`${API_URL}/api/posts/scheduled`, {
          headers: DEFAULT_HEADERS,
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch scheduled posts');
        }
        
        const posts = await response.json();
        
        // Cache the fetched posts
        await cacheData(this.POSTS_CACHE_KEY, posts);
        
        return posts;
      } else {
        // When offline, get from cache
        const cachedPosts = await getCachedData(this.POSTS_CACHE_KEY);
        return cachedPosts || [];
      }
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      
      // Fall back to cache on error
      const cachedPosts = await getCachedData(this.POSTS_CACHE_KEY);
      return cachedPosts || [];
    }
  }
  
  /**
   * Get locally created posts that haven't been synced yet
   * @returns Array of offline scheduled posts
   */
  static async getOfflinePosts(): Promise<ScheduledPost[]> {
    const offlinePosts = await getCachedData('offline_scheduled_posts');
    return offlinePosts || [];
  }
  
  /**
   * Schedule a new post with offline support
   * @param post The post to schedule
   * @returns Created post with ID
   */
  static async schedulePost(post: Omit<ScheduledPost, 'id' | 'status' | 'offlineId'>): Promise<ScheduledPost> {
    try {
      const online = await isOnline();
      
      if (online) {
        // When online, use the API
        const response = await fetch(`${API_URL}/api/posts/schedule`, {
          method: 'POST',
          headers: DEFAULT_HEADERS,
          body: JSON.stringify(post),
        });
        
        if (!response.ok) {
          throw new Error('Failed to schedule post');
        }
        
        const createdPost = await response.json();
        
        // Update the cache with the new post
        await this.addPostToCache(createdPost);
        
        return createdPost;
      } else {
        // When offline, create a local post with a temporary ID
        const offlineId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const offlinePost: ScheduledPost = {
          ...post,
          status: 'pending',
          offlineId,
        };
        
        // Add to offline posts
        await this.addOfflinePost(offlinePost);
        
        // Queue for syncing when back online
        await queueAction('/api/posts/schedule', 'POST', post);
        
        return offlinePost;
      }
    } catch (error) {
      console.error('Error scheduling post:', error);
      
      // If API call fails, save as offline post
      const offlineId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const offlinePost: ScheduledPost = {
        ...post,
        status: 'pending',
        offlineId,
      };
      
      // Add to offline posts
      await this.addOfflinePost(offlinePost);
      
      // Queue for syncing when back online
      await queueAction('/api/posts/schedule', 'POST', post);
      
      return offlinePost;
    }
  }
  
  /**
   * Cancel a scheduled post with offline support
   * @param postId ID of the post to cancel
   * @returns Success status
   */
  static async cancelScheduledPost(postId: number | string): Promise<boolean> {
    try {
      // If it's an offline post (string ID), just remove it from local storage
      if (typeof postId === 'string' && postId.startsWith('offline_')) {
        await this.removeOfflinePost(postId);
        return true;
      }
      
      const online = await isOnline();
      
      if (online) {
        // When online, use the API
        const response = await fetch(`${API_URL}/api/posts/${postId}/cancel`, {
          method: 'POST',
          headers: DEFAULT_HEADERS,
        });
        
        if (!response.ok) {
          throw new Error('Failed to cancel post');
        }
        
        // Update the cache
        await this.removePostFromCache(postId as number);
        
        return true;
      } else {
        // When offline, queue the cancellation for later
        await queueAction(`/api/posts/${postId}/cancel`, 'POST', {});
        
        // Optimistically update the cache
        await this.updatePostStatusInCache(postId as number, 'failed');
        
        return true;
      }
    } catch (error) {
      console.error('Error canceling post:', error);
      
      // Queue the cancellation for later
      await queueAction(`/api/posts/${postId}/cancel`, 'POST', {});
      
      return false;
    }
  }
  
  /**
   * Reschedule a post for a new time with offline support
   * @param postId ID of the post to reschedule
   * @param newScheduledTime New time to schedule for
   * @returns Updated post
   */
  static async reschedulePost(postId: number | string, newScheduledTime: Date): Promise<ScheduledPost | null> {
    try {
      // Handle offline posts
      if (typeof postId === 'string' && postId.startsWith('offline_')) {
        return await this.rescheduleOfflinePost(postId, newScheduledTime);
      }
      
      const online = await isOnline();
      
      if (online) {
        // When online, use the API
        const response = await fetch(`${API_URL}/api/posts/${postId}/reschedule`, {
          method: 'POST',
          headers: DEFAULT_HEADERS,
          body: JSON.stringify({ scheduledFor: newScheduledTime.toISOString() }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to reschedule post');
        }
        
        const updatedPost = await response.json();
        
        // Update the cache
        await this.updatePostInCache(updatedPost);
        
        return updatedPost;
      } else {
        // When offline, queue the rescheduling for later
        await queueAction(`/api/posts/${postId}/reschedule`, 'POST', { 
          scheduledFor: newScheduledTime.toISOString() 
        });
        
        // Optimistically update the cache
        const posts = await getCachedData(this.POSTS_CACHE_KEY) || [];
        const updatedPosts = posts.map((post: ScheduledPost) => {
          if (post.id === postId) {
            return { ...post, scheduledFor: newScheduledTime };
          }
          return post;
        });
        
        await cacheData(this.POSTS_CACHE_KEY, updatedPosts);
        
        // Return the updated post (if we can find it)
        const updatedPost = updatedPosts.find((p: ScheduledPost) => p.id === postId);
        return updatedPost || null;
      }
    } catch (error) {
      console.error('Error rescheduling post:', error);
      
      // Queue the rescheduling for later
      await queueAction(`/api/posts/${postId}/reschedule`, 'POST', { 
        scheduledFor: newScheduledTime.toISOString() 
      });
      
      return null;
    }
  }
  
  /**
   * Sync offline posts with the server when back online
   * @returns Number of successfully synced posts
   */
  static async syncOfflinePosts(): Promise<number> {
    try {
      const online = await isOnline();
      
      if (!online) {
        return 0; // Can't sync when offline
      }
      
      const offlinePosts = await this.getOfflinePosts();
      if (offlinePosts.length === 0) {
        return 0; // No posts to sync
      }
      
      let syncedCount = 0;
      
      for (const post of offlinePosts) {
        try {
          // Create the post on the server
          const { content, platforms, scheduledFor, workflowId } = post;
          
          const response = await fetch(`${API_URL}/api/posts/schedule`, {
            method: 'POST',
            headers: DEFAULT_HEADERS,
            body: JSON.stringify({
              content,
              platforms,
              scheduledFor,
              workflowId
            }),
          });
          
          if (response.ok) {
            syncedCount++;
            
            // Remove from offline posts
            await this.removeOfflinePost(post.offlineId!);
            
            // Add to regular cache
            const createdPost = await response.json();
            await this.addPostToCache(createdPost);
          }
        } catch (error) {
          console.error(`Failed to sync offline post ${post.offlineId}:`, error);
        }
      }
      
      return syncedCount;
    } catch (error) {
      console.error('Error syncing offline posts:', error);
      return 0;
    }
  }
  
  /**
   * Add a post to the cache
   * @param post Post to add
   */
  private static async addPostToCache(post: ScheduledPost): Promise<void> {
    const posts = await getCachedData(this.POSTS_CACHE_KEY) || [];
    posts.push(post);
    await cacheData(this.POSTS_CACHE_KEY, posts);
  }
  
  /**
   * Remove a post from the cache
   * @param postId ID of post to remove
   */
  private static async removePostFromCache(postId: number): Promise<void> {
    const posts = await getCachedData(this.POSTS_CACHE_KEY) || [];
    const updatedPosts = posts.filter((post: ScheduledPost) => post.id !== postId);
    await cacheData(this.POSTS_CACHE_KEY, updatedPosts);
  }
  
  /**
   * Update a post in the cache
   * @param updatedPost Updated post object
   */
  private static async updatePostInCache(updatedPost: ScheduledPost): Promise<void> {
    const posts = await getCachedData(this.POSTS_CACHE_KEY) || [];
    const updatedPosts = posts.map((post: ScheduledPost) => {
      if (post.id === updatedPost.id) {
        return updatedPost;
      }
      return post;
    });
    await cacheData(this.POSTS_CACHE_KEY, updatedPosts);
  }
  
  /**
   * Update post status in the cache
   * @param postId ID of post to update
   * @param status New status
   */
  private static async updatePostStatusInCache(postId: number, status: ScheduledPost['status']): Promise<void> {
    const posts = await getCachedData(this.POSTS_CACHE_KEY) || [];
    const updatedPosts = posts.map((post: ScheduledPost) => {
      if (post.id === postId) {
        return { ...post, status };
      }
      return post;
    });
    await cacheData(this.POSTS_CACHE_KEY, updatedPosts);
  }
  
  /**
   * Add a post to offline storage
   * @param post Post to add
   */
  private static async addOfflinePost(post: ScheduledPost): Promise<void> {
    const offlinePosts = await getCachedData('offline_scheduled_posts') || [];
    offlinePosts.push(post);
    await cacheData('offline_scheduled_posts', offlinePosts);
  }
  
  /**
   * Remove a post from offline storage
   * @param offlineId Offline ID of post to remove
   */
  private static async removeOfflinePost(offlineId: string): Promise<void> {
    const offlinePosts = await getCachedData('offline_scheduled_posts') || [];
    const updatedPosts = offlinePosts.filter((post: ScheduledPost) => post.offlineId !== offlineId);
    await cacheData('offline_scheduled_posts', updatedPosts);
  }
  
  /**
   * Reschedule an offline post
   * @param offlineId Offline ID of post to reschedule
   * @param newScheduledTime New scheduled time
   * @returns Updated post
   */
  private static async rescheduleOfflinePost(offlineId: string, newScheduledTime: Date): Promise<ScheduledPost | null> {
    const offlinePosts = await getCachedData('offline_scheduled_posts') || [];
    const updatedPosts = offlinePosts.map((post: ScheduledPost) => {
      if (post.offlineId === offlineId) {
        return { ...post, scheduledFor: newScheduledTime };
      }
      return post;
    });
    
    await cacheData('offline_scheduled_posts', updatedPosts);
    
    const updatedPost = updatedPosts.find((p: ScheduledPost) => p.offlineId === offlineId);
    return updatedPost || null;
  }
}

export default SchedulerService;