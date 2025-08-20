/**
 * Authentication Queries
 * Centralized auth operations and user management
 */

import type { Database } from '@/types/supabase';
import { getSupabaseClient } from '@/lib/supabase-client';
import { getSupabaseServer } from '@/lib/supabase-server';
import type { User } from '@supabase/supabase-js';

type Tables = Database['public']['Tables'];
type ProfileRow = Tables['profiles']['Row'];
type ProfileInsert = Tables['profiles']['Insert'];
type ProfileUpdate = Tables['profiles']['Update'];

export type UserWithProfile = User & {
  profile: ProfileRow | null;
};

/**
 * Client-side auth queries
 */
export class AuthQueries {
  private client = getSupabaseClient();

  /**
   * Get current user with profile
   */
  async getCurrentUser(): Promise<UserWithProfile | null> {
    const { data: { user }, error: authError } = await this.client.auth.getUser();
    
    if (authError || !user) return null;

    const { data: profile } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { ...user, profile };
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<ProfileRow | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: ProfileUpdate): Promise<ProfileRow> {
    const { data, error } = await this.client
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, userData?: Partial<ProfileInsert>) {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    if (error) throw error;
    return data;
  }

  /**
   * Sign out
   */
  async signOut() {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }

  /**
   * Check if user has required role
   */
  async hasRole(userId: string, requiredRole: string | string[]): Promise<boolean> {
    const profile = await this.getUserProfile(userId);
    if (!profile) return false;

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // Map database fields to roles
    if (roles.includes('admin') && profile.is_admin) return true;
    if (roles.includes('staff') && profile.is_staff) return true;
    if (roles.includes('user')) return true; // All profiles are users
    
    return false;
  }

  /**
   * Check if user is admin
   */
  async isAdmin(userId: string): Promise<boolean> {
    return this.hasRole(userId, ['admin', 'super_admin']);
  }

  /**
   * Check if user is staff
   */
  async isStaff(userId: string): Promise<boolean> {
    return this.hasRole(userId, ['staff', 'admin', 'super_admin']);
  }
}

/**
 * Server-side auth queries
 */
export class ServerAuthQueries {
  /**
   * Get current user with profile (server-side)
   */
  static async getCurrentUser(): Promise<UserWithProfile | null> {
    const supabase = await getSupabaseServer();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { ...user, profile };
  }

  /**
   * Get user profile by ID (server-side)
   */
  static async getUserProfile(userId: string): Promise<ProfileRow | null> {
    const supabase = await getSupabaseServer();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  /**
   * Check if user has required role (server-side)
   */
  static async hasRole(userId: string, requiredRole: string | string[]): Promise<boolean> {
    const profile = await this.getUserProfile(userId);
    if (!profile) return false;

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // Map database fields to roles
    if (roles.includes('admin') && profile.is_admin) return true;
    if (roles.includes('staff') && profile.is_staff) return true;
    if (roles.includes('user')) return true; // All profiles are users
    
    return false;
  }

  /**
   * Check if user is admin (server-side)
   */
  static async isAdmin(userId: string): Promise<boolean> {
    return this.hasRole(userId, ['admin', 'super_admin']);
  }

  /**
   * Check if user is staff (server-side)
   */
  static async isStaff(userId: string): Promise<boolean> {
    return this.hasRole(userId, ['staff', 'admin', 'super_admin']);
  }
}

// Singleton instance for client-side usage
export const authQueries = new AuthQueries();
