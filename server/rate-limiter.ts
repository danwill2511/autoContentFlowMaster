
import rateLimit from 'express-rate-limit';
import { logger } from './logger';

// Default rate limit configurations
const defaultLimits = {
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per windowMs
  },
  auth: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5 // Limit each IP to 5 login attempts per hour
  },
  contentGeneration: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50 // Limit each IP to 50 content generation requests per hour
  }
};

// Custom handler for rate limit exceeded
const rateLimitHandler = (req: any, res: any) => {
  logger.warn({
    message: 'Rate limit exceeded',
    ip: req.ip,
    path: req.path
  });
  
  return res.status(429).json({
    message: 'Too many requests, please try again later.'
  });
};

// Create rate limiters
export const generalLimiter = rateLimit({
  windowMs: defaultLimits.general.windowMs,
  max: defaultLimits.general.max,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  // Using a correct property name for the rate limiter
  skipSuccessfulRequests: false,
  // Configure trusted proxy properly
  trustProxy: false // Explicitly disable automatic trust
});

export const authLimiter = rateLimit({
  windowMs: defaultLimits.auth.windowMs,
  max: defaultLimits.auth.max,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});

export const contentLimiter = rateLimit({
  windowMs: defaultLimits.contentGeneration.windowMs,
  max: defaultLimits.contentGeneration.max,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});
