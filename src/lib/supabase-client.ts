/**
 * Supabase Client - Client-side only
 * For use in client components and browser-side code
 * Now with enhanced session persistence
 */

import { getEnhancedSupabaseClient } from './enhanced-session-manager';

// Export the enhanced client
export function getSupabaseClient() {
  return getEnhancedSupabaseClient();
}

// Convenience export for compatibility
export { getSupabaseClient as default };
