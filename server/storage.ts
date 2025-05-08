import { users, workflows, platforms, workflowPlatforms, posts } from "@shared/schema";
import type { User, InsertUser, Workflow, InsertWorkflow, Platform, InsertPlatform, WorkflowPlatform, InsertWorkflowPlatform, Post, InsertPost } from "@shared/schema";
import { and, eq, desc, lte, gte, sql } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";
import { randomUUID } from "crypto";
import { db } from "./db";
import connectPg from "connect-pg-simple";
import { pool } from './db';

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserSubscription(userId: number, subscription: string): Promise<User>;
  
  // Workflow methods
  getWorkflow(id: number): Promise<Workflow | undefined>;
  getWorkflowsByUser(userId: number): Promise<Workflow[]>;
  getActiveWorkflows(): Promise<Workflow[]>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: number, workflow: Partial<InsertWorkflow>): Promise<Workflow>;
  updateWorkflowStatus(id: number, status: string): Promise<Workflow>;
  updateWorkflowNextPostDate(id: number, nextPostDate: Date): Promise<Workflow>;
  countUserWorkflows(userId: number): Promise<number>;
  
  // Platform methods
  getPlatform(id: number): Promise<Platform | undefined>;
  getPlatformsByUser(userId: number): Promise<Platform[]>;
  getPlatformsByIds(ids: number[]): Promise<Platform[]>;
  createPlatform(platform: InsertPlatform): Promise<Platform>;
  updatePlatform(id: number, platform: Partial<InsertPlatform>): Promise<Platform>;
  
  // WorkflowPlatform methods
  getWorkflowPlatforms(workflowId: number): Promise<WorkflowPlatform[]>;
  createWorkflowPlatform(workflowPlatform: InsertWorkflowPlatform): Promise<WorkflowPlatform>;
  
  // Post methods
  getPost(id: number): Promise<Post | undefined>;
  getPostsByWorkflow(workflowId: number): Promise<Post[]>;
  getPendingPostsDue(date: Date): Promise<Post[]>;
  getPostsCreatedTodayCount(userId: number): Promise<number>;
  createPost(post: InsertPost): Promise<Post>;
  updatePostStatus(id: number, status: string, postedAt?: Date): Promise<Post>;
  
  // Session store
  sessionStore: any; // Using any for session store type to avoid compatibility issues
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private workflowsMap: Map<number, Workflow>;
  private platformsMap: Map<number, Platform>;
  private workflowPlatformsMap: Map<number, WorkflowPlatform>;
  private postsMap: Map<number, Post>;
  private userCurrentId: number;
  private workflowCurrentId: number;
  private platformCurrentId: number;
  private workflowPlatformCurrentId: number;
  private postCurrentId: number;
  sessionStore: any; // Using any for session store type to avoid compatibility issues

  constructor() {
    this.usersMap = new Map();
    this.workflowsMap = new Map();
    this.platformsMap = new Map();
    this.workflowPlatformsMap = new Map();
    this.postsMap = new Map();
    this.userCurrentId = 1;
    this.workflowCurrentId = 1;
    this.platformCurrentId = 1;
    this.workflowPlatformCurrentId = 1;
    this.postCurrentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Create initial demo user
    this.createUser({
      username: "demo",
      password: "password123",
      name: "Demo User",
      email: "demo@example.com",
      subscription: "essential",
      isAdmin: false
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username
    );
  }
  

  // Get user by Replit ID
  async getUserByReplitId(replitId: string): Promise<User | undefined> {
    if (!replitId) return undefined;
    return Array.from(this.usersMap.values()).find(
      (user) => user.replitId === replitId
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email,
      name: insertUser.name || null,
      replitId: insertUser.replitId || null,
      subscription: insertUser.subscription || "free",
      isAdmin: insertUser.isAdmin !== undefined ? insertUser.isAdmin : false,
      createdAt: now
    };
    this.usersMap.set(id, user);
    return user;
  }
  
  async updateUserSubscription(userId: number, subscription: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    
    const updatedUser: User = {
      ...user,
      subscription
    };
    
    this.usersMap.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateUser(userId: number, updates: Partial<User>): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    
    const updatedUser: User = {
      ...user,
      ...updates
    };
    
    this.usersMap.set(userId, updatedUser);
    return updatedUser;
  }

  // Workflow methods
  async getWorkflow(id: number): Promise<Workflow | undefined> {
    return this.workflowsMap.get(id);
  }
  
  async getWorkflowsByUser(userId: number): Promise<Workflow[]> {
    return Array.from(this.workflowsMap.values()).filter(
      (workflow) => workflow.userId === userId
    );
  }
  
  async getActiveWorkflows(): Promise<Workflow[]> {
    return Array.from(this.workflowsMap.values()).filter(
      (workflow) => workflow.status === "active"
    );
  }
  
  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const id = this.workflowCurrentId++;
    const now = new Date();
    const workflow: Workflow = {
      id,
      name: insertWorkflow.name,
      userId: insertWorkflow.userId,
      frequency: insertWorkflow.frequency,
      contentType: insertWorkflow.contentType,
      contentTone: insertWorkflow.contentTone,
      topics: insertWorkflow.topics,
      status: insertWorkflow.status || "active",
      nextPostDate: insertWorkflow.nextPostDate || null,
      createdAt: now
    };
    this.workflowsMap.set(id, workflow);
    return workflow;
  }
  
  async updateWorkflow(id: number, workflowUpdates: Partial<InsertWorkflow>): Promise<Workflow> {
    const workflow = await this.getWorkflow(id);
    if (!workflow) {
      throw new Error(`Workflow ${id} not found`);
    }
    
    const updatedWorkflow: Workflow = {
      ...workflow,
      ...workflowUpdates
    };
    
    this.workflowsMap.set(id, updatedWorkflow);
    return updatedWorkflow;
  }
  
  async updateWorkflowStatus(id: number, status: string): Promise<Workflow> {
    return this.updateWorkflow(id, { status });
  }
  
  async updateWorkflowNextPostDate(id: number, nextPostDate: Date): Promise<Workflow> {
    return this.updateWorkflow(id, { nextPostDate });
  }
  
  async countUserWorkflows(userId: number): Promise<number> {
    return (await this.getWorkflowsByUser(userId)).length;
  }

  // Platform methods
  async getPlatform(id: number): Promise<Platform | undefined> {
    return this.platformsMap.get(id);
  }
  
  async getPlatformsByUser(userId: number): Promise<Platform[]> {
    return Array.from(this.platformsMap.values()).filter(
      (platform) => platform.userId === userId
    );
  }
  
  async getPlatformsByIds(ids: number[]): Promise<Platform[]> {
    return ids.map(id => this.platformsMap.get(id)).filter(Boolean) as Platform[];
  }
  
  async createPlatform(insertPlatform: InsertPlatform): Promise<Platform> {
    const id = this.platformCurrentId++;
    const now = new Date();
    const platform: Platform = {
      id,
      name: insertPlatform.name,
      userId: insertPlatform.userId,
      apiKey: insertPlatform.apiKey || null,
      apiSecret: insertPlatform.apiSecret || null,
      accessToken: insertPlatform.accessToken || null,
      createdAt: now
    };
    this.platformsMap.set(id, platform);
    return platform;
  }
  
  async updatePlatform(id: number, platformUpdates: Partial<InsertPlatform>): Promise<Platform> {
    const platform = await this.getPlatform(id);
    if (!platform) {
      throw new Error(`Platform ${id} not found`);
    }
    
    const updatedPlatform: Platform = {
      ...platform,
      ...platformUpdates
    };
    
    this.platformsMap.set(id, updatedPlatform);
    return updatedPlatform;
  }

  // WorkflowPlatform methods
  async getWorkflowPlatforms(workflowId: number): Promise<WorkflowPlatform[]> {
    return Array.from(this.workflowPlatformsMap.values()).filter(
      (wp) => wp.workflowId === workflowId
    );
  }
  
  async createWorkflowPlatform(insertWorkflowPlatform: InsertWorkflowPlatform): Promise<WorkflowPlatform> {
    const id = this.workflowPlatformCurrentId++;
    const now = new Date();
    const workflowPlatform: WorkflowPlatform = {
      ...insertWorkflowPlatform,
      id,
      createdAt: now
    };
    this.workflowPlatformsMap.set(id, workflowPlatform);
    return workflowPlatform;
  }

  // Post methods
  async getPost(id: number): Promise<Post | undefined> {
    return this.postsMap.get(id);
  }
  
  async getPostsByWorkflow(workflowId: number): Promise<Post[]> {
    return Array.from(this.postsMap.values()).filter(
      (post) => post.workflowId === workflowId
    ).sort((a, b) => {
      // Sort by scheduled date, most recent first
      return new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime();
    });
  }
  
  async getPendingPostsDue(date: Date): Promise<Post[]> {
    return Array.from(this.postsMap.values()).filter(
      (post) => 
        post.status === "pending" && 
        new Date(post.scheduledFor) <= date
    );
  }
  
  async getPostsCreatedTodayCount(userId: number): Promise<number> {
    // Get all workflows for this user
    const userWorkflows = await this.getWorkflowsByUser(userId);
    const userWorkflowIds = userWorkflows.map(w => w.id);
    
    // Get all posts created today for these workflows
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.postsMap.values()).filter(post => {
      const postDate = new Date(post.createdAt);
      return (
        userWorkflowIds.includes(post.workflowId) &&
        postDate >= today
      );
    }).length;
  }
  
  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.postCurrentId++;
    const now = new Date();
    const post: Post = {
      id,
      workflowId: insertPost.workflowId,
      content: insertPost.content,
      scheduledFor: insertPost.scheduledFor,
      platformIds: insertPost.platformIds,
      status: insertPost.status || "pending",
      postedAt: insertPost.postedAt || null,
      createdAt: now
    };
    this.postsMap.set(id, post);
    return post;
  }
  
  async updatePostStatus(id: number, status: string, postedAt?: Date): Promise<Post> {
    const post = await this.getPost(id);
    if (!post) {
      throw new Error(`Post ${id} not found`);
    }
    
    const updatedPost: Post = {
      ...post,
      status,
      ...(postedAt && { postedAt })
    };
    
    this.postsMap.set(id, updatedPost);
    return updatedPost;
  }
}

