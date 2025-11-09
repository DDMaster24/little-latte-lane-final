/**
 * Rate Limiting Utility
 * Provides rate limiting for API endpoints to prevent abuse
 */

interface RateLimitConfig {
  /**
   * Unique identifier for this rate limiter
   */
  id: string;
  /**
   * Maximum number of requests allowed in the time window
   */
  limit: number;
  /**
   * Time window in seconds
   */
  window: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store for rate limiting
// For production with multiple instances, use Redis or Vercel KV
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the client (usually IP address or user ID)
 * @param config - Rate limit configuration
 * @returns Object with success status and remaining attempts
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): {
  success: boolean;
  remaining: number;
  resetAt: number;
} {
  const key = `${config.id}:${identifier}`;
  const now = Date.now();
  const windowMs = config.window * 1000;

  const entry = rateLimitStore.get(key);

  // No existing entry or expired - create new entry
  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowMs;
    rateLimitStore.set(key, {
      count: 1,
      resetAt,
    });

    return {
      success: true,
      remaining: config.limit - 1,
      resetAt,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  // Increment counter
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    success: true,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Get client identifier from request
 * Prioritizes: User ID > IP address > fallback
 */
export function getClientIdentifier(
  request: Request,
  userId?: string
): string {
  // Prefer user ID if authenticated
  if (userId) {
    return `user:${userId}`;
  }

  // Get IP address from various headers (Vercel/Cloudflare/etc)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';

  return `ip:${ip}`;
}

/**
 * Pre-configured rate limit configurations for different endpoint types
 */
export const RateLimitPresets = {
  /** Strict limits for sensitive operations (5 requests per minute) */
  STRICT: {
    limit: 5,
    window: 60,
  },
  /** Moderate limits for standard API calls (20 requests per minute) */
  MODERATE: {
    limit: 20,
    window: 60,
  },
  /** Generous limits for read operations (100 requests per minute) */
  GENEROUS: {
    limit: 100,
    window: 60,
  },
  /** Very strict limits for webhooks (10 requests per minute) */
  WEBHOOK: {
    limit: 10,
    window: 60,
  },
  /** Account operations (3 requests per hour) */
  ACCOUNT_OPERATIONS: {
    limit: 3,
    window: 3600,
  },
  /** Payment operations (10 requests per 5 minutes) */
  PAYMENT: {
    limit: 10,
    window: 300,
  },
  /** Notification operations (30 requests per hour) */
  NOTIFICATIONS: {
    limit: 30,
    window: 3600,
  },
} as const;

/**
 * Helper to create rate limit response headers
 */
export function getRateLimitHeaders(result: {
  remaining: number;
  resetAt: number;
  limit: number;
}): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.floor(result.resetAt / 1000)),
  };
}
