import { schedule } from "node-cron";
import { storage } from "./storage";
import { generateContent, generatePlatformSpecificContent } from "./openai";
import { Workflow, Post, subscriptionTiers, SubscriptionTier } from "@shared/schema";

// Initialize the scheduler
export function initScheduler() {
  console.log("Initializing content scheduler...");
  
  // Check for pending posts every 10 minutes
  schedule("*/10 * * * *", async () => {
    try {
      await checkAndProcessPendingPosts();
    } catch (error) {
      console.error("Error in post processing cron job:", error);
    }
  });
  
  // Check for workflows that need new posts to be generated daily at midnight
  schedule("0 0 * * *", async () => {
    try {
      await checkAndCreateScheduledPosts();
    } catch (error) {
      console.error("Error in workflow scheduling cron job:", error);
    }
  });
  
  // Update next post dates for workflows based on their frequency
  schedule("5 0 * * *", async () => {
    try {
      await updateWorkflowSchedules();
    } catch (error) {
      console.error("Error in workflow update cron job:", error);
    }
  });
}

// Process posts that are scheduled to be published now
async function checkAndProcessPendingPosts() {
  const now = new Date();
  const pendingPosts = await storage.getPendingPostsDue(now);
  
  console.log(`Found ${pendingPosts.length} posts to process`);
  
  for (const post of pendingPosts) {
    try {
      await processPost(post);
    } catch (error) {
      console.error(`Error processing post ${post.id}:`, error);
      await storage.updatePostStatus(post.id, "failed");
    }
  }
}

// Process an individual post for publishing
async function processPost(post: Post) {
  const workflow = await storage.getWorkflow(post.workflowId);
  if (!workflow) {
    throw new Error(`Workflow ${post.workflowId} not found for post ${post.id}`);
  }
  
  const platformIds = post.platformIds as number[];
  const platforms = await storage.getPlatformsByIds(platformIds);
  
  // Generate platform-specific content for each platform
  for (const platform of platforms) {
    try {
      // Format content specifically for this platform
      const platformContent = await generatePlatformSpecificContent(
        post.content,
        platform.name
      );
      
      // In a real app, we would post to the actual social media platforms here
      console.log(`Posting to ${platform.name} for workflow ${workflow.name}`);
      
      // Simulate posting to social media (in production this would use the actual APIs)
      // await postToSocialMedia(platform, platformContent);
      
      // For the implementation, we'll just log that it would have been posted
      console.log(`Successfully posted to ${platform.name}`);
    } catch (error) {
      console.error(`Error posting to ${platform.name}:`, error);
    }
  }
  
  // Update post status to published and set posted time
  await storage.updatePostStatus(post.id, "published", new Date());
}

// Create new posts for workflows that need them
async function checkAndCreateScheduledPosts() {
  const workflows = await storage.getActiveWorkflows();
  
  for (const workflow of workflows) {
    try {
      // Check if this workflow needs a new post today
      if (isPostDueToday(workflow)) {
        await createPostForWorkflow(workflow);
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
  try {
    // Get the user to check their subscription limits
    const user = await storage.getUser(workflow.userId);
    if (!user) {
      throw new Error(`User ${workflow.userId} not found for workflow ${workflow.id}`);
    }
    
    // Check daily post limit for the user's subscription tier
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
    
    // Generate content
    const content = await generateContent({
      contentType: workflow.contentType,
      contentTone: workflow.contentTone,
      topics: workflow.topics,
      platforms: platformNames
    });
    
    // Determine when to schedule the post (using the workflow's next post date)
    const scheduledDate = workflow.nextPostDate || new Date();
    
    // Create the post
    await storage.createPost({
      workflowId: workflow.id,
      content,
      status: "pending",
      scheduledFor: scheduledDate,
      platformIds: platformIds as any
    });
    
    console.log(`Created new post for workflow ${workflow.id}`);
  } catch (error) {
    console.error(`Error creating post for workflow ${workflow.id}:`, error);
    throw error;
  }
}

// Update the next post date for workflows based on frequency
async function updateWorkflowSchedules() {
  const workflows = await storage.getActiveWorkflows();
  
  for (const workflow of workflows) {
    try {
      // Calculate the next post date based on frequency
      const nextPostDate = calculateNextPostDate(workflow);
      
      // Update the workflow
      await storage.updateWorkflowNextPostDate(workflow.id, nextPostDate);
    } catch (error) {
      console.error(`Error updating schedule for workflow ${workflow.id}:`, error);
    }
  }
}

// Calculate the next post date based on workflow frequency
function calculateNextPostDate(workflow: Workflow): Date {
  const now = new Date();
  const currentNextPostDate = workflow.nextPostDate ? new Date(workflow.nextPostDate) : now;
  
  // If the current next post date is in the future, don't change it
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
      nextDate.setDate(nextDate.getDate() + 1); // Default to daily
  }
  
  return nextDate;
}
