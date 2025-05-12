
import { schedule } from "node-cron";
import { storage } from "./storage";
import { generateContent, generatePlatformSpecificContent } from "./openai";
import { Workflow, Post, subscriptionTiers, SubscriptionTier } from "@shared/schema";

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Helper function for exponential backoff retry
async function withRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = INITIAL_RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying operation in ${delay}ms. Attempts remaining: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

// Initialize the scheduler
export function initScheduler() {
  console.log("Initializing content scheduler...");
  
  // Check for pending posts every 10 minutes
  schedule("*/10 * * * *", async () => {
    try {
      await checkAndProcessPendingPosts();
    } catch (error) {
      console.error("Critical error in post processing cron job:", error);
    }
  });
  
  // Check for workflows that need new posts daily at midnight
  schedule("0 0 * * *", async () => {
    try {
      await checkAndCreateScheduledPosts();
    } catch (error) {
      console.error("Critical error in workflow scheduling cron job:", error);
    }
  });
  
  // Update next post dates for workflows
  schedule("5 0 * * *", async () => {
    try {
      await updateWorkflowSchedules();
    } catch (error) {
      console.error("Critical error in workflow update cron job:", error);
    }
  });
}

// Process posts that are scheduled to be published
async function checkAndProcessPendingPosts() {
  const now = new Date();
  let pendingPosts: Post[] = [];
  
  try {
    pendingPosts = await storage.getPendingPostsDue(now);
    console.log(`Found ${pendingPosts.length} posts to process`);
  } catch (error) {
    console.error("Error fetching pending posts:", error);
    return;
  }
  
  for (const post of pendingPosts) {
    try {
      await withRetry(() => processPost(post));
    } catch (error) {
      console.error(`Failed to process post ${post.id} after all retries:`, error);
      await logFailedPost(post, error);
    }
  }
}

