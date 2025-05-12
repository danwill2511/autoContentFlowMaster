import { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { generateContent, generatePlatformSpecificContent, findTrendingTopics, generateTemplatePreviewImage } from "./openai";
import { scheduler } from "./scheduler";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { insertWorkflowSchema, insertPlatformSchema, insertWorkflowPlatformSchema, subscriptionTiers, SubscriptionTier } from "@shared/schema";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { randomBytes } from "crypto";
import { generateOAuthUrl, exchangeCodeForTokens, testPlatformConnection, postToPlatform } from "./platforms";

// Helper function to get Replit user data from request headers
function getReplitUser(req: Request) {
  if (req.headers["x-replit-user-id"]) {
    return {
      id: req.headers["x-replit-user-id"] as string,
      name: req.headers["x-replit-user-name"] as string,
      profileImage: req.headers["x-replit-user-profile-image"] as string,
      bio: req.headers["x-replit-user-bio"] as string,
      url: req.headers["x-replit-user-url"] as string,
      roles: req.headers["x-replit-user-roles"] ? 
        (req.headers["x-replit-user-roles"] as string).split(',') : 
        undefined,
      teams: req.headers["x-replit-user-teams"] ? 
        (req.headers["x-replit-user-teams"] as string).split(',') : 
        undefined,
    };
  }
  return null;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Initialize the scheduler for automated content creation and posting
  // Note: The scheduler is now started in server/index.ts after the server is listening
  // scheduler.start();

  // PayPal routes
  app.get("/api/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/api/paypal/order", async (req, res) => {
    await createPaypalOrder(req, res);
  });

  app.post("/api/paypal/order/:orderID/capture", async (req, res) => {
    try {
      const result = await capturePaypalOrder(req, res);

      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Extract subscription details from the order
      const orderData = result.purchase_units[0];
      const amount = orderData.amount.value;

      // Determine subscription tier based on amount
      let newTier: SubscriptionTier = "free";
      if (amount === "758" || amount === "79") newTier = "business";
      else if (amount === "278" || amount === "29") newTier = "pro";
      else if (amount === "134" || amount === "14") newTier = "essential";

      // Update user's subscription
      await storage.updateUserSubscription(req.user.id, newTier);

      res.json(result);
    } catch (error) {
      console.error("Payment capture error:", error);
      res.status(500).json({ error: "Failed to process payment" });
    }
  });

  // PayPal webhook handler
  app.post("/api/paypal/webhook", async (req, res) => {
    try {
      const event = req.body;

      switch (event.event_type) {
        case 'PAYMENT.CAPTURE.COMPLETED':
          // Payment successful
          break;

        case 'PAYMENT.CAPTURE.DENIED':
          // Payment failed
          const userId = event.resource.custom_id;
          await storage.updateUserSubscription(userId, "free");
          break;

        case 'BILLING.SUBSCRIPTION.CANCELLED':
          // Subscription cancelled
          const cancelledUserId = event.resource.custom_id;
          await storage.updateUserSubscription(cancelledUserId, "free");
          break;
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(400).json({ error: "Webhook error" });
    }
  });

  // Subscription routes
  app.get("/api/subscriptions", (req, res) => {
    res.json(subscriptionTiers);
  });

  app.post("/api/subscriptions/upgrade", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { tier } = req.body;
    if (!tier || !subscriptionTiers[tier as SubscriptionTier]) {
      return res.status(400).json({ message: "Invalid subscription tier" });
    }

    try {
      const updatedUser = await storage.updateUserSubscription(req.user.id, tier);
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  // Workflow routes
  app.get("/api/workflows", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const workflows = await storage.getWorkflowsByUser(req.user.id);
      res.json(workflows);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workflows" });
    }
  });

  app.get("/api/workflows/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const workflow = await storage.getWorkflow(parseInt(req.params.id));

      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }

      if (workflow.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      res.json(workflow);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workflow" });
    }
  });

  app.post("/api/workflows", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Check if user has reached their workflow limit
      const workflowCount = await storage.countUserWorkflows(req.user.id);
      const subscriptionTier = req.user.subscription as SubscriptionTier;
      const maxWorkflows = subscriptionTiers[subscriptionTier].maxWorkflows;

      if (workflowCount >= maxWorkflows) {
        return res.status(403).json({ 
          message: `You have reached your maximum number of workflows (${maxWorkflows}) for your ${subscriptionTier} subscription.` 
        });
      }

      // Parse and validate the request body
      const workflowData = insertWorkflowSchema.parse({
        ...req.body,
        userId: req.user.id
      });

      // Create the workflow
      const workflow = await storage.createWorkflow(workflowData);

      // Create workflow platform connections if platforms are provided
      if (req.body.platforms && Array.isArray(req.body.platforms)) {
        for (const platformId of req.body.platforms) {
          // Verify the platform belongs to the user
          const platform = await storage.getPlatform(platformId);
          if (platform && platform.userId === req.user.id) {
            await storage.createWorkflowPlatform({
              workflowId: workflow.id,
              platformId
            });
          }
        }
      }

      res.status(201).json(workflow);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create workflow" });
    }
  });

  app.put("/api/workflows/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const workflowId = parseInt(req.params.id);
      const workflow = await storage.getWorkflow(workflowId);

      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }

      if (workflow.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Update the workflow
      const updatedWorkflow = await storage.updateWorkflow(workflowId, req.body);
      res.json(updatedWorkflow);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update workflow" });
    }
  });

  app.put("/api/workflows/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const workflowId = parseInt(req.params.id);
      const workflow = await storage.getWorkflow(workflowId);

      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }

      if (workflow.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Update the workflow status
      const { status } = req.body;
      if (!status || !["active", "paused"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updatedWorkflow = await storage.updateWorkflowStatus(workflowId, status);
      res.json(updatedWorkflow);
    } catch (error) {
      res.status(500).json({ message: "Failed to update workflow status" });
    }
  });

  // Platform routes
  app.get("/api/platforms", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const platforms = await storage.getPlatformsByUser(req.user.id);
      res.json(platforms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch platforms" });
    }
  });

  app.post("/api/platforms", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Parse and validate the request body
      const platformData = insertPlatformSchema.parse({
        ...req.body,
        userId: req.user.id
      });

      // Create the platform
      const platform = await storage.createPlatform(platformData);
      res.status(201).json(platform);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create platform" });
    }
  });

  // Platform OAuth initiation
  app.post("/api/platforms/:id/oauth", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const platformId = parseInt(req.params.id);
      const platform = await storage.getPlatform(platformId);

      if (!platform || platform.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Generate a random state for CSRF protection
      const originalState = randomBytes(16).toString('hex');

      // Store state in session for additional validation
      req.session.oauthState = originalState;

      // Create an encoded state that includes the platform ID and the original state
      // This allows us to identify which platform to update in the callback
      const stateObj = {
        platformId,
        originalState
      };

      // Base64 encode the state object to pass it through the OAuth flow
      const encodedState = Buffer.from(JSON.stringify(stateObj)).toString('base64');

      // Generate OAuth URL based on platform with the encoded state
      const authUrl = generateOAuthUrl(platform.name, encodedState);

      res.json({ authUrl });
    } catch (error) {
      console.error("OAuth initiation error:", error);
      res.status(500).json({ 
        message: "Failed to initiate OAuth flow",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Platform OAuth callback
  app.get("/api/platforms/oauth/callback", async (req, res) => {
    if (!req.isAuthenticated()) {
      // If not authenticated, redirect to login page
      return res.redirect('/auth');
    }

    try {
      const { code, state, platform: platformName } = req.query;

      if (!code || !state || !platformName) {
        return res.status(400).send("Missing required parameters");
      }

      // Decode the state which contains platformId and original state
      let stateObj;
      try {
        stateObj = JSON.parse(Buffer.from(state as string, 'base64').toString());
      } catch (e) {
        return res.status(400).send("Invalid state parameter");
      }

      const { platformId, originalState } = stateObj;

      // Validate state to prevent CSRF (if stored in session)
      if (req.session.oauthState && originalState !== req.session.oauthState) {
        return res.status(400).send("Invalid state parameter - CSRF protection");
      }

      // Exchange code for access token (using the specific platform's exchange function)
      const tokens = await exchangeCodeForTokens(code as string, originalState, platformName as string);

      // Update platform with new tokens
      await storage.updatePlatform(platformId, {
        accessToken: tokens.access_token,
        apiSecret: tokens.refresh_token // Store refresh token in apiSecret field
      });

      // Redirect to platform detail page with success message
      res.redirect(`/platforms/${platformId}?success=true`);
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.status(500).send(`Failed to complete OAuth flow: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  // Platform OAuth callback (for server-side handling)
  app.post("/api/platforms/oauth/server-callback", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { code, state, platformId, platformName } = req.body;

      // Validate state to prevent CSRF (if stored in session)
      if (req.session.oauthState && state !== req.session.oauthState) {
        return res.status(400).json({ message: "Invalid state parameter" });
      }

      // Exchange code for access token (using the specific platform's exchange function)
      const tokens = await exchangeCodeForTokens(code, state, platformName);

      // Update platform with new tokens
      await storage.updatePlatform(parseInt(platformId), {
        accessToken: tokens.access_token,
        apiSecret: tokens.refresh_token // Store refresh token in apiSecret field
      });

      res.json({ success: true });
    } catch (error) {
      console.error("OAuth server callback error:", error);
      res.status(500).json({ 
        message: "Failed to complete OAuth flow",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Test platform connection
  app.post("/api/platforms/:id/test", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const platform = await storage.getPlatform(parseInt(req.params.id));
      if (!platform || platform.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Test connection based on platform type
      const status = await testPlatformConnection(platform);
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Failed to test connection" });
    }
  });

  app.put("/api/platforms/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const platformId = parseInt(req.params.id);
      const platform = await storage.getPlatform(platformId);

      if (!platform) {
        return res.status(404).json({ message: "Platform not found" });
      }

      if (platform.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Update the platform
      const updatedPlatform = await storage.updatePlatform(platformId, req.body);
      res.json(updatedPlatform);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update platform" });
    }
  });

  // Platform direct posting
  app.post("/api/platforms/:id/post", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const platformId = parseInt(req.params.id);
      const platform = await storage.getPlatform(platformId);

      if (!platform) {
        return res.status(404).json({ message: "Platform not found" });
      }

      if (platform.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { content, options } = req.body;

      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }

      // Post the content to the platform
      const result = await postToPlatform(platform, content, options);
      res.json(result);
    } catch (error) {
      console.error("Platform posting error:", error);
      res.status(500).json({ 
        message: "Failed to post to platform", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Post routes
  app.get("/api/workflows/:id/posts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const workflowId = parseInt(req.params.id);
      const workflow = await storage.getWorkflow(workflowId);

      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }

      if (workflow.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const posts = await storage.getPostsByWorkflow(workflowId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Generate content
  app.post("/api/content/generate", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { contentType, contentTone, topics, platforms, length } = req.body;

      if (!contentType || !contentTone || !topics || !platforms) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const content = await generateContent({
        contentType,
        contentTone,
        topics,
        platforms,
        length
      });

      res.json({ content });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate content" });
    }
  });

  // Adapt content for specific platform
  app.post("/api/content/adapt", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { content, platform } = req.body;

      if (!content || !platform) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const adaptedContent = await generatePlatformSpecificContent(content, platform);
      res.json({ content: adaptedContent });
    } catch (error) {
      res.status(500).json({ message: "Failed to adapt content" });
    }
  });

  // Scheduler API endpoints

  // Manually trigger scheduling of a post
  app.post("/api/scheduler/post", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { workflowId, content, platformIds, scheduledFor } = req.body;

      if (!workflowId || !content || !platformIds || !platformIds.length) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Optional: limit post scheduling based on subscription tier
      const user = req.user;
      if (user) {
        const dailyPostsCount = await storage.getPostsCreatedTodayCount(user.id);
        const tier = user.subscription as SubscriptionTier;
        const maxDailyPosts = subscriptionTiers[tier]?.maxDailyPosts || 3;

        if (dailyPostsCount >= maxDailyPosts) {
          return res.status(403).json({ 
            message: `You have reached your daily limit of ${maxDailyPosts} posts for your ${tier} plan.`,
            limitReached: true,
            tier,
            maxDailyPosts,
            currentCount: dailyPostsCount
          });
        }
      }

      // Parse date if provided, otherwise use smart optimization
      let parsedDate = undefined;
      if (scheduledFor) {
        parsedDate = new Date(scheduledFor);
        if (isNaN(parsedDate.getTime())) {
          return res.status(400).json({ message: "Invalid date format for scheduledFor" });
        }
      }

      const post = await scheduler.schedulePost(
        workflowId,
        content,
        platformIds,
        parsedDate
      );

      res.status(201).json({ 
        post,
        message: "Post scheduled successfully",
        optimized: post.optimizationApplied
      });
    } catch (error) {
      console.error("Failed to schedule post:", error);
      res.status(500).json({ message: "Failed to schedule post" });
    }
  });

  // Get optimal posting times for a set of platforms
  app.post("/api/scheduler/optimal-times", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { platformIds } = req.body;

      if (!platformIds || !platformIds.length) {
        return res.status(400).json({ message: "Missing platform IDs" });
      }

      const optimalTime = await storage.calculateOptimalPostTime(platformIds);

      // Get platform-specific time data
      const timeOptimizations = [];
      for (const platformId of platformIds) {
        const optimization = await storage.getTimeOptimizationByPlatform(platformId);
        if (optimization) {
          const platform = await storage.getPlatform(platformId);
          timeOptimizations.push({
            platformId,
            platformName: platform?.name,
            platformType: platform?.type,
            bestHours: typeof optimization.bestHours === 'string' 
              ? JSON.parse(optimization.bestHours) 
              : optimization.bestHours,
            bestDays: typeof optimization.bestDays === 'string'
              ? JSON.parse(optimization.bestDays)
              : optimization.bestDays,
            audienceTimezone: optimization.audienceTimezone,
            engagementScore: optimization.engagementScore
          });
        }
      }

      res.json({ 
        optimalTime, 
        timeOptimizations,
        message: "Optimal posting time calculated successfully" 
      });
    } catch (error) {
      console.error("Failed to calculate optimal posting time:", error);
      res.status(500).json({ message: "Failed to calculate optimal posting time" });
    }
  });

  // Manual trigger for checking and processing pending posts
  app.post("/api/scheduler/process-pending", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = req.user;
    if (!user?.isAdmin) {
      return res.status(403).json({ message: "Unauthorized: Admin access required" });
    }

    try {
      // Instead of directly calling processPendingPosts which is private,
      // We'll create a new public method in the scheduler for this purpose
      const processedCount = await scheduler.processPendingPostsManually();

      res.json({ 
        message: `Processed ${processedCount} pending posts`,
        count: processedCount
      });
    } catch (error) {
      console.error("Failed to process pending posts:", error);
      res.status(500).json({ message: "Failed to process pending posts" });
    }
  });

  // Get trending topics
  app.get("/api/topics/trending/:category", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { category } = req.params;
      const topics = await findTrendingTopics(category);
      res.json({ topics });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trending topics" });
    }
  });

  // Test endpoint for generating AI preview images
  app.get("/api/templates/test-preview", async (req, res) => {
    try {
      // Sample data for testing
      const sampleTemplate = {
        title: "Social Media Content Calendar",
        description: "A workflow to schedule and automate content posting across multiple platforms",
        category: "Social Media",
        workflowSteps: [
          "Generate content ideas based on trending topics",
          "Create platform-specific variations of content",
          "Schedule optimal posting times using AI recommendations",
          "Automatically post content to selected platforms",
          "Analyze engagement metrics and optimize future content"
        ]
      };

      console.log("Testing preview generation with sample template");

      // Create enhanced description using the same logic as the main endpoint
      let enhancedDescription = sampleTemplate.description;
      if (sampleTemplate.workflowSteps && Array.isArray(sampleTemplate.workflowSteps)) {
        enhancedDescription += "\n\nThis workflow process includes the following steps:\n";
        sampleTemplate.workflowSteps.forEach((step, index) => {
          enhancedDescription += `${index + 1}. ${step}\n`;
        });

        const stepText = sampleTemplate.workflowSteps.join(" ");
        if (stepText.toLowerCase().includes("schedule") || stepText.toLowerCase().includes("automate")) {
          enhancedDescription += "\nThis is an automation-focused workflow with scheduling capabilities.";
        }
        if (stepText.toLowerCase().includes("analyze") || stepText.toLowerCase().includes("report")) {
          enhancedDescription += "\nThis workflow includes data analysis and reporting features.";
        }
        if (stepText.toLowerCase().includes("generate") || stepText.toLowerCase().includes("create")) {
          enhancedDescription += "\nThis workflow focuses on AI-powered content generation.";
        }
      }

      const imageUrl = await generateTemplatePreviewImage(
        sampleTemplate.title, 
        enhancedDescription, 
        sampleTemplate.category
      );

      if (!imageUrl) {
        return res.status(500).json({ message: "Failed to generate test preview image" });
      }

      console.log("Successfully generated test preview image");

      res.json({ 
        imageUrl,
        template: sampleTemplate 
      });
    } catch (error) {
      console.error("Error generating test preview image:", error);
      res.status(500).json({ 
        message: "Error generating test preview image",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Generate template preview image using AI
  app.post("/api/templates/generate-preview", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { title, description, category, workflowSteps } = req.body;

      if (!title || !description || !category) {
        return res.status(400).json({ 
          message: "Missing required parameters: title, description, and category are required" 
        });
      }

      console.log("Generating template preview image for:", title);

      // Create a more detailed context by structuring workflow steps if available
      let enhancedDescription = description;
      if (workflowSteps && Array.isArray(workflowSteps) && workflowSteps.length > 0) {
        // Format the workflow steps to be more descriptive
        enhancedDescription += "\n\nThis workflow process includes the following steps:\n";
        workflowSteps.forEach((step, index) => {
          enhancedDescription += `${index + 1}. ${step}\n`;
        });

        // Add specific workflow characteristics based on the steps
        const stepText = workflowSteps.join(" ");
        if (stepText.toLowerCase().includes("schedule") || stepText.toLowerCase().includes("automate")) {
          enhancedDescription += "\nThis is an automation-focused workflow with scheduling capabilities.";
        }
        if (stepText.toLowerCase().includes("analyze") || stepText.toLowerCase().includes("report")) {
          enhancedDescription += "\nThis workflow includes data analysis and reporting features.";
        }
        if (stepText.toLowerCase().includes("generate") || stepText.toLowerCase().includes("create")) {
          enhancedDescription += "\nThis workflow focuses on AI-powered content generation.";
        }
        if (stepText.toLowerCase().includes("review") || stepText.toLowerCase().includes("approve")) {
          enhancedDescription += "\nThis workflow includes content review and approval processes.";
        }
      }

      const imageUrl = await generateTemplatePreviewImage(title, enhancedDescription, category);

      if (!imageUrl) {
        return res.status(500).json({ message: "Failed to generate preview image" });
      }

      // Log success but don't expose the whole URL in logs
      console.log(`Successfully generated preview image for "${title}"`);

      res.json({ imageUrl });
    } catch (error) {
      console.error("Error generating template preview image:", error);
      res.status(500).json({ message: "Error generating template preview image" });
    }
  });

  // Analytics routes
  app.get("/api/analytics", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Get query parameters for filtering
      const timeRange = req.query.timeRange || '30d';
      const platform = req.query.platform || 'all';

      // Get user's activity data
      const user = await storage.getUser(req.user.id);
      const workflows = await storage.getWorkflowsByUser(req.user.id);
      const platforms = await storage.getPlatformsByUser(req.user.id);

      // Get posts for each workflow
      let allPosts = [];
      let totalEngagement = 0;
      for (const workflow of workflows) {
        const posts = await storage.getPostsByWorkflow(workflow.id);
        allPosts = [...allPosts, ...posts];
        totalEngagement += posts.reduce((sum, post) => sum + (post.engagement || 0),```text
0), 0);
      }

      // Calculate daily engagement for the past period based on timeRange
      const daysToShow = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const dailyEngagement = Array(daysToShow).fill(0);
      const now = new Date();
      allPosts.forEach(post => {
        const postDate = new Date(post.createdAt);
        const dayDiff = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));
        if (dayDiff < daysToShow) {
          dailyEngagement[dayDiff] += post.engagement || 0;
        }
      });

      // Calculate platform metrics
      const platformMetrics = platforms.map(platform => {
        const platformPosts = allPosts.filter(post => post.platformIds?.includes(platform.id));
        return {
          name: platform.name,
          posts: platformPosts.length,
          engagement: platformPosts.reduce((sum, post) => sum + (post.engagement || 0), 0)
        };
      });

      const analyticsData = {
        user: {
          joinedAt: user.createdAt,
          subscription: user.subscription,
          totalPosts: allPosts.length,
          activeWorkflows: workflows.filter(w => w.status === 'active').length,
          connectedPlatforms: platforms.length
        },
        engagement: {
          total: totalEngagement,
          daily: dailyEngagement.reverse(),
          avgPerPost: allPosts.length ? totalEngagement / allPosts.length : 0
        },
        platforms: platformMetrics,
        topPosts: allPosts
          .sort((a, b) => (b.engagement || 0) - (a.engagement || 0))
          .slice(0, 5)
          .map(post => ({
            id: post.id,
            content: post.content.substring(0, 50) + '...',
            platform: platforms.find(p => post.platformIds?.includes(p.id))?.name || 'Unknown',
            engagement: post.engagement || 0,
            createdAt: post.createdAt
          }))
      };

      res.json(analyticsData);
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });

  // Content Performance Metrics API
  app.get("/api/analytics/content-performance", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Get query parameters
      const timeRange = req.query.timeRange || '30d';

      // Get user's platforms and posts
      const platforms = await storage.getPlatformsByUser(req.user.id);
      const workflows = await storage.getWorkflowsByUser(req.user.id);

      // Get posts for performance analysis
      let allPosts = [];
      for (const workflow of workflows) {
        const posts = await storage.getPostsByWorkflow(workflow.id);
        allPosts = [...allPosts, ...posts];
      }

      // Filter posts by date range
      const daysToInclude = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToInclude);

      const filteredPosts = allPosts.filter(post => new Date(post.createdAt) >= cutoffDate);

      // Calculate total metrics
      const totalReach = filteredPosts.reduce((sum, post) => sum + (post.reach || 0), 0);
      const totalEngagement = filteredPosts.reduce((sum, post) => sum + (post.engagement || 0), 0);
      const averageEngagementRate = totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0;

      // Compare with previous period
      const previousCutoffDate = new Date(cutoffDate);
      previousCutoffDate.setDate(previousCutoffDate.getDate() - daysToInclude);

      const previousPeriodPosts = allPosts.filter(post => {
        const postDate = new Date(post.createdAt);
        return postDate >= previousCutoffDate && postDate < cutoffDate;
      });

      const previousTotalReach = previousPeriodPosts.reduce((sum, post) => sum + (post.reach || 0), 0);
      const previousTotalEngagement = previousPeriodPosts.reduce((sum, post) => sum + (post.engagement || 0), 0);

      const reachGrowth = previousTotalReach > 0 
        ? ((totalReach - previousTotalReach) / previousTotalReach) * 100 
        : 100;

      const engagementGrowth = previousTotalEngagement > 0 
        ? ((totalEngagement - previousTotalEngagement) / previousTotalEngagement) * 100 
        : 100;

      // Get platform-specific performance
      const platformPerformance = platforms.map(platform => {
        const platformPosts = filteredPosts.filter(post => post.platformIds?.includes(platform.id));
        const totalPlatformReach = platformPosts.reduce((sum, post) => sum + (post.reach || 0), 0);
        const totalPlatformEngagement = platformPosts.reduce((sum, post) => sum + (post.engagement || 0), 0);

        return {
          platformId: platform.id,
          platformName: platform.name,
          totalImpressions: totalPlatformReach,
          totalEngagement: totalPlatformEngagement,
          engagementRate: totalPlatformReach > 0 ? (totalPlatformEngagement / totalPlatformReach) * 100 : 0,
          contentCount: platformPosts.length
        };
      });

      // Generate weekly performance data
      const weeklyPerformance = [];
      const weeks = Math.min(12, Math.ceil(daysToInclude / 7));

      for (let i = 0; i < weeks; i++) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() - (i * 7));

        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 7);

        const weekPosts = filteredPosts.filter(post => {
          const postDate = new Date(post.createdAt);
          return postDate >= startDate && postDate < endDate;
        });

        const weekReach = weekPosts.reduce((sum, post) => sum + (post.reach || 0), 0);
        const weekEngagement = weekPosts.reduce((sum, post) => sum + (post.engagement || 0), 0);

        weeklyPerformance.push({
          date: startDate.toISOString().substring(0, 10),
          reach: weekReach,
          engagement: weekEngagement
        });
      }

      // Determine top platform
      const topPlatform = platformPerformance.length > 0 
        ? platformPerformance.sort((a, b) => b.engagementRate - a.engagementRate)[0].platformName 
        : "None";

      // Get top performing content
      const topContent = filteredPosts.sort((a, b) => (b.engagement || 0) - (a.engagement || 0))[0];

      // Format recent metrics
      const recentMetrics = filteredPosts
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map(post => {
          const platform = platforms.find(p => post.platformIds?.includes(p.id));
          return {
            contentId: post.id,
            contentTitle: post.content.substring(0, 40) + (post.content.length > 40 ? '...' : ''),
            platformId: platform?.id || 0,
            platformName: platform?.name || 'Unknown',
            impressions: post.reach || 0,
            engagement: post.engagement || 0,
            shares: post.shares || 0,
            clicks: post.clicks || 0,
            saves: post.saves || 0,
            date: post.createdAt
          };
        });

      // Prepare response
      const response = {
        topPlatform,
        totalReach,
        totalEngagement,
        averageEngagementRate,
        totalContent: filteredPosts.length,
        engagementGrowth,
        reachGrowth,
        topPerformingContentId: topContent?.id || 0,
        topPerformingContentTitle: topContent 
          ? topContent.content.substring(0, 40) + (topContent.content.length > 40 ? '...' : '') 
          : "No content",
        weeklyPerformance: weeklyPerformance.reverse(),
        platformPerformance,
        recentMetrics
      };

      res.json(response);

    } catch (error) {
      console.error('Content performance metrics error:', error);
      res.status(500).json({ message: "Failed to fetch content performance metrics" });
    }
  });

  // Audience Growth Analytics API
  app.get("/api/analytics/audience", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Get query parameters
      const timeRange = req.query.timeRange || '30d';

      // Get platforms and their audience data
      const platforms = await storage.getPlatformsByUser(req.user.id);

      // Calculate audience metrics
      let totalFollowers = 0;
      let newFollowers = 0;
      let averageEngagementRate = 0;

      const platformGrowth = [];

      // For each platform, get the audience data
      for (const platform of platforms) {
        // This would typically come from the platform's API
        // For now, we'll generate it based on platform ID to simulate different values
        const platformFollowers = 1000 + (platform.id * 500);
        const platformGrowthRate = 3 + (platform.id % 5);
        const platformNewFollowers = Math.floor(platformFollowers * (platformGrowthRate / 100));

        totalFollowers += platformFollowers;
        newFollowers += platformNewFollowers;

        platformGrowth.push({
          platformId: platform.id,
          platformName: platform.name,
          followers: platformFollowers,
          growthRate: platformGrowthRate
        });
      }

      // Calculate average engagement rate
      if (platforms.length > 0) {
        const workflows = await storage.getWorkflowsByUser(req.user.id);
        let allPosts = [];

        for (const workflow of workflows) {
          const posts = await storage.getPostsByWorkflow(workflow.id);
          allPosts = [...allPosts, ...posts];
        }

        const totalEngagement = allPosts.reduce((sum, post) => sum + (post.engagement || 0), 0);
        const totalImpressions = allPosts.reduce((sum, post) => sum + (post.reach || 0), 0);

        averageEngagementRate = totalImpressions > 0 ? (totalEngagement / totalImpressions) * 100 : 0;
      }

      // Generate follower growth trend
      const growthTrend = [];
      const daysToInclude = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const dataPoints = Math.min(14, daysToInclude);
      const interval = Math.floor(daysToInclude / dataPoints);

      let runningTotal = totalFollowers;

      for (let i = 0; i < dataPoints; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (i * interval));

        // For simulation, assume followers grow by about 1% each interval
        const growthFactor = 1 - (0.01 * interval);
        const previousValue = Math.floor(runningTotal * growthFactor);
        const newFollowersInPeriod = runningTotal - previousValue;

        growthTrend.unshift({
          date: date.toISOString().substring(0, 10),
          followers: previousValue,
          newFollowers: newFollowersInPeriod
        });

        runningTotal = previousValue;
      }

      // Generate demographic data
      const demographicData = {
        ageGroups: [
          { label: "18-24", value: 25 },
          { label: "25-34", value: 35 },
          { label: "35-44", value: 22 },
          { label: "45-54", value: 10 },
          { label: "55-64", value: 5 },
          { label: "65+", value: 3 }
        ],
        genders: [
          { label: "Male", value: 45 },
          { label: "Female", value: 52 },
          { label: "Other", value: 3 }
        ],
        topLocations: [
          { location: "United States", percentage: 42.5 },
          { location: "United Kingdom", percentage: 12.8 },
          { location: "Canada", percentage: 8.3 },
          { location: "Australia", percentage: 7.6 },
          { location: "Germany", percentage: 5.2 }
        ]
      };

      // Generate active hours data
      const activeHours = Array.from({ length: 24 }, (_, i) => {
        // Generate a distribution with peaks at 9am, 12pm, and 8pm
        const morningPeak = Math.exp(-Math.pow((i - 9) / 2, 2)) * 20;
        const noonPeak = Math.exp(-Math.pow((i - 12) / 2, 2)) * 15;
        const eveningPeak = Math.exp(-Math.pow((i - 20) / 2, 2)) * 25;

        return {
          hour: i,
          activity: parseFloat((morningPeak + noonPeak + eveningPeak).toFixed(1))
        };
      });

      // Prepare response
      const response = {
        totalFollowers,
        newFollowers,
        followerGrowthRate: newFollowers > 0 ? (newFollowers / (totalFollowers - newFollowers)) * 100 : 0,
        averageEngagementRate,
        demographicData,
        growthTrend,
        activeHours,
        platformGrowth
      };

      res.json(response);

    } catch (error) {
      console.error('Audience analytics error:', error);
      res.status(500).json({ message: "Failed to fetch audience analytics data" });
    }
  });

  // Content Comparison Analytics API
  app.get("/api/analytics/content-comparison", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Get query parameters
      const timeRange = req.query.timeRange || '30d';

      // Get user's content data
      const workflows = await storage.getWorkflowsByUser(req.user.id);

      // Get posts for comparison analysis
      let allPosts = [];
      for (const workflow of workflows) {
        const posts = await storage.getPostsByWorkflow(workflow.id);
        allPosts = [...allPosts, ...posts];
      }

      // Filter posts by date range
      const daysToInclude = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToInclude);

      const filteredPosts = allPosts.filter(post => new Date(post.createdAt) >= cutoffDate);

      // Categorize posts by content type
      const contentTypes = ['Image', 'Video', 'Article', 'Text', 'Link'];
      const contentTypePerformance = contentTypes.map(type => {
        // For simulation, filter posts pseudo-randomly based on content
        const typePosts = filteredPosts.filter(post => {
          const hash = hashString(post.content);
          return hash % contentTypes.length === contentTypes.indexOf(type);
        });

        const typeEngagement = typePosts.reduce((sum, post) => sum + (post.engagement || 0), 0);
        const typeReach = typePosts.reduce((sum, post) => sum + (post.reach || 0), 0);

        return {
          contentType: type,
          averageEngagement: typePosts.length > 0 ? Math.round(typeEngagement / typePosts.length) : 0,
          averageReach: typePosts.length > 0 ? Math.round(typeReach / typePosts.length) : 0,
          totalItems: typePosts.length,
          // Only video and link types have conversion tracking in this simulation
          conversionRate: (type === 'Video' || type === 'Link') ? Math.random() * 5 + 1 : undefined
        };
      });

      // Categorize posts by length
      const lengthCategories = ['Very Short', 'Short', 'Medium', 'Long', 'Very Long'];
      const contentLengthPerformance = lengthCategories.map((category, index) => {
        // For simulation, categorize posts by content length
        const categoryPosts = filteredPosts.filter(post => {
          const length = post.content.length;
          const categoryIndex = getContentLengthCategory(length);
          return categoryIndex === index;
        });

        const categoryEngagement = categoryPosts.reduce((sum, post) => sum + (post.engagement || 0), 0);
        const categoryReach = categoryPosts.reduce((sum, post) => sum + (post.reach || 0), 0);

        return {
          lengthCategory: category,
          averageEngagement: categoryPosts.length > 0 ? Math.round(categoryEngagement / categoryPosts.length) : 0,
          averageReach: categoryPosts.length > 0 ? Math.round(categoryReach / categoryPosts.length) : 0,
          totalItems: categoryPosts.length
        };
      });

      // Extract and analyze hashtags
      const hashtags = new Map();

      filteredPosts.forEach(post => {
        // Extract hashtags using regex
        const matches = post.content.match(/#[a-zA-Z0-9_]+/g) || [];

        matches.forEach(tag => {
          const hashtag = tag.substring(1).toLowerCase(); // Remove # and convert to lowercase

          if (!hashtags.has(hashtag)) {
            hashtags.set(hashtag, { count: 0, totalEngagement: 0 });
          }

          const data = hashtags.get(hashtag);
          data.count += 1;
          data.totalEngagement += post.engagement || 0;
          hashtags.set(hashtag, data);
        });
      });

      // Format hashtag performance data
      const hashtagPerformance = Array.from(hashtags.entries())
        .map(([hashtag, data]) => ({
          hashtag,
          averageEngagement: data.count > 0 ? Math.round(data.totalEngagement / data.count) : 0,
          frequency: data.count
        }))
        .sort((a, b) => b.averageEngagement - a.averageEngagement)
        .slice(0, 20); // Get top 20 hashtags

      // Analyze posting time impact
      const timeFrames = ['Morning (6-10am)', 'Midday (10am-2pm)', 'Afternoon (2-6pm)', 'Evening (6-10pm)', 'Night (10pm-6am)'];
      const timeBasedPerformance = timeFrames.map(frame => {
        // For simulation, filter posts by timestamp
        const framePosts = filteredPosts.filter(post => {
          const postDate = new Date(post.createdAt);
          const hour = postDate.getHours();

          return (
            (frame === 'Morning (6-10am)' && hour >= 6 && hour < 10) ||
            (frame === 'Midday (10am-2pm)' && hour >= 10 && hour < 14) ||
            (frame === 'Afternoon (2-6pm)' && hour >= 14 && hour < 18) ||
            (frame === 'Evening (6-10pm)' && hour >= 18 && hour < 22) ||
            (frame === 'Night (10pm-6am)' && (hour >= 22 || hour < 6))
          );
        });

        const frameEngagement = framePosts.reduce((sum, post) => sum + (post.engagement || 0), 0);

        return {
          timeFrame: frame,
          averageEngagement: framePosts.length > 0 ? Math.round(frameEngagement / framePosts.length) : 0,
          totalItems: framePosts.length
        };
      });

      // Format comparison data
      const formatComparison = [
        { format: 'Single Image', engagement: 65, reach: 70, conversionRate: 2.5 },
        { format: 'Carousel', engagement: 78, reach: 65, conversionRate: 3.2 },
        { format: 'Video', engagement: 85, reach: 80, conversionRate: 4.1 },
        { format: 'Text Only', engagement: 45, reach: 55, conversionRate: 1.8 },
        { format: 'Link + Image', engagement: 60, reach: 68, conversionRate: 3.7 }
      ];

      // Prepare response
      const response = {
        contentTypePerformance,
        contentLengthPerformance,
        topPerformingHashtags: hashtagPerformance,
        timeBasedPerformance,
        formatComparison
      };

      res.json(response);

    } catch (error) {
      console.error('Content comparison analytics error:', error);
      res.status(500).json({ message: "Failed to fetch content comparison data" });
    }
  });

  // Content Analytics Insights API
  app.get("/api/analytics/insights", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // In a real application, these insights would be generated based on
      // actual user data and stored in the database. For demonstration purposes,
      // we're generating them on the fly.

      // Get user's workflows and posts for context
      const workflows = await storage.getWorkflowsByUser(req.user.id);
      const platforms = await storage.getPlatformsByUser(req.user.id);

      let allPosts = [];
      for (const workflow of workflows) {
        const posts = await storage.getPostsByWorkflow(workflow.id);
        allPosts = [...allPosts, ...posts];
      }

      // Generate insights based on available data
      const insights = [];

      // Only generate meaningful insights if we have data
      if (allPosts.length > 0) {
        // Recommendation for optimal posting time
        insights.push({
          id: 'ins-1',
          type: 'recommendation',
          category: 'scheduling',
          title: 'Optimize your posting schedule',
          description: 'Based on your audience engagement patterns, try posting between 7-9 PM for maximum reach and interaction.',
          impact: 'high',
          actionable: true,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
        });

        // Content type recommendation
        insights.push({
          id: 'ins-2',
          type: 'tip',
          category: 'content',
          title: 'Increase video content',
          description: 'Your video posts are receiving 28% higher engagement than other content types. Consider creating more video content.',
          impact: 'medium',
          actionable: true,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
        });

        // Platform-specific insight
        if (platforms.length > 1) {
          insights.push({
            id: 'ins-3',
            type: 'recommendation',
            category: 'platform',
            title: `Leverage ${platforms[0].name} growth`,
            description: `Your audience on ${platforms[0].name} is growing 2.3x faster than other platforms. Consider focusing more content there.`,
            impact: 'medium',
            actionable: true,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
          });
        }

        // Achievement notification
        insights.push({
          id: 'ins-4',
          type: 'achievement',
          category: 'content',
          title: 'Engagement milestone reached',
          description: 'Congratulations! Your content has reached over 1,000 total engagements this month.',
          impact: 'low',
          actionable: false,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        });

        // Content length insight
        insights.push({
          id: 'ins-5',
          type: 'tip',
          category: 'content',
          title: 'Optimize content length',
          description: 'Your medium-length posts (300-500 words) perform 18% better than very long posts. Focus on concise, value-packed content.',
          impact: 'medium',
          actionable: true,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
        });

        // Audience insight
        insights.push({
          id: 'ins-6',
          type: 'tip',
          category: 'audience',
          title: 'Target audience identified',
          description: 'Your content performs best with the 25-34 age demographic. Consider tailoring your messaging to this group.',
          impact: 'high',
          actionable: true,
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // 4 days ago,
        });

        // Hashtag recommendation
        insights.push({
          id: 'ins-7',
          type: 'recommendation',
          category: 'content',
          title: 'Optimize hashtag strategy',
          description: 'Using 3-5 targeted hashtags yields 23% higher reach than posts with 10+ hashtags. Focus on quality over quantity.',
          impact: 'medium',
          actionable: true,
          createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() // 6 days ago
        });
      } else {
        // If no posts available, provide starter insights
        insights.push({
          id: 'ins-starter-1',
          type: 'tip',
          category: 'content',
          title: 'Get started with your first post',
          description: 'Create and schedule your first post to begin collecting performance analytics.',
          impact: 'high',
          actionable: true,
          createdAt: new Date().toISOString()
        });

        if (platforms.length > 0) {
          insights.push({
            id: 'ins-starter-2',
            type: 'tip',
            category: 'platform',
            title: 'Optimize your platform strategy',
            description: `You've connected ${platforms.length} platform(s). Try posting consistently for 2 weeks to establish baseline metrics.`,
            impact: 'medium',
            actionable: true,
            createdAt: new Date().toISOString()
          });
        } else {
          insights.push({
            id: 'ins-starter-2',
            type: 'tip',
            category: 'platform',
            title: 'Connect your first platform',
            description: 'Add social media platforms to start managing and analyzing your content across channels.',
            impact: 'high',
            actionable: true,
            createdAt: new Date().toISOString()
          });
        }
      }

      // Select top recommendation
      const topRecommendation = insights.find(i => i.type === 'recommendation' && i.impact === 'high') || 
                               insights.find(i => i.impact === 'high') ||
                               insights[0];

      // Prepare response
      const response = {
        insights: insights.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        topRecommendation,
        totalInsights: insights.length,
        unreadInsights: insights.length // In a real app, this would track which insights have been read
      };

      res.json(response);

    } catch (error) {
      console.error('Content insights error:', error);
      res.status(500).json({ message: "Failed to fetch content insights" });
    }
  });

  // Mark content insight as read
  app.post("/api/analytics/insights/:insightId/read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { insightId } = req.params;

      // In a real application, this would update the insight in the database
      // For demonstration purposes, we'll just return a success response

      res.json({ 
        success: true, 
        message: "Insight marked as read",
        insightId
      });

    } catch (error) {
      console.error('Mark insight as read error:', error);
      res.status(500).json({ message: "Failed to mark insight as read" });
    }
  });

  // Generate new AI insights
  app.post("/api/analytics/insights/generate", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // In a real application, this would trigger an AI process to generate new insights
      // For demonstration purposes, we'll just return a success response

      res.json({ 
        success: true, 
        message: "New insights generated successfully",
        count: 3 // Number of new insights generated
      });

    } catch (error) {
      console.error('Generate insights error:', error);
      res.status(500).json({ message: "Failed to generate new insights" });
    }
  });

  /**
   * Helper function to get content length category
   * @param {number} length - Content length in characters
   * @returns {number} - Category index (0-4)
   */
  function getContentLengthCategory(length) {
    if (length < 50) return 0; // Very Short
    if (length < 150) return 1; // Short
    if (length < 500) return 2; // Medium
    if (length < 1000) return 3; // Long
    return 4; // Very Long
  }

  /**
   * Simple hash function for strings
   * @param {string} str - String to hash
   * @returns {number} - Hash value
   */
  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

    try {
      // Get query parameters for filtering
      const timeRange = req.query.timeRange || '1m';
      const platform = req.query.platform || 'all';

      // Get user's workflows
      const workflows = await storage.getWorkflowsByUser(req.user.id);

      // For each workflow, get associated posts
      let allPosts: Array<typeof storage.getPostsByWorkflow extends (...args: any[]) => Promise<infer R> ? R extends Array<infer T> ? T : never : never> = [];
      for (const workflow of workflows) {
        const posts = await storage.getPostsByWorkflow(workflow.id);
        allPosts = [...allPosts, ...posts];
      }

      // Filter posts by date based on timeRange
      const filteredPosts = allPosts.filter(post => {
        const postDate = new Date(post.createdAt);
        const now = new Date();

        switch(timeRange) {
          case '7d':
            return (now.getTime() - postDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
          case '1m':
            return (now.getTime() - postDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
          case '3m':
            return (now.getTime() - postDate.getTime()) <= 90 * 24 * 60 * 60 * 1000;
          case '6m':
            return (now.getTime() - postDate.getTime()) <= 180 * 24 * 60 * 60 * 1000;
          case '1y':
            return (now.getTime() - postDate.getTime()) <= 365 * 24 * 60 * 60 * 1000;
          default:
            return true;
        }
      });

      // Get platform data if available
      const userPlatforms = await storage.getPlatformsByUser(req.user.id);

      // Get engagement data by month
      const engagementData = [];
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      // Sample engagement calculation - in a real app this would come from actual platform API data
      const getRandomEngagement = ()> Math.floor(Math.random() * 1000);

      // Group posts by month
      const now = new Date();
      const startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 6); // Last 6 months

      for (let i = 0; i < 7; i++) {
        const month = new Date(startDate);
        month.setMonth(startDate.getMonth() + i);
        const monthName = monthNames[month.getMonth()];

        // In a real app, these would be actual engagement metrics from the posts
        engagementData.push({
          name: monthName,
          likes: getRandomEngagement(),
          comments: getRandomEngagement(),
          shares: getRandomEngagement()
        });
      }

      // Platform performance data
      const platformPerformance = userPlatforms.map(platform => ({
        name: platform.name,
        value: getRandomEngagement()
      }));

      // Content type performance
      const contentTypePerformance = [
        { name: "Blog", value: 35 },
        { name: "Image", value: 45 },
        { name: "Video", value: 20 },
      ];

      // Get top performing posts
      const topPosts = filteredPosts
        .sort((a, b) => (b.engagement || 0) - (a.engagement || 0))
        .slice(0, 5)
        .map(post => ({
          id: post.id,
          title: post.content.substring(0, 50) + (post.content.length > 50 ? '...' : ''),
          platform: userPlatforms.find(p => p.id === post.platformId)?.name || 'Unknown',
          engagement: post.engagement || Math.floor(Math.random() * 1000), // In a real app, this would be actual data
          date: post.createdAt.toISOString().split('T')[0]
        }));

      // Total engagement metrics
      const totalLikes = engagementData.reduce((sum, month) => sum + month.likes, 0);
      const totalComments = engagementData.reduce((sum, month) => sum + month.comments, 0);
      const totalShares = engagementData.reduce((sum, month) => sum + month.shares, 0);

      // Growth rate calculation (comparing to previous period)
      const growthRate = 23.4; // In a real app, this would be calculated based on previous period data

      const analyticsData = {
        engagementData,
        platformPerformance,
        contentTypePerformance,
        topPosts,
        totalEngagement: {
          likes: totalLikes,
          comments: totalComments,
          shares: totalShares
        },
        growthRate,
        // Add any additional metrics here
      };

      res.json(analyticsData);
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });

  // Handle Replit Auth user data endpoint
  app.get("/__replauthuser", (req, res) => {
    const user = getReplitUser(req);
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: "Not authenticated with Replit" });
    }
  });

  // Create the HTTP server
  const httpServer = createServer(app);

  return httpServer;
}