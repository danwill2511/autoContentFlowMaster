import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { runMigrations } from "./db";
import { logger, requestLogger, monitorError } from "./logger";
import { generalLimiter, authLimiter, contentLimiter } from "./rate-limiter";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(requestLogger);

// Apply rate limiting
app.use(generalLimiter); // Apply general rate limiting to all routes
app.use('/api/auth', authLimiter); // Stricter limits for auth routes
app.use('/api/content', contentLimiter); // Specific limits for content generation

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  monitorError(err, { 
    path: req.path,
    method: req.method,
    userId: req.user?.id 
  });
  next(err);
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Initialize database and run migrations
    await runMigrations();
    log("Database initialized successfully");
  } catch (error) {
    log("Database initialization failed: " + error);
  }

  // Kill any existing process on port 5000
  const server = await registerRoutes(app);
  
  server.on('error', (e: any) => {
    if (e.code === 'EADDRINUSE') {
      log('Port 5000 is busy, waiting 1s and retrying...');
      setTimeout(() => {
        server.close();
        server.listen(5000, '0.0.0.0');
      }, 1000);
    }
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
