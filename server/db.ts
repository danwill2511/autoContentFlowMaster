
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Check if database URL is available
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create SQL connection for migrations
const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });

// Create SQL connection for queries with connection pooling
const queryClient = postgres(process.env.DATABASE_URL.replace('.us-east-2', '-pooler.us-east-2'), { 
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10
});

// Initialize Drizzle with the schema
export const db = drizzle(queryClient, { schema });

// Function to run migrations
export const runMigrations = async () => {
  console.log("Running database migrations...");
  try {
    await migrate(drizzle(migrationClient), { migrationsFolder: "./migrations" });
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await migrationClient.end();
  }
};
