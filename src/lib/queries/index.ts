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
// Note: inventory table doesn't exist in current database

// Re-export the Supabase clients
export { getSupabaseClient } from '../supabase-client';
export { getSupabaseServer, getSupabaseAdmin } from '../supabase-server';