// Define Database Storage class
export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
      tableName: 'session'
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByReplitId(replitId: string): Promise<User | undefined> {
    if (!replitId) return undefined;
    const [user] = await db.select().from(users).where(eq(users.replitId, replitId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserSubscription(userId: number, subscription: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ subscription })
      .where(eq(users.id, userId))
      .returning();
    
    if (!updatedUser) {
      throw new Error(`User ${userId} not found`);
    }
    
    return updatedUser;
  }

  // Workflow methods
  async getWorkflow(id: number): Promise<Workflow | undefined> {
    const [workflow] = await db.select().from(workflows).where(eq(workflows.id, id));
    return workflow;
  }

  async getWorkflowsByUser(userId: number): Promise<Workflow[]> {
    return db.select().from(workflows).where(eq(workflows.userId, userId));
  }

  async getActiveWorkflows(): Promise<Workflow[]> {
    return db.select().from(workflows).where(eq(workflows.status, "active"));
  }

  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const [workflow] = await db.insert(workflows).values(insertWorkflow).returning();
    return workflow;
  }

  async updateWorkflow(id: number, workflowUpdates: Partial<InsertWorkflow>): Promise<Workflow> {
    const [updatedWorkflow] = await db
      .update(workflows)
      .set(workflowUpdates)
      .where(eq(workflows.id, id))
      .returning();
    
    if (!updatedWorkflow) {
      throw new Error(`Workflow ${id} not found`);
    }
    
    return updatedWorkflow;
  }

  async updateWorkflowStatus(id: number, status: string): Promise<Workflow> {
    return this.updateWorkflow(id, { status });
  }

  async updateWorkflowNextPostDate(id: number, nextPostDate: Date): Promise<Workflow> {
    return this.updateWorkflow(id, { nextPostDate });
  }

  async countUserWorkflows(userId: number): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(workflows)
      .where(eq(workflows.userId, userId));
    
    return result[0]?.count || 0;
  }

  // Platform methods
  async getPlatform(id: number): Promise<Platform | undefined> {
    const [platform] = await db.select().from(platforms).where(eq(platforms.id, id));
    return platform;
  }

  async getPlatformsByUser(userId: number): Promise<Platform[]> {
    return db.select().from(platforms).where(eq(platforms.userId, userId));
  }

  async getPlatformsByIds(ids: number[]): Promise<Platform[]> {
    if (!ids.length) return [];
    return db.select().from(platforms).where(sql`${platforms.id} IN (${ids.join(',')})`);
  }

  async createPlatform(insertPlatform: InsertPlatform): Promise<Platform> {
    const [platform] = await db.insert(platforms).values(insertPlatform).returning();
    return platform;
  }

  async updatePlatform(id: number, platformUpdates: Partial<InsertPlatform>): Promise<Platform> {
    const [updatedPlatform] = await db
      .update(platforms)
      .set(platformUpdates)
      .where(eq(platforms.id, id))
      .returning();
    
    if (!updatedPlatform) {
      throw new Error(`Platform ${id} not found`);
    }
    
    return updatedPlatform;
  }

  // WorkflowPlatform methods
  async getWorkflowPlatforms(workflowId: number): Promise<WorkflowPlatform[]> {
    return db
      .select()
      .from(workflowPlatforms)
      .where(eq(workflowPlatforms.workflowId, workflowId));
  }

  async createWorkflowPlatform(insertWorkflowPlatform: InsertWorkflowPlatform): Promise<WorkflowPlatform> {
    const [workflowPlatform] = await db
      .insert(workflowPlatforms)
      .values(insertWorkflowPlatform)
      .returning();
    
    return workflowPlatform;
  }

  // Post methods
  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async getPostsByWorkflow(workflowId: number): Promise<Post[]> {
    return db
      .select()
      .from(posts)
      .where(eq(posts.workflowId, workflowId))
      .orderBy(desc(posts.scheduledFor));
  }

  async getPendingPostsDue(date: Date): Promise<Post[]> {
    return db
      .select()
      .from(posts)
      .where(
        and(
          eq(posts.status, "pending"),
          lte(posts.scheduledFor, date)
        )
      );
  }

  async getPostsCreatedTodayCount(userId: number): Promise<number> {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all workflows for this user
    const userWorkflows = await this.getWorkflowsByUser(userId);
    
    if (!userWorkflows.length) return 0;
    
    const userWorkflowIds = userWorkflows.map(w => w.id);
    
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(
        and(
          sql`${posts.workflowId} IN (${userWorkflowIds.join(',')})`,
          gte(posts.createdAt, today)
        )
      );
    
    return result[0]?.count || 0;
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db.insert(posts).values(insertPost).returning();
    return post;
  }

  async updatePostStatus(id: number, status: string, postedAt?: Date): Promise<Post> {
    const updateData: any = { status };
    if (postedAt) {
      updateData.postedAt = postedAt;
    }
    
    const [updatedPost] = await db
      .update(posts)
      .set(updateData)
      .where(eq(posts.id, id))
      .returning();
    
    if (!updatedPost) {
      throw new Error(`Post ${id} not found`);
    }
    
    return updatedPost;
  }
}

// Create DB storage instance
export const storage = new DatabaseStorage();
