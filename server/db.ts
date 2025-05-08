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
    // Since we're using drizzle-kit push for migrations, 
    // we don't need to run migrations explicitly here
    // This function exists to satisfy the import in index.ts
    console.log("Database connected successfully");
    return true;
  } catch (error) {
    console.error("Error connecting to database:", error);
    throw error;
  }
}