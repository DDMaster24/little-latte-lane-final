import { z } from 'zod';

/**
 * Environment validation schema
 * Ensures all required environment variables are present and valid
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Supabase configuration
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url('Invalid Supabase URL format')
    .min(1, 'Supabase URL is required')
    .optional(), // Make optional for build-time

  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'Supabase anonymous key is required')
    .optional(), // Make optional for build-time

  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'Supabase service role key is required')
    .optional(),

  // Yoco payment configuration (optional in development)
  NEXT_PUBLIC_YOCO_TEST_MODE: z
    .string()
    .default('true')
    .transform((val) => val === 'true'),

  YOCO_SECRET_KEY: z.string().optional(),
  YOCO_PUBLIC_KEY: z.string().optional(),
  YOCO_WEBHOOK_SECRET: z.string().optional(),

  // Webhook security
  SUPABASE_WEBHOOK_SECRET: z.string().optional(),

  // Project metadata
  NEXT_PUBLIC_SUPABASE_PROJECT_ID: z.string().optional(),

  // Site URL for callbacks, redirects, and QR codes
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url('Invalid site URL format')
    .optional(),
});

/**
 * Check if we're in a build context where env vars might not be available
 */
const isBuildTime = () => {
  return (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.NEXT_PHASE === 'phase-export' ||
    process.env.NODE_ENV === undefined ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL
  );
};

/**
 * Validated environment variables with build-time fallbacks
 */
export const env = envSchema.parse({
  NODE_ENV: process.env['NODE_ENV'] || 'development',
  NEXT_PUBLIC_SUPABASE_URL: process.env['NEXT_PUBLIC_SUPABASE_URL'] || (isBuildTime() ? 'https://build-placeholder.supabase.co' : undefined),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || (isBuildTime() ? 'build-placeholder-key' : undefined),
  SUPABASE_SERVICE_ROLE_KEY: process.env['SUPABASE_SERVICE_ROLE_KEY'] || (isBuildTime() ? 'build-placeholder-key' : undefined),
  NEXT_PUBLIC_YOCO_TEST_MODE: process.env['NEXT_PUBLIC_YOCO_TEST_MODE'],
  YOCO_SECRET_KEY: process.env['YOCO_SECRET_KEY'],
  YOCO_PUBLIC_KEY: process.env['YOCO_PUBLIC_KEY'],
  YOCO_WEBHOOK_SECRET: process.env['YOCO_WEBHOOK_SECRET'],
  SUPABASE_WEBHOOK_SECRET: process.env['SUPABASE_WEBHOOK_SECRET'],
  NEXT_PUBLIC_SUPABASE_PROJECT_ID:
    process.env['NEXT_PUBLIC_SUPABASE_PROJECT_ID'],
  NEXT_PUBLIC_SITE_URL: process.env['NEXT_PUBLIC_SITE_URL'],
});

/**
 * Runtime environment check for critical variables
 * Throws descriptive errors for missing configuration
 */
export function validateEnvironment(): void {
  // Skip validation during build time
  if (isBuildTime()) {
    // Note: Using console.log here to avoid circular dependency with logger
    console.log('⚙️ Skipping environment validation during build time');
    return;
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // SECURITY: Fail hard if placeholders are detected in runtime
  if (env.NEXT_PUBLIC_SUPABASE_URL === 'https://build-placeholder.supabase.co') {
    errors.push('NEXT_PUBLIC_SUPABASE_URL contains build-time placeholder - set real value!');
  }

  if (env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'build-placeholder-key') {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY contains build-time placeholder - set real value!');
  }

  if (env.SUPABASE_SERVICE_ROLE_KEY === 'build-placeholder-key') {
    errors.push('SUPABASE_SERVICE_ROLE_KEY contains build-time placeholder - set real value!');
  }

  // Critical checks that should fail fast
  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required');
  }

  if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
  }

  // Production-specific checks
  if (env.NODE_ENV === 'production') {
    // Mandatory in production
    if (!env.SUPABASE_SERVICE_ROLE_KEY) {
      errors.push('SUPABASE_SERVICE_ROLE_KEY is required in production');
    }

    // Mandatory for payments
    if (!env.YOCO_SECRET_KEY) {
      errors.push('YOCO_SECRET_KEY is required in production');
    }

    if (!env.YOCO_WEBHOOK_SECRET) {
      errors.push('YOCO_WEBHOOK_SECRET is required in production');
    }

    // Mandatory for secure webhooks
    if (!env.SUPABASE_WEBHOOK_SECRET) {
      warnings.push('SUPABASE_WEBHOOK_SECRET is missing - auth webhooks will fail');
    }

    // Verify not in test mode
    if (env.NEXT_PUBLIC_YOCO_TEST_MODE === true) {
      warnings.push('Yoco is in TEST MODE in production - payments will not be real!');
    }
  }

  // Log warnings
  if (warnings.length > 0) {
    // Note: Using console.warn here to avoid circular dependency with logger
    console.warn(
      '⚠️ Environment warnings:\n' + warnings.map((w) => `  - ${w}`).join('\n')
    );
  }

  // Fail if any errors
  if (errors.length > 0) {
    throw new Error(
      `❌ PRODUCTION DEPLOYMENT BLOCKED - Environment validation failed:\n${errors.map((e) => `  - ${e}`).join('\n')}\n\n` +
      `Please set these environment variables in your deployment platform (Vercel, etc.)`
    );
  }
}

/**
 * Safe environment getter with fallbacks
 * Use this instead of direct process.env access
 */
export function getEnvVar(key: keyof typeof env, fallback?: string): string {
  const value = env[key];
  if (value === undefined && fallback !== undefined) {
    return fallback;
  }
  return String(value);
}

// Skip automatic validation - will be done by individual modules when needed
// This prevents build-time validation failures when env vars aren't available
// Validation will happen at runtime when the actual services are used
