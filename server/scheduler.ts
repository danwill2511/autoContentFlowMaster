import { storage } from './storage';
import { InsertPost, Post } from '@shared/schema';
import cron from 'node-cron';
import { logger } from './logger';

/**
 * Scheduler service for handling post scheduling and dispatching
 * Uses smart time optimization to determine optimal posting times
 */
export class Scheduler {
  private scheduledTask: cron.ScheduledTask | null = null;

  constructor() {
    this.scheduledTask = null;
  }

  /**
   * Start the scheduler service
   * Runs every 5 minutes to check for posts that need to be published
   */
  public start(): void {
    // Run every 5 minutes
    this.scheduledTask = cron.schedule('*/5 * * * *', async () => {
      try {
        await this.processPendingPosts();
      } catch (error) {
        logger.error('Error processing pending posts', { error });
      }
    });

    logger.info('Post scheduler started');
  }

  /**
   * Stop the scheduler service
   */
  public stop(): void {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      this.scheduledTask = null;
      logger.info('Post scheduler stopped');
    }
  }

  /**
   * Process all pending posts that are due for publishing
   * @returns {Promise<void>}
   */
  private async processPendingPosts(): Promise<void> {
    const now = new Date();
    const pendingPosts = await storage.getPendingPostsDue(now);
    
    if (pendingPosts.length === 0) {
      return;
    }

    logger.info(`Processing ${pendingPosts.length} pending posts`);

    for (const post of pendingPosts) {
      try {
        await this.processPost(post);
      } catch (error) {
        logger.error(`Error processing post ${post.id}`, { error, postId: post.id });
      }
    }
  }

  /**
   * Process an individual post for publishing
   * @param {Post} post - The post to process
   * @returns {Promise<void>}
   */
  private async processPost(post: Post): Promise<void> {
    // Mark as processing
    await storage.updatePostStatus(post.id, 'processing');

    try {
      // Parse platform IDs from the stored JSON
      const platformIds = Array.isArray(post.platformIds) 
        ? post.platformIds 
        : JSON.parse(post.platformIds as string);

      // Get platforms for this post
      const platforms = await storage.getPlatformsByIds(platformIds);

      // Publish to each platform
      const publishResults = await Promise.allSettled(
        platforms.map(async (platform) => {
          // TODO: Add platform-specific publishing logic here
          // This would integrate with server/platforms/{platform}.ts files
          
          logger.info(`Publishing post ${post.id} to platform ${platform.name} (${platform.type})`);
          
          // Simple platform type-based routing example:
          // const platformModule = await import(`./platforms/${platform.type}`);
          // return await platformModule.publishContent(platform, post.content);
          
          // For now, just simulate success
          return { success: true, platformId: platform.id };
        })
      );

      // Process results
      const allSucceeded = publishResults.every(result => 
        result.status === 'fulfilled' && (result.value as any).success
      );
      
      // Gather engagement metrics
      const platformMetrics = publishResults
        .filter(result => result.status === 'fulfilled')
        .map(result => {
          const fulfilled = result as PromiseFulfilledResult<any>;
          return {
            platformId: fulfilled.value.platformId,
            success: fulfilled.value.success,
            metrics: fulfilled.value.metrics || {}
          };
        });

      // Update post status
      if (allSucceeded) {
        await storage.updatePostStatus(post.id, 'published', new Date());
        await storage.updatePostEngagementMetrics(post.id, { 
          platforms: platformMetrics,
          lastChecked: new Date()
        });
        
        logger.info(`Successfully published post ${post.id} to all platforms`);
      } else {
        await storage.updatePostStatus(post.id, 'partial_failure');
        await storage.updatePostEngagementMetrics(post.id, { 
          platforms: platformMetrics,
          lastChecked: new Date(),
          errors: publishResults
            .filter(result => result.status === 'rejected')
            .map(result => {
              const rejected = result as PromiseRejectedResult;
              return rejected.reason?.toString() || 'Unknown error';
            })
        });
        
        logger.warn(`Partially published post ${post.id}`, { 
          results: publishResults 
        });
      }
    } catch (error) {
      await storage.updatePostStatus(post.id, 'failed');
      logger.error(`Failed to publish post ${post.id}`, { error });
    }
  }

  /**
   * Schedule a new post based on optimal posting time
   * @param {number} workflowId - Workflow ID this post belongs to
   * @param {string} content - Content to be posted
   * @param {number[]} platformIds - Platforms to publish to
   * @param {Date} [scheduledFor] - Optional explicit schedule time (overrides optimization)
   * @returns {Promise<Post>} The created post
   */
  public async schedulePost(
    workflowId: number,
    content: string,
    platformIds: number[],
    scheduledFor?: Date
  ): Promise<Post> {
    try {
      // If no explicit schedule time, calculate optimal time
      let postTime: Date;
      let optimizationApplied = false;
      let optimizationData = null;
      
      if (!scheduledFor) {
        postTime = await storage.calculateOptimalPostTime(platformIds);
        optimizationApplied = true;
        optimizationData = {
          calculatedAt: new Date(),
          factors: {
            platformCount: platformIds.length,
            timeOfDay: postTime.getHours(),
          }
        };
      } else {
        postTime = scheduledFor;
      }

      // Create the post
      const postData: InsertPost = {
        workflowId,
        content,
        platformIds: JSON.stringify(platformIds),
        scheduledFor: postTime,
        status: 'scheduled',
        optimizationApplied,
        optimizationData: optimizationData ? JSON.stringify(optimizationData) : null
      };

      const post = await storage.createPost(postData);
      logger.info(`Scheduled post ${post.id} for ${postTime.toISOString()}`, {
        workflowId,
        platformCount: platformIds.length,
        optimized: optimizationApplied
      });

      return post;
    } catch (error) {
      logger.error('Failed to schedule post', { error, workflowId });
      throw error;
    }
  }

  /**
   * Manually trigger the processing of pending posts
   * This public method allows API endpoints to trigger the scheduler manually
   * @returns {Promise<number>} Number of processed posts
   */
  public async processPendingPostsManually(): Promise<number> {
    try {
      const now = new Date();
      const pendingPosts = await storage.getPendingPostsDue(now);
      
      if (pendingPosts.length === 0) {
        return 0;
      }
      
      logger.info(`Manually processing ${pendingPosts.length} pending posts`);
      
      for (const post of pendingPosts) {
        try {
          await this.processPost(post);
        } catch (error) {
          logger.error(`Error processing post ${post.id}`, { error, postId: post.id });
        }
      }
      
      return pendingPosts.length;
    } catch (error) {
      logger.error('Error manually processing pending posts', { error });
      throw error;
    }
  }

  /**
   * Update platform time optimization data based on post performance
   * @param {number} platformId - Platform ID
   * @param {any} engagementMetrics - Metrics data from the platform
   * @returns {Promise<void>}
   */
  public async updateOptimizationData(
    platformId: number,
    engagementMetrics: any
  ): Promise<void> {
    try {
      // Get platform and existing optimization data
      const platform = await storage.getPlatform(platformId);
      if (!platform) {
        throw new Error(`Platform with ID ${platformId} not found`);
      }

      let optimization = await storage.getTimeOptimizationByPlatform(platformId);
      const postedHour = new Date(engagementMetrics.postedAt).getHours();
      const postedDay = new Date(engagementMetrics.postedAt).getDay();
      
      // Calculate engagement score based on likes, comments, shares, etc.
      // This is a simplified example - in production you'd use a more complex formula
      const engagementScore = 
        (engagementMetrics.likes || 0) * 1 + 
        (engagementMetrics.comments || 0) * 2 + 
        (engagementMetrics.shares || 0) * 3 +
        (engagementMetrics.clicks || 0) * 1;
      
      if (optimization) {
        // Update existing optimization
        const bestHours = Array.isArray(optimization.bestHours) 
          ? optimization.bestHours 
          : JSON.parse(optimization.bestHours as string);
        
        const bestDays = Array.isArray(optimization.bestDays) 
          ? optimization.bestDays 
          : JSON.parse(optimization.bestDays as string);
        
        // Only update if this post performed well
        if (engagementScore > (optimization.engagementScore || 0)) {
          // Add this hour to the best hours if not already included
          if (!bestHours.includes(postedHour)) {
            bestHours.push(postedHour);
            // Keep only the top 5 hours
            if (bestHours.length > 5) {
              bestHours.sort((a: number, b: number) => a - b);
              bestHours.pop(); // Remove the last hour (highest)
            }
          }
          
          // Add this day to best days if not already included
          if (!bestDays.includes(postedDay)) {
            bestDays.push(postedDay);
          }
          
          await storage.updateTimeOptimization(optimization.id, {
            bestHours: JSON.stringify(bestHours),
            bestDays: JSON.stringify(bestDays),
            engagementScore
          });
        }
      } else {
        // Create new optimization record
        await storage.createTimeOptimization({
          platformId,
          platformType: platform.type,
          bestHours: JSON.stringify([postedHour]),
          bestDays: JSON.stringify([postedDay]),
          audienceTimezone: 'UTC', // Default, could be updated based on analytics
          engagementScore
        });
      }
      
      logger.info(`Updated optimization data for platform ${platformId}`, {
        engagementScore,
        postedHour,
        postedDay
      });
    } catch (error) {
      logger.error('Failed to update optimization data', { error, platformId });
    }
  }
}