// Process an individual post for publishing
async function processPost(post: Post) {
  const logger = console;
  logger.info(`Processing post ${post.id} for workflow ${post.workflowId}`);
  
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount < maxRetries) {
    try {
  
  const workflow = await storage.getWorkflow(post.workflowId);
  if (!workflow) {
    throw new Error(`Workflow ${post.workflowId} not found for post ${post.id}`);
  }
  
  const platformIds = post.platformIds as number[];
  const platforms = await storage.getPlatformsByIds(platformIds);
  
  const errors: Array<{ platform: string; error: Error }> = [];
  
  // Generate platform-specific content for each platform
  for (const platform of platforms) {
    try {
      // Format content specifically for this platform
      const platformContent = await withRetry(() => 
        generatePlatformSpecificContent(post.content, platform.name)
      );
      
      // In a real app, we would post to the actual social media platforms here
      console.log(`Successfully formatted content for ${platform.name} (Post ID: ${post.id})`);
      
      // Log successful processing
      await logPostSuccess(post, platform.name);
    } catch (error) {
      console.error(`Error posting to ${platform.name}:`, error);
      errors.push({ platform: platform.name, error: error as Error });
    }
  }
  
  // Update post status based on results
  if (errors.length === platforms.length) {
    // All platforms failed
    await storage.updatePostStatus(post.id, "failed");
    throw new Error(`Failed to post to all platforms: ${errors.map(e => e.platform).join(", ")}`);
  } else if (errors.length > 0) {
    // Some platforms failed
    await storage.updatePostStatus(post.id, "partial_success", new Date());
  } else {
    // All successful
    await storage.updatePostStatus(post.id, "published", new Date());
  }
}

// Log failed post attempts
async function logFailedPost(post: Post, error: any) {
  const errorLog = {
    postId: post.id,
    workflowId: post.workflowId,
    timestamp: new Date(),
    error: error.message,
    stack: error.stack
  };
  
  // In production, you might want to store these in a database table
  console.error("Failed post log:", errorLog);
  
  // Update post status to failed
  await storage.updatePostStatus(post.id, "failed");
}

// Log successful post
async function logPostSuccess(post: Post, platform: string) {
  const successLog = {
    postId: post.id,
    workflowId: post.workflowId,
    platform,
    timestamp: new Date()
  };
  
  // In production, you might want to store these in a database table
  console.log("Successful post log:", successLog);
}

// Create new posts for workflows that need them
async function checkAndCreateScheduledPosts() {
  let workflows: Workflow[] = [];
  
  try {
    workflows = await storage.getActiveWorkflows();
  } catch (error) {
    console.error("Error fetching active workflows:", error);
    return;
  }
  
  for (const workflow of workflows) {
    try {
      if (isPostDueToday(workflow)) {
        await withRetry(() => createPostForWorkflow(workflow));
      }
    } catch (error) {
      console.error(`Error creating post for workflow ${workflow.id}:`, error);
    }
  }
}

// Determine if a post is due today for this workflow
function isPostDueToday(workflow: Workflow): boolean {
  if (!workflow.nextPostDate) return false;
  
  const today = new Date();
  const nextPostDate = new Date(workflow.nextPostDate);
  
  return (
    nextPostDate.getFullYear() === today.getFullYear() &&
    nextPostDate.getMonth() === today.getMonth() &&
    nextPostDate.getDate() === today.getDate()
  );
}

// Create a new post for a workflow
async function createPostForWorkflow(workflow: Workflow) {
  console.log(`Creating new post for workflow ${workflow.id}`);
  
  try {
    const user = await storage.getUser(workflow.userId);
    if (!user) {
      throw new Error(`User ${workflow.userId} not found for workflow ${workflow.id}`);
    }
    
    // Check daily post limit
    const postsToday = await storage.getPostsCreatedTodayCount(workflow.userId);
    const tier = user.subscription as SubscriptionTier;
    const limit = subscriptionTiers[tier].dailyPostLimit;
    
    if (postsToday >= limit) {
      console.log(`Daily post limit (${limit}) reached for user ${user.id} with ${tier} subscription`);
      return;
    }
    
    // Get platforms for this workflow
    const workflowPlatforms = await storage.getWorkflowPlatforms(workflow.id);
    const platformIds = workflowPlatforms.map(wp => wp.platformId);
    const platforms = await storage.getPlatformsByIds(platformIds);
    const platformNames = platforms.map(p => p.name);
    
    // Generate content with retry mechanism
    const content = await withRetry(() => generateContent({
      contentType: workflow.contentType,
      contentTone: workflow.contentTone,
      topics: workflow.topics,
      platforms: platformNames
    }));
    
    // Create the post
    const scheduledDate = workflow.nextPostDate || new Date();
    await storage.createPost({
      workflowId: workflow.id,
      content,
      status: "pending",
      scheduledFor: scheduledDate,
      platformIds: platformIds as any
    });
    
    console.log(`Successfully created new post for workflow ${workflow.id}`);
  } catch (error) {
    console.error(`Error creating post for workflow ${workflow.id}:`, error);
    throw error;
  }
}

// Update workflow schedules
async function updateWorkflowSchedules() {
  let workflows: Workflow[] = [];
  
  try {
    workflows = await storage.getActiveWorkflows();
  } catch (error) {
    console.error("Error fetching workflows for schedule update:", error);
    return;
  }
  
  for (const workflow of workflows) {
    try {
      const nextPostDate = calculateNextPostDate(workflow);
      await storage.updateWorkflowNextPostDate(workflow.id, nextPostDate);
    } catch (error) {
      console.error(`Error updating schedule for workflow ${workflow.id}:`, error);
    }
  }
}

// Calculate next post date
function calculateNextPostDate(workflow: Workflow): Date {
  const now = new Date();
  const currentNextPostDate = workflow.nextPostDate ? new Date(workflow.nextPostDate) : now;
  
  if (currentNextPostDate > now) {
    return currentNextPostDate;
  }
  
  const nextDate = new Date(currentNextPostDate);
  
  switch (workflow.frequency) {
    case "daily":
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case "weekly":
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case "bi-weekly":
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case "monthly":
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    default:
      nextDate.setDate(nextDate.getDate() + 1);
  }
  
  return nextDate;
}
