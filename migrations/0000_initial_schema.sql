
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "username" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT,
  "replitId" TEXT UNIQUE,
  "subscription" TEXT DEFAULT 'free',
  "is_admin" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "platforms" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "api_key" TEXT,
  "api_secret" TEXT,
  "access_token" TEXT,
  "user_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "workflows" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "user_id" INTEGER NOT NULL,
  "status" TEXT DEFAULT 'active' NOT NULL,
  "frequency" TEXT NOT NULL,
  "next_post_date" TIMESTAMP,
  "content_type" TEXT NOT NULL,
  "content_tone" TEXT NOT NULL,
  "topics" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "workflow_platforms" (
  "id" SERIAL PRIMARY KEY,
  "workflow_id" INTEGER NOT NULL,
  "platform_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "posts" (
  "id" SERIAL PRIMARY KEY,
  "workflow_id" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "status" TEXT DEFAULT 'pending' NOT NULL,
  "scheduled_for" TIMESTAMP NOT NULL,
  "posted_at" TIMESTAMP,
  "platform_ids" JSONB NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