// Content generation retry configuration
interface RetryConfig {
  maxAttempts: number;
  backoffMs: number;
  maxBackoffMs: number;
}

const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  backoffMs: 1000,
  maxBackoffMs: 10000
};

class ContentGenerationRetry {
  private retryCount: Map<string, number> = new Map();
  private lastAttempt: Map<string, number> = new Map();

  async executeWithRetry<T>(
    taskId: string,
    operation: () => Promise<T>,
    config: RetryConfig = defaultRetryConfig
  ): Promise<T> {
    try {
      const result = await operation();
      this.retryCount.delete(taskId);
      this.lastAttempt.delete(taskId);
      return result;
    } catch (error) {
      const attempts = (this.retryCount.get(taskId) || 0) + 1;
      this.retryCount.set(taskId, attempts);

      if (attempts >= config.maxAttempts) {
        this.retryCount.delete(taskId);
        this.lastAttempt.delete(taskId);
        throw new Error(`Failed after ${attempts} attempts: ${error.message}`);
      }

      const backoff = Math.min(
        config.backoffMs * Math.pow(2, attempts - 1),
        config.maxBackoffMs
      );

      await new Promise(resolve => setTimeout(resolve, backoff));
      return this.executeWithRetry(taskId, operation, config);
    }
  }
}

// Enhanced scheduler with retry mechanism
class EnhancedScheduler extends Scheduler {
  private retryHandler = new ContentGenerationRetry();

  async generateContent(taskId: string, prompt: string): Promise<string> {
    return this.retryHandler.executeWithRetry(taskId, async () => {
      // Existing content generation logic
      const content = await openai.generateContent(prompt);
      return content;
    });
  }
}

// Singleton instance of the enhanced scheduler
export const scheduler = new EnhancedScheduler();
import { setTimeout } from "timers/promises";

interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2
};

export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig = { ...defaultRetryConfig, ...config };
  let lastError: Error | null = null;
  let currentDelay = retryConfig.initialDelay;

  for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      if (attempt === retryConfig.maxAttempts) break;
      
      await setTimeout(currentDelay);
      currentDelay = Math.min(
        currentDelay * retryConfig.backoffMultiplier,
        retryConfig.maxDelay
      );
    }
  }

  throw lastError;
}

// Example usage in post scheduling
export async function schedulePost(post: any) {
  return executeWithRetry(
    async () => {
      // Existing post scheduling logic
      const result = await publishToSocialMedia(post);
      return result;
    },
    {
      maxAttempts: 5,
      initialDelay: 2000
    }
  );
}
