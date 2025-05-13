import express, { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { users, type User, type InsertUser } from "@shared/schema";
import { storage } from "./storage";
import cors from "cors";
import { db } from "./db";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

// JWT token secret - using JWT_SECRET environment variable
// Note: In a production environment, this should be a secure, randomly generated value
const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "auto-content-flow-secret";

// Interface for decoded JWT
interface DecodedToken {
  userId: number;
  iat: number;
  exp: number;
}

export function registerRoutes(app: Express): Server {
  app.use(cors());
  app.use(express.json());
  
  app.set("trust proxy", 1);

  // Middleware to check if user is authenticated with JWT
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      (req as any).userId = decoded.userId;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
  };
  
  // User routes
  app.post("/api/register", async (req, res) => {
    try {
      // Validate input and check for existing users
      const existingUser = await storage.getUserByEmail(req.body.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Create the user with hashed password
      const hashedPassword = await storage.hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        subscription: "free"
      });
      
      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
      
      // Return user without password and with token
      const { password, ...userResponse } = user;
      res.status(201).json({ 
        ...userResponse, 
        token 
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      if (!user.password) {
        console.error(`User with email ${email} has no password stored`);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const isValidPassword = await storage.comparePasswords(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
      
      // Return user without password and with token
      const { password: _, ...userResponse } = user;
      res.status(200).json({ 
        ...userResponse, 
        token 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  app.post("/api/logout", (req, res) => {
    // With JWT, logout is handled client-side by removing the token
    // Server doesn't need to do anything
    res.status(200).json({ message: "Logged out successfully" });
  });
  
  app.get("/api/user", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({ message: "Failed to get user data" });
    }
  });
  
  // Analytics Data API
  app.get("/api/analytics", requireAuth, async (req, res) => {

    try {
      // Mock analytics data
      const analyticsData = {
        user: {
          joinedAt: new Date(),
          subscription: "pro",
          totalPosts: 38,
          activeWorkflows: 5,
          connectedPlatforms: 3
        },
        engagement: {
          total: 5280,
          daily: [120, 180, 210, 250, 300, 290, 310],
          avgPerPost: 138.9
        },
        platforms: [
          { name: "Instagram", posts: 15, engagement: 2350 },
          { name: "Twitter", posts: 12, engagement: 1830 },
          { name: "LinkedIn", posts: 11, engagement: 1100 }
        ],
        topPosts: [
          {
            id: 1,
            content: "10 Tips for Increasing Your Social Media Reach...",
            platform: "Instagram",
            engagement: 350,
            createdAt: new Date()
          },
          {
            id: 2,
            content: "How to Create Viral Content in 2025...",
            platform: "Twitter",
            engagement: 280,
            createdAt: new Date(Date.now() - 86400000)
          }
        ]
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
      const mockData = {
        topPlatform: "Instagram",
        totalReach: 42500,
        totalEngagement: 2850,
        averageEngagementRate: 6.7,
        totalContent: 38,
        engagementGrowth: 14.5,
        reachGrowth: 22.3,
        topPerformingContentId: 12,
        topPerformingContentTitle: "10 Tips for Increasing Your Social Media Reach",
        weeklyPerformance: [
          { date: "2025-04-14", reach: 5200, engagement: 420 },
          { date: "2025-04-21", reach: 6300, engagement: 510 },
          { date: "2025-04-28", reach: 7100, engagement: 580 },
          { date: "2025-05-05", reach: 8400, engagement: 620 },
          { date: "2025-05-12", reach: 9300, engagement: 720 }
        ],
        platformPerformance: [
          { platformId: 1, platformName: "Instagram", totalImpressions: 24000, totalEngagement: 1620, engagementRate: 6.8, contentCount: 15 },
          { platformId: 2, platformName: "Twitter", totalImpressions: 18500, totalEngagement: 1230, engagementRate: 6.6, contentCount: 23 }
        ],
        recentMetrics: [
          { contentId: 12, contentTitle: "10 Tips for Increasing Your Social Media Reach", platformId: 1, platformName: "Instagram", impressions: 4300, engagement: 385, shares: 42, clicks: 210, saves: 98, date: "2025-05-10T10:30:00Z" },
          { contentId: 14, contentTitle: "How to Create Viral Content in 2025", platformId: 1, platformName: "Instagram", impressions: 3800, engagement: 290, shares: 38, clicks: 185, saves: 76, date: "2025-05-08T14:15:00Z" }
        ]
      };
      
      res.json(mockData);
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
      const mockData = {
        totalFollowers: 18750,
        newFollowers: 845,
        followerGrowthRate: 4.7,
        averageEngagementRate: 6.7,
        demographicData: {
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
        },
        growthTrend: [
          { date: "2025-04-14", followers: 16800, newFollowers: 120 },
          { date: "2025-04-21", followers: 17200, newFollowers: 400 },
          { date: "2025-04-28", followers: 17650, newFollowers: 450 },
          { date: "2025-05-05", followers: 18120, newFollowers: 470 },
          { date: "2025-05-12", followers: 18750, newFollowers: 630 }
        ],
        activeHours: [
          { hour: 0, activity: 3.5 },
          { hour: 6, activity: 5.8 },
          { hour: 12, activity: 14.2 },
          { hour: 18, activity: 21.4 },
          { hour: 21, activity: 17.9 }
        ],
        platformGrowth: [
          { platformId: 1, platformName: "Instagram", followers: 12500, growthRate: 5.2 },
          { platformId: 2, platformName: "Twitter", followers: 6250, growthRate: 3.8 }
        ]
      };
      
      res.json(mockData);
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
      const mockData = {
        contentTypePerformance: [
          { contentType: "Image", averageEngagement: 85, averageReach: 1200, totalItems: 18, conversionRate: 2.4 },
          { contentType: "Video", averageEngagement: 105, averageReach: 1500, totalItems: 12, conversionRate: 3.8 },
          { contentType: "Article", averageEngagement: 65, averageReach: 900, totalItems: 8 },
          { contentType: "Text", averageEngagement: 45, averageReach: 750, totalItems: 22 },
          { contentType: "Link", averageEngagement: 55, averageReach: 850, totalItems: 15, conversionRate: 4.2 }
        ],
        contentLengthPerformance: [
          { lengthCategory: "Very Short", averageEngagement: 35, averageReach: 650, totalItems: 12 },
          { lengthCategory: "Short", averageEngagement: 65, averageReach: 850, totalItems: 18 },
          { lengthCategory: "Medium", averageEngagement: 95, averageReach: 1200, totalItems: 25 },
          { lengthCategory: "Long", averageEngagement: 75, averageReach: 950, totalItems: 14 },
          { lengthCategory: "Very Long", averageEngagement: 55, averageReach: 750, totalItems: 6 }
        ],
        topPerformingHashtags: [
          { hashtag: "marketing", averageEngagement: 95, frequency: 24 },
          { hashtag: "socialmedia", averageEngagement: 88, frequency: 32 },
          { hashtag: "contentcreation", averageEngagement: 82, frequency: 18 },
          { hashtag: "business", averageEngagement: 76, frequency: 15 },
          { hashtag: "entrepreneur", averageEngagement: 72, frequency: 12 }
        ],
        timeBasedPerformance: [
          { timeFrame: "Morning (6-10am)", averageEngagement: 68, totalItems: 22 },
          { timeFrame: "Midday (10am-2pm)", averageEngagement: 82, totalItems: 30 },
          { timeFrame: "Afternoon (2-6pm)", averageEngagement: 95, totalItems: 38 },
          { timeFrame: "Evening (6-10pm)", averageEngagement: 105, totalItems: 42 },
          { timeFrame: "Night (10pm-6am)", averageEngagement: 55, totalItems: 18 }
        ],
        formatComparison: [
          { format: "Single Image", engagement: 65, reach: 70, conversionRate: 2.5 },
          { format: "Carousel", engagement: 78, reach: 65, conversionRate: 3.2 },
          { format: "Video", engagement: 85, reach: 80, conversionRate: 4.1 },
          { format: "Text Only", engagement: 45, reach: 55, conversionRate: 1.8 },
          { format: "Link + Image", engagement: 60, reach: 68, conversionRate: 3.7 }
        ]
      };
      
      res.json(mockData);
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
      const mockData = {
        insights: [
          {
            id: 'ins-1',
            type: 'recommendation',
            category: 'scheduling',
            title: 'Optimize your posting schedule',
            description: 'Based on your audience engagement patterns, try posting between 7-9 PM for maximum reach and interaction.',
            impact: 'high',
            actionable: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'ins-2',
            type: 'tip',
            category: 'content',
            title: 'Increase video content',
            description: 'Your video posts are receiving 28% higher engagement than other content types. Consider creating more video content.',
            impact: 'medium',
            actionable: true,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'ins-3',
            type: 'recommendation',
            category: 'platform',
            title: 'Leverage Instagram growth',
            description: 'Your audience on Instagram is growing 2.3x faster than other platforms. Consider focusing more content there.',
            impact: 'medium',
            actionable: true,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'ins-4',
            type: 'achievement',
            category: 'content',
            title: 'Engagement milestone reached',
            description: 'Congratulations! Your content has reached over 1,000 total engagements this month.',
            impact: 'low',
            actionable: false,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        topRecommendation: {
          id: 'ins-1',
          type: 'recommendation',
          category: 'scheduling',
          title: 'Optimize your posting schedule',
          description: 'Based on your audience engagement patterns, try posting between 7-9 PM for maximum reach and interaction.',
          impact: 'high',
          actionable: true,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        totalInsights: 4,
        unreadInsights: 4
      };
      
      res.json(mockData);
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

  // Handle Replit Auth user data endpoint
  app.get("/__replauthuser", (req, res) => {
    res.status(401).json({ error: "Not authenticated with Replit" });
  });

  // Create the HTTP server
  const httpServer = createServer(app);

  return httpServer;
}

function getReplitUser(req: Request) {
  if (req.headers['x-replit-user-id'] && req.headers['x-replit-user-name']) {
    return {
      id: req.headers['x-replit-user-id'] as string,
      name: req.headers['x-replit-user-name'] as string,
    };
  }
  return null;
}

// Helper to check if a user is authenticated
function isAuthenticated(req: Request): boolean {
  // For testing purposes, return true to bypass authentication
  return true;
}