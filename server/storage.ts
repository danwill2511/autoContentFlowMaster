
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { eq, and, lte, gte, desc, sql } from "drizzle-orm";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { 
  users, platforms, workflows, workflowPlatforms, posts,
  InsertUser, InsertPlatform, InsertWorkflow, InsertWorkflowPlatform, InsertPost,
  User, Platform, Workflow, WorkflowPlatform, Post
} from "@shared/schema";
import { log } from "./vite";

// PostgreSQL connection string
const connectionString = process.env.DATABASE_URL || 
  "postgres://postgres:postgres@localhost:5432/autocontentflow";

// Client for migrations
const migrationClient = postgres(connectionString, { max: 1 });

// Client for queries
const queryClient = postgres(connectionString);

// Initialize Drizzle ORM
const db = drizzle(queryClient);

// No session store needed with JWT authentication

// Run migrations
export async function runMigrations() {
  log("Running database migrations...");
  
  try {
    await migrate(drizzle(migrationClient), { migrationsFolder: "./drizzle" });
    log("Migrations completed successfully.");
  } catch (error) {
    log("Migration error:", error);
    
    // If migrations fail in development, we create tables directly
    if (process.env.NODE_ENV === "development") {
      log("Creating tables directly in development mode...");
      try {
        // Basic schema setup for development
        await setupDevSchema();
        log("Tables created successfully.");
      } catch (devError) {
        log("Error creating dev tables:", devError);
      }
    }
  }
}

// Setup basic schema for development
async function setupDevSchema() {
  // This is a simplified schema creation for development
  // In production, use proper migrations
  try {
    // Check if users table exists
    const userTableCheck = await queryClient`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      )
    `;
    
    if (!userTableCheck[0].exists) {
      await queryClient`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          name TEXT,
          email TEXT NOT NULL UNIQUE,
          subscription TEXT NOT NULL DEFAULT 'free',
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `;
      
      await queryClient`
        CREATE TABLE platforms (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          api_key TEXT,
          api_secret TEXT,
          access_token TEXT,
          user_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `;
      
      await queryClient`
        CREATE TABLE workflows (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          user_id INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          frequency TEXT NOT NULL,
          next_post_date TIMESTAMP,
          content_type TEXT NOT NULL,
          content_tone TEXT NOT NULL,
          topics TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `;
      
      await queryClient`
        CREATE TABLE workflow_platforms (
          id SERIAL PRIMARY KEY,
          workflow_id INTEGER NOT NULL,
          platform_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `;
      
      await queryClient`
        CREATE TABLE posts (
          id SERIAL PRIMARY KEY,
          workflow_id INTEGER NOT NULL,
          content TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          scheduled_for TIMESTAMP NOT NULL,
          posted_at TIMESTAMP,
          platform_ids JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `;
      
      // Insert default platforms for testing
      await queryClient`
        INSERT INTO platforms (name, user_id)
        VALUES 
          ('Facebook', 1),
          ('Twitter', 1),
          ('LinkedIn', 1),
          ('Pinterest', 1),
          ('YouTube', 1)
      `;
    }
  } catch (error) {
    console.error("Error setting up dev schema:", error);
    throw error;
  }
}

const scryptAsync = promisify(scrypt);

class StorageService {

