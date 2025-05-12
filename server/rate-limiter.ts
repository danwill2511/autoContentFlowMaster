
import rateLimit from 'express-rate-limit';
import { logger } from './logger';

// Default rate limit configurations
const defaultLimits = {
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // Limit each IP to 1000 requests per windowMs - increased to handle development environment
  },
  auth: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20 // Limit each IP to 20 login attempts per hour - increased for development
  },
  contentGeneration: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100 // Limit each IP to 100 content generation requests per hour - increased for development
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
  // Set IP source determination directly
  keyGenerator: (req, res) => req.ip || req.connection.remoteAddress || 'unknown-ip'
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
