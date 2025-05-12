
import winston from 'winston';
import { format } from 'winston';

const errorLogger = winston.createLogger({
  level: 'error',
  format: format.combine(
    format.timestamp(),
    format.json(),
    format.errors({ stack: true })
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log' }),
    new winston.transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

interface ErrorDetails {
  code: string;
  message: string;
  context?: Record<string, any>;
  userId?: string;
}

export function logError(error: Error | ErrorDetails, context?: Record<string, any>) {
  const errorDetails = error instanceof Error ? {
    code: 'UNKNOWN_ERROR',
    message: error.message,
    stack: error.stack,
    ...context
  } : error;

  errorLogger.error('Application error:', errorDetails);
}

export const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

import { createLogger, format, transports } from 'winston';
import { join } from 'path';

const { combine, timestamp, printf, colorize, errors } = format;

// Custom format for logs
const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let log = `${timestamp} [${level}]: ${typeof message === 'object' ? JSON.stringify(message) : message}`;
  if (Object.keys(metadata).length > 0) {
    log += ` ${JSON.stringify(metadata, null, 2)}`;
  }
  if (stack) {
    log += `\n${stack}`;
  }
  return log;
});

// Create logger instance
export const logger = createLogger({
  format: combine(
    timestamp(),
    errors({ stack: true }),
    colorize(),
    logFormat
  ),
  transports: [
    // Console transport
    new transports.Console(),
    // File transport for errors
    new transports.File({
      filename: join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // File transport for all logs
    new transports.File({
      filename: join('logs', 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// Error monitoring
export function monitorError(error: Error, metadata: Record<string, any> = {}) {
  logger.error({
    message: error.message,
    stack: error.stack,
    ...metadata,
  });
}

// Request monitoring middleware
export function requestLogger(req: any, res: any, next: any) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });
  
  next();
}

// Performance monitoring
export function monitorPerformance(operation: string, duration: number, metadata: Record<string, any> = {}) {
  logger.info({
    operation,
    duration: `${duration}ms`,
    ...metadata,
  });
}