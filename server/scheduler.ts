import { storage } from "./storage";
import { logger } from "./logger";
import { Post, type InsertPost } from "@shared/schema";
import * as cron from "node-cron";

/**
 * Simplified Scheduler service for handling post scheduling and dispatching
 */
export class Scheduler {
  private scheduledTask: cron.ScheduledTask | null = null;

  /**
   * Start the scheduler service
   * Runs every 5 minutes to check for posts that need to be published
   */
  public start(): void {
    try {
      // Schedule task to run every 5 minutes
      this.scheduledTask = cron.schedule('*/5 * * * *', async () => {
        await this.processPendingPosts();
      });
      logger.info('Scheduler service started successfully');
    } catch (error) {
      logger.error('Failed to start scheduler service', { error });
    }
  }

  /**
   * Stop the scheduler service
   */
  public stop(): void {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      this.scheduledTask = null;
      logger.info('Scheduler service stopped');
    }
  }

  /**
   * Process all pending posts that are due for publishing
   */
  private async processPendingPosts(): Promise<void> {
    try {
      const now = new Date();
      
      // Get all pending posts that are due
      const pendingPosts = await storage.getPendingPostsDue(now);
      
      if (pendingPosts.length > 0) {
        logger.info(`Processing ${pendingPosts.length} pending posts`);
      }
    } catch (error) {
      logger.error('Error processing pending posts', { error });
    }
  }

  /**
   * Schedule a new post 
   */
  public async schedulePost(
    workflowId: number,
    content: string,
    platformIds: number[],
    scheduledFor?: Date
  ): Promise<Post> {
    try {
      // Fetch the workflow to get strategy settings
      const workflow = await storage.getWorkflow(workflowId);
      
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }
      
      // Default scheduling for now + 1 hour
      const postTime = scheduledFor || new Date(Date.now() + 3600000);
      
      // Create the post record
      const postData: InsertPost = {
        workflowId,
        content,
        platformIds,
        scheduledFor: postTime,
        status: 'pending',
        optimizationApplied: false,
        optimizationData: null,
        engagementMetrics: null
      };
      
      const post = await storage.createPost(postData);
      logger.info(`Scheduled post ${post.id} for workflow ${workflowId}`);
      
      return post;
    } catch (error) {
      logger.error('Failed to schedule post', { error, workflowId });
      throw error;
    }
  }
}

// Singleton instance of the scheduler
export const scheduler = new Scheduler();