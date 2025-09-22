/**
 * Supabase Server - Server-side only
 * For use in server components, API routes, and server actions
 */

import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';
import { env } from '@/lib/env';

// Admin client with service key for elevated permissions
export function getSupabaseAdmin() {
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Server client for SSR with user context
export async function getSupabaseServer() {
  const cookieStore = await cookies();
  
  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          try {
            cookieStore.set({ 
              name, 
              value, 
              ...options,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              httpOnly: false, // Allow client access for auth tokens
              path: '/',
              maxAge: 60 * 60 * 24 * 7, // 7 days
            });
          } catch (error) {
            // Handle cases where cookies can't be set (like in some server contexts)
            console.warn('Failed to set auth cookie:', error);
          }
        },
        remove(name: string, options) {
          try {
            cookieStore.set({ 
              name, 
              value: '', 
              ...options,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: 0,
            });
          } catch (error) {
            // Handle cases where cookies can't be removed
            console.warn('Failed to remove auth cookie:', error);
          }
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );
}
