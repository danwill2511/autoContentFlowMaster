
import { createLogger, format, transports } from 'winston';
import { join } from 'path';

const { combine, timestamp, printf, colorize, errors } = format;

interface ErrorDetails {
  code: string;
  message: string;
  context?: Record<string, any>;
  userId?: string;
}

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

export function logError(error: Error | ErrorDetails, context?: Record<string, any>) {
  const errorDetails = error instanceof Error ? {
    code: 'UNKNOWN_ERROR',
    message: error.message,
    stack: error.stack,
    ...context
  } : error;

  logger.error('Application error:', errorDetails);
}

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