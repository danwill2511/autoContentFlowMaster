import { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { generateContent, generatePlatformSpecificContent, findTrendingTopics } from "./openai";
import { initScheduler } from "./scheduler";
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
  initScheduler();

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

  // Analytics routes
  app.get("/api/analytics", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Get query parameters for filtering
      const timeRange = req.query.timeRange || '1m';
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
        totalEngagement += posts.reduce((sum, post) => sum + (post.engagement || 0), 0);
      }

      // Calculate daily engagement for the past week
      const dailyEngagement = Array(7).fill(0);
      const now = new Date();
      allPosts.forEach(post => {
        const postDate = new Date(post.createdAt);
        const dayDiff = Math.floor((now - postDate) / (1000 * 60 * 60 * 24));
        if (dayDiff < 7) {
          dailyEngagement[dayDiff] += post.engagement || 0;
        }
      });

      // Calculate platform metrics
      const platformMetrics = platforms.map(platform => {
        const platformPosts = allPosts.filter(post => post.platformId === platform.id);
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
            platform: platforms.find(p => p.id === post.platformId)?.name || 'Unknown',
            engagement: post.engagement || 0,
            createdAt: post.createdAt
          }))
      };

      res.json(analyticsData);
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ message: "Failed to fetch analytics data" });
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
      const getRandomEngagement = () => Math.floor(Math.random() * 1000);
      
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