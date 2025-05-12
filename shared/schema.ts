import { pgTable, text, serial, integer, boolean, timestamp, json, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name"),
  replitId: text("replitId").unique(),
  profileImage: text("profile_image"),
  subscription: text("subscription").default("free"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const platforms = pgTable("platforms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // e.g., "twitter", "instagram", "linkedin", etc.
  apiKey: text("api_key"),
  apiSecret: text("api_secret"),
  accessToken: text("access_token"),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull(),
  status: text("status").default("active").notNull(),
  frequency: text("frequency").notNull(),
  nextPostDate: timestamp("next_post_date"),
  contentType: text("content_type").notNull(),
  contentTone: text("content_tone").notNull(),
  topics: text("topics").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workflowPlatforms = pgTable("workflow_platforms", {
  id: serial("id").primaryKey(),
  workflowId: integer("workflow_id").notNull(),
  platformId: integer("platform_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const timeOptimizations = pgTable("time_optimizations", {
  id: serial("id").primaryKey(),
  platformId: integer("platform_id").notNull(),
  platformType: text("platform_type").notNull(), // e.g., "instagram", "twitter", "linkedin"
  bestDays: jsonb("best_days").notNull(), // array of days (0-6, where 0 is Sunday)
  bestHours: jsonb("best_hours").notNull(), // array of hours (0-23)
  audienceTimezone: text("audience_timezone").default("UTC").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  engagementScore: integer("engagement_score"), // Optional engagement score from previous posts
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  workflowId: integer("workflow_id").notNull(),
  content: text("content").notNull(),
  status: text("status").default("pending").notNull(),
  scheduledFor: timestamp("scheduled_for").notNull(),
  postedAt: timestamp("posted_at"),
  platformIds: json("platform_ids").notNull(),
  optimizationApplied: boolean("optimization_applied").default(false),
  optimizationData: jsonb("optimization_data"), // Stores the calculated time optimization data
  engagementMetrics: jsonb("engagement_metrics"), // Stores engagement metrics after posting
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertPlatformSchema = createInsertSchema(platforms).omit({ id: true, createdAt: true });
export const insertWorkflowSchema = createInsertSchema(workflows).omit({ id: true, createdAt: true });
export const insertWorkflowPlatformSchema = createInsertSchema(workflowPlatforms).omit({ id: true, createdAt: true });
export const insertPostSchema = createInsertSchema(posts).omit({ id: true, createdAt: true });
export const insertTimeOptimizationSchema = createInsertSchema(timeOptimizations).omit({ id: true, createdAt: true, lastUpdated: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Platform = typeof platforms.$inferSelect;
export type InsertPlatform = z.infer<typeof insertPlatformSchema>;

export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;

export type WorkflowPlatform = typeof workflowPlatforms.$inferSelect;
export type InsertWorkflowPlatform = z.infer<typeof insertWorkflowPlatformSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type TimeOptimization = typeof timeOptimizations.$inferSelect;
export type InsertTimeOptimization = z.infer<typeof insertTimeOptimizationSchema>;

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginData = z.infer<typeof loginSchema>;

// Subscription types
export const subscriptionTiers = {
  free: {
    maxWorkflows: 2,
    dailyPostLimit: 3,
    features: ["Basic content types", "Daily post limit (3)", "No AI tone control"]
  },
  essential: {
    price: 14,
    maxWorkflows: 5,
    dailyPostLimit: 10,
    features: ["5 Workflows", "All content types", "Daily post limit (10)", "Basic AI tone control"]
  },
  pro: {
    price: 29,
    maxWorkflows: 10,
    dailyPostLimit: 25,
    features: ["10 Workflows", "Advanced content types", "Daily post limit (25)", "Advanced AI tone control"]
  },
  business: {
    price: 79,
    maxWorkflows: 9999, // Effectively unlimited
    dailyPostLimit: 9999, // Effectively unlimited
    features: ["Unlimited Workflows", "All content types + custom", "Unlimited daily posts", "Team access (5 seats)"]
  }
};

export type SubscriptionTier = keyof typeof subscriptionTiers;