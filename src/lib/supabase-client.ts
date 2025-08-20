/**
 * Supabase Client - Client-side only
 * For use in client components and browser-side code
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Get environment variables directly to avoid circular imports
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton client instance for browser use
let clientInstance: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  if (!clientInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    clientInstance = createClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
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
