/**
 * Error Tracking and Monitoring Utilities
 * Centralized error handling with Sentry integration
 */

import * as Sentry from '@sentry/nextjs';

type ErrorContext = Record<string, unknown>;
type LogLevel = 'error' | 'warning' | 'info';

/**
 * Log error to Sentry with context
 */
export function logError(error: Error, context?: ErrorContext, level: LogLevel = 'error') {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', error, context);
  }

  Sentry.withScope((scope) => {
    // Add context to the error
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setTag(key, String(value));
      });
    }

    // Set level
    scope.setLevel(level);

    // Capture the error
    Sentry.captureException(error);
  });
}

/**
 * Log message to Sentry
 */
export function logMessage(message: string, level: LogLevel = 'info', extra?: ErrorContext) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${level.toUpperCase()}] ${message}`, extra);
  }

  Sentry.withScope((scope) => {
    if (extra) {
      scope.setExtras(extra);
    }
    scope.setLevel(level);
    Sentry.captureMessage(message);
  });
}

/**
 * Track performance metrics
 */
export function trackPerformance<T>(name: string, fn: () => Promise<T> | T): Promise<T> | T {
  return Sentry.startSpan({ name }, fn);
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: { id: string; email?: string; role?: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, category: string, data?: ErrorContext) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
    timestamp: Date.now() / 1000,
  });
}

/**
 * Monitor API routes with automatic error tracking
 */
export function withErrorTracking<T extends (...args: unknown[]) => unknown>(
  handler: T,
  context?: ErrorContext
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        handler: handler.name,
        args: args.length,
        ...context,
      });
      throw error;
    }
  }) as T;
}

/**
 * Database operation error tracking
 */
export function logDatabaseError(operation: string, table: string, error: unknown, context?: ErrorContext) {
  logError(
    error instanceof Error ? error : new Error(String(error)),
    {
      operation,
      table,
      errorType: 'database',
      ...context,
    }
  );
}

/**
 * Payment error tracking
 */
export function logPaymentError(provider: string, error: unknown, orderId?: string, amount?: number) {
  logError(
    error instanceof Error ? error : new Error(String(error)),
    {
      provider,
      orderId,
      amount,
      errorType: 'payment',
    }
  );
}

/**
 * Authentication error tracking
 */
export function logAuthError(action: string, error: unknown, userId?: string) {
  logError(
    error instanceof Error ? error : new Error(String(error)),
    {
      action,
      userId,
      errorType: 'authentication',
    }
  );
}

/**
 * Performance monitoring for critical operations
 */
export const performanceMonitor = {
  // Database queries
  async trackDatabaseQuery<T>(operation: string, table: string, query: () => Promise<T>): Promise<T> {
    return trackPerformance(`db.${table}.${operation}`, async () => {
      const start = Date.now();
      try {
        const result = await query();
        addBreadcrumb(`Database ${operation} on ${table}`, 'database', {
          duration: Date.now() - start,
          success: true,
        });
        return result;
      } catch (error) {
        logDatabaseError(operation, table, error, { duration: Date.now() - start });
        throw error;
      }
    });
  },

  // API calls
  async trackApiCall<T>(endpoint: string, method: string, call: () => Promise<T>): Promise<T> {
    return trackPerformance(`api.${method}.${endpoint}`, async () => {
      const start = Date.now();
      try {
        const result = await call();
        addBreadcrumb(`API ${method} ${endpoint}`, 'http', {
          duration: Date.now() - start,
          success: true,
        });
        return result;
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)), {
          endpoint,
          method,
          duration: Date.now() - start,
          errorType: 'api',
        });
        throw error;
      }
    });
  },

  // Payment processing
  async trackPayment<T>(provider: string, operation: string, payment: () => Promise<T>): Promise<T> {
    return trackPerformance(`payment.${provider}.${operation}`, async () => {
      const start = Date.now();
      try {
        const result = await payment();
        addBreadcrumb(`Payment ${operation} with ${provider}`, 'payment', {
          duration: Date.now() - start,
          success: true,
        });
        return result;
      } catch (error) {
        logPaymentError(provider, error);
        throw error;
      }
    });
  },
};
