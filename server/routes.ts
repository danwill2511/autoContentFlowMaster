import { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { generateContent, findTrendingTopics } from "./openai";
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