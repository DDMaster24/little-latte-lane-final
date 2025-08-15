import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { env } from '@/lib/env';

// Singleton pattern to prevent multiple client instances
let supabaseInstance: ReturnType<typeof createSupabaseClient<Database>> | null =
  null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'lll-auth-token', // Unique key to avoid conflicts
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
  return supabaseInstance;
}

// Export the client instance (legacy support)
export const supabase = getSupabaseClient();
