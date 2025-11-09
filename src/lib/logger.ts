/**
 * Safe Logging Utility
 * Provides sanitized logging for production to prevent sensitive data leakage
 */

/**
 * Sensitive field patterns to redact from logs
 */
const SENSITIVE_PATTERNS = [
  // Authentication & Secrets
  /password/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /auth/i,
  /bearer/i,

  // Payment Information
  /card[_-]?number/i,
  /cvv/i,
  /cvc/i,
  /expiry/i,
  /payment[_-]?method/i,

  // Personal Information
  /email/i,
  /phone/i,
  /address/i,
  /ssn/i,
  /id[_-]?number/i,

  // Metadata that might contain sensitive info
  /signature/i,
];

/**
 * Check if a key is sensitive
 */
function isSensitiveKey(key: string): boolean {
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(key));
}

/**
 * Redact sensitive value
 */
function redactValue(value: unknown): string {
  if (typeof value === 'string') {
    if (value.length <= 4) return '***';
    return `${value.substring(0, 2)}***${value.substring(value.length - 2)}`;
  }
  return '[REDACTED]';
}

/**
 * Recursively sanitize an object, redacting sensitive fields
 */
function sanitizeObject(obj: unknown, depth = 0): unknown {
  // Prevent infinite recursion
  if (depth > 5) return '[MAX_DEPTH]';

  if (obj === null || obj === undefined) return obj;

  // Arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1));
  }

  // Objects
  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (isSensitiveKey(key)) {
        sanitized[key] = redactValue(value);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value, depth + 1);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  return obj;
}

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Safe logger that sanitizes sensitive data
 */
class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Format log message with sanitization
   */
  private format(level: LogLevel, message: string, data?: unknown): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (data === undefined) {
      console[level](`${prefix} ${message}`);
      return;
    }

    // In development, show full data for debugging
    if (this.isDevelopment) {
      console[level](`${prefix} ${message}`, data);
      return;
    }

    // In production, sanitize data
    const sanitized = sanitizeObject(data);
    console[level](`${prefix} ${message}`, sanitized);
  }

  /**
   * Debug logging (only in development)
   */
  debug(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      this.format(LogLevel.DEBUG, message, data);
    }
  }

  /**
   * Info logging
   */
  info(message: string, data?: unknown): void {
    this.format(LogLevel.INFO, message, data);
  }

  /**
   * Warning logging
   */
  warn(message: string, data?: unknown): void {
    this.format(LogLevel.WARN, message, data);
  }

  /**
   * Error logging
   */
  error(message: string, error?: unknown): void {
    if (error instanceof Error) {
      this.format(LogLevel.ERROR, message, {
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
        name: error.name,
      });
    } else {
      this.format(LogLevel.ERROR, message, error);
    }
  }

  /**
   * Log with custom data sanitization
   */
  custom(level: LogLevel, message: string, data?: unknown): void {
    this.format(level, message, data);
  }
}

/**
 * Singleton logger instance
 */
export const logger = new Logger();

/**
 * Helper to sanitize data for manual logging
 */
export function sanitize(data: unknown): unknown {
  return sanitizeObject(data);
}

/**
 * Quick logging helpers
 */
export const log = {
  debug: (msg: string, data?: unknown) => logger.debug(msg, data),
  info: (msg: string, data?: unknown) => logger.info(msg, data),
  warn: (msg: string, data?: unknown) => logger.warn(msg, data),
  error: (msg: string, error?: unknown) => logger.error(msg, error),
};
