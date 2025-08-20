/**
 * Supabase Client - Client-side only
 * For use in client components and browser-side code
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { env } from '@/lib/env';

// Singleton client instance for browser use
let clientInstance: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  if (!clientInstance) {
    clientInstance = createClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      }
    );
  }
  return clientInstance;
}

// Convenience export for compatibility
export { getSupabaseClient as default };
