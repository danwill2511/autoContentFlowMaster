import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import ws from "ws";
import * as schema from "@shared/schema";

// Set websocket constructor for Neon serverless
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a connection pool
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create a Drizzle client
export const db = drizzle(pool, { schema });

// Function to run migrations (if needed)
export async function runMigrations() {
  try {
    // Create tables if they don't exist
    const pgClient = await pool.connect();
    
    try {
      // Check if platforms table needs type column
      const checkResult = await pgClient.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'platforms' AND column_name = 'type'
      `);
      
      if (checkResult.rows.length === 0) {
        console.log("Adding 'type' column to platforms table");
        await pgClient.query(`ALTER TABLE platforms ADD COLUMN type TEXT DEFAULT 'twitter' NOT NULL`);
      }
      
      // Check if time_optimizations table exists
      const tableCheck = await pgClient.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name = 'time_optimizations'
      `);
      
      if (tableCheck.rows.length === 0) {
        console.log("Creating time_optimizations table");
        await pgClient.query(`
          CREATE TABLE time_optimizations (
            id SERIAL PRIMARY KEY,
            platform_id INTEGER NOT NULL,
            platform_type TEXT NOT NULL,
            best_days JSONB NOT NULL,
            best_hours JSONB NOT NULL,
            audience_timezone TEXT NOT NULL DEFAULT 'UTC',
            last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            engagement_score INTEGER,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
          )
        `);
      }
      
      console.log("Database initialized successfully");
      return true;
    } finally {
      pgClient.release();
    }
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}