/**
 * Centralized Data Queries
 * Single source of truth for all database operations
 */

// Export all query classes and types
export * from './menu';
export * from './orders';
export * from './auth';
export * from './bookings';
export * from './admin';
export * from './inventory';

// Re-export the unified Supabase client
export { getSupabaseClient, getSupabaseServer, getSupabaseAdmin } from '../supabase';
