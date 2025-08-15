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
    .min(1, 'Supabase URL is required'),

  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'Supabase anonymous key is required'),

  SUPABASE_SERVICE_KEY: z
    .string()
    .min(1, 'Supabase service key is required')
    .optional(),

  // PayFast configuration (optional in development)
  NEXT_PUBLIC_PAYFAST_SANDBOX: z
    .string()
    .default('true')
    .transform((val) => val === 'true'),

  PAYFAST_MERCHANT_ID: z.string().optional(),
  PAYFAST_MERCHANT_KEY: z.string().optional(),
  PAYFAST_PASSPHRASE: z.string().optional(),

  // Project metadata
  NEXT_PUBLIC_SUPABASE_PROJECT_ID: z.string().optional(),
});

/**
 * Validated environment variables
 * This will throw at build time if validation fails
 */
export const env = envSchema.parse({
  NODE_ENV: process.env['NODE_ENV'],
  NEXT_PUBLIC_SUPABASE_URL: process.env['NEXT_PUBLIC_SUPABASE_URL'],
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'],
  SUPABASE_SERVICE_KEY: process.env['SUPABASE_SERVICE_KEY'],
  NEXT_PUBLIC_PAYFAST_SANDBOX: process.env['NEXT_PUBLIC_PAYFAST_SANDBOX'],
  PAYFAST_MERCHANT_ID: process.env['PAYFAST_MERCHANT_ID'],
  PAYFAST_MERCHANT_KEY: process.env['PAYFAST_MERCHANT_KEY'],
  PAYFAST_PASSPHRASE: process.env['PAYFAST_PASSPHRASE'],
  NEXT_PUBLIC_SUPABASE_PROJECT_ID:
    process.env['NEXT_PUBLIC_SUPABASE_PROJECT_ID'],
});

/**
 * Runtime environment check for critical variables
 * Throws descriptive errors for missing configuration
 */
export function validateEnvironment(): void {
  const errors: string[] = [];

  // Critical checks that should fail fast
  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required');
  }

  if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
  }

  // Production-specific checks
  if (env.NODE_ENV === 'production') {
    if (!env.SUPABASE_SERVICE_KEY) {
      errors.push('SUPABASE_SERVICE_KEY is required in production');
    }

    if (!env.PAYFAST_MERCHANT_ID || !env.PAYFAST_MERCHANT_KEY) {
      // Warning for PayFast in production
      console.warn(
        '⚠️ PayFast credentials missing - payment features will be disabled'
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`
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

// Validate environment on module load
validateEnvironment();