  async hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }

  async comparePasswords(supplied: string, stored: string) {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0];
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.email, email));
      return result[0];
    } catch (error) {
      console.error("Error getting user by email:", error);
      return undefined;
    }
  }
  
  async createUser(data: InsertUser): Promise<User> {
    try {
      const result = await db.insert(users).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
  
  async updateUserSubscription(userId: number, subscription: string): Promise<User> {
    try {
      const result = await db
        .update(users)
        .set({ subscription })
        .where(eq(users.id, userId))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error updating user subscription:", error);
      throw error;
    }
  }
  
  // Platform operations
  async getPlatform(id: number): Promise<Platform | undefined> {
    try {
      const result = await db.select().from(platforms).where(eq(platforms.id, id));
      return result[0];
    } catch (error) {
      console.error("Error getting platform:", error);
      return undefined;
    }
  }
  
  async getPlatformsByUser(userId: number): Promise<Platform[]> {
    try {
      return await db.select().from(platforms).where(eq(platforms.userId, userId));
    } catch (error) {
      console.error("Error getting platforms by user:", error);
      return [];
    }
  }
  
  async getPlatformsByIds(ids: number[]): Promise<Platform[]> {
    if (!ids.length) return [];
    
    try {
      return await db.select().from(platforms).where(sql`${platforms.id} IN ${ids}`);
    } catch (error) {
      console.error("Error getting platforms by ids:", error);
      return [];
    }
  }
  
  async createPlatform(data: InsertPlatform): Promise<Platform> {
    try {
      const result = await db.insert(platforms).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating platform:", error);
      throw error;
    }
  }
  
  async updatePlatform(id: number, data: Partial<InsertPlatform>): Promise<Platform> {
    try {
      const result = await db
        .update(platforms)
        .set(data)
        .where(eq(platforms.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error updating platform:", error);
      throw error;
    }
  }
  
  // Workflow operations
  async getWorkflow(id: number): Promise<Workflow | undefined> {
    try {
      const result = await db.select().from(workflows).where(eq(workflows.id, id));
      return result[0];
    } catch (error) {
      console.error("Error getting workflow:", error);
      return undefined;
    }
  }
  
  async getWorkflowsByUser(userId: number): Promise<Workflow[]> {
    try {
      return await db
        .select()
        .from(workflows)
        .where(eq(workflows.userId, userId))
        .orderBy(desc(workflows.createdAt));
    } catch (error) {
      console.error("Error getting workflows by user:", error);
      return [];
    }
  }
  
  async getActiveWorkflows(): Promise<Workflow[]> {
    try {
      return await db
        .select()
        .from(workflows)
        .where(eq(workflows.status, "active"));
    } catch (error) {
      console.error("Error getting active workflows:", error);
      return [];
    }
  }
  
  async countUserWorkflows(userId: number): Promise<number> {
    try {
      const result = await db
        .select({ count: sql`count(*)` })
        .from(workflows)
        .where(eq(workflows.userId, userId));
      return parseInt(result[0].count.toString());
    } catch (error) {
      console.error("Error counting user workflows:", error);
      return 0;
    }
  }
  
  async createWorkflow(data: InsertWorkflow): Promise<Workflow> {
    try {
      const result = await db.insert(workflows).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating workflow:", error);
      throw error;
    }
  }
  
  async updateWorkflow(id: number, data: Partial<InsertWorkflow>): Promise<Workflow> {
    try {
      const result = await db
        .update(workflows)
        .set(data)
        .where(eq(workflows.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error updating workflow:", error);
      throw error;
    }
  }
  
  async updateWorkflowStatus(id: number, status: string): Promise<Workflow> {
    try {
      const result = await db
        .update(workflows)
        .set({ status })
        .where(eq(workflows.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error updating workflow status:", error);
      throw error;
    }
  }
  
  async updateWorkflowNextPostDate(id: number, nextPostDate: Date): Promise<Workflow> {
    try {
      const result = await db
        .update(workflows)
        .set({ nextPostDate })
        .where(eq(workflows.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error updating workflow next post date:", error);
      throw error;
    }
  }
  
  // WorkflowPlatform operations
  async getWorkflowPlatforms(workflowId: number): Promise<WorkflowPlatform[]> {
    try {
      return await db
        .select()
        .from(workflowPlatforms)
        .where(eq(workflowPlatforms.workflowId, workflowId));
    } catch (error) {
      console.error("Error getting workflow platforms:", error);
      return [];
    }
  }
  
  async createWorkflowPlatform(data: InsertWorkflowPlatform): Promise<WorkflowPlatform> {
    try {
      const result = await db.insert(workflowPlatforms).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating workflow platform:", error);
      throw error;
    }
  }
  
  // Post operations
  async getPost(id: number): Promise<Post | undefined> {
    try {
      const result = await db.select().from(posts).where(eq(posts.id, id));
      return result[0];
    } catch (error) {
      console.error("Error getting post:", error);
      return undefined;
    }
  }
  
  async getPostsByWorkflow(workflowId: number): Promise<Post[]> {
    try {
      return await db
        .select()
        .from(posts)
        .where(eq(posts.workflowId, workflowId))
        .orderBy(desc(posts.scheduledFor));
    } catch (error) {
      console.error("Error getting posts by workflow:", error);
      return [];
    }
  }
  
  async getPendingPostsDue(dueDate: Date): Promise<Post[]> {
    try {
      return await db
        .select()
        .from(posts)
        .where(
          and(
            eq(posts.status, "pending"),
            lte(posts.scheduledFor, dueDate)
          )
        );
    } catch (error) {
      console.error("Error getting pending posts due:", error);
      return [];
    }
  }
  
  async getPostsCreatedTodayCount(userId: number): Promise<number> {
    try {
      // Get user's workflows
      const userWorkflows = await this.getWorkflowsByUser(userId);
      const workflowIds = userWorkflows.map(w => w.id);
      
      if (!workflowIds.length) return 0;
      
      // Count posts created today for these workflows
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const result = await db
        .select({ count: sql`count(*)` })
        .from(posts)
        .where(
          and(
            sql`${posts.workflowId} IN ${workflowIds}`,
            gte(posts.createdAt, today),
            lt(posts.createdAt, tomorrow)
          )
        );
      
      return parseInt(result[0].count.toString());
    } catch (error) {
      console.error("Error counting posts created today:", error);
      return 0;
    }
  }
  
  async createPost(data: InsertPost): Promise<Post> {
    try {
      const result = await db.insert(posts).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  }
  
  async updatePostStatus(
    id: number, 
    status: string, 
    postedAt?: Date
  ): Promise<Post> {
    try {
      const updateData: Partial<Post> = { status };
      if (postedAt) {
        updateData.postedAt = postedAt;
      }
      
      const result = await db
        .update(posts)
        .set(updateData)
        .where(eq(posts.id, id))
        .returning();
      
      return result[0];
    } catch (error) {
      console.error("Error updating post status:", error);
      throw error;
    }
  }
}

// Initialize the storage service
export const storage = new StorageService();

// Run migrations on startup
runMigrations().catch(error => {
  console.error("Failed to run migrations:", error);
});
