/**
 * Unified Supabase Client
 * Single source of truth for all Supabase operations
 */

import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';
import { env } from '@/lib/env';

// Client-side singleton
let clientInstance: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Get client-side Supabase instance
 * Use this in client components and browser-side code
 */
export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    throw new Error(
      'getSupabaseClient() should only be called on the client side. Use getSupabaseServer() for server-side operations.'
    );
  }

  if (!clientInstance) {
    clientInstance = createClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'lll-auth-token',
        },
        global: {
          headers: {
            'cache-control': 'max-age=300',
          },
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      }
    );
  }
  return clientInstance;
}

/**
 * Get server-side Supabase instance
 * Use this in server components, API routes, and server actions
 */
export async function getSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Get service role client for admin operations
 * Use this only in secure server-side contexts
 */
export function getSupabaseAdmin() {
  if (!env.SUPABASE_SERVICE_KEY) {
    throw new Error(
      'SUPABASE_SERVICE_KEY is required for admin operations'
    );
  }

  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Legacy export for backward compatibility
export const supabase = typeof window !== 'undefined' ? getSupabaseClient() : null;
