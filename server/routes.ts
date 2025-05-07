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
    await capturePaypalOrder(req, res);
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