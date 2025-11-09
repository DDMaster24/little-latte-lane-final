/**
 * Admin Authentication Utilities
 * Provides authentication and authorization checks for admin-only operations
 */

import { getSupabaseServer } from './supabase-server';
import { logger } from './logger';
import { NextResponse } from 'next/server';

export interface AdminAuthResult {
  authorized: boolean;
  user?: {
    id: string;
    email: string | null;
    is_admin: boolean | null;
    is_staff: boolean | null;
  };
  error?: string;
}

/**
 * Verify the current user is authenticated and has admin privileges
 * @returns AdminAuthResult with authorization status and user info
 */
export async function verifyAdmin(): Promise<AdminAuthResult> {
  try {
    const supabase = await getSupabaseServer();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn('Admin auth attempt without authentication');
      return {
        authorized: false,
        error: 'Authentication required',
      };
    }

    // Get user profile to check admin status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, is_admin, is_staff')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      logger.error('Failed to fetch user profile for admin check', profileError);
      return {
        authorized: false,
        error: 'Failed to verify admin status',
      };
    }

    // Check if user is admin (handle null case)
    if (!profile.is_admin || profile.is_admin === null) {
      logger.warn('Non-admin user attempted admin operation', {
        userId: user.id,
        email: profile.email,
      });
      return {
        authorized: false,
        user: profile,
        error: 'Admin privileges required',
      };
    }

    logger.debug('Admin authenticated successfully', { userId: user.id });

    return {
      authorized: true,
      user: profile,
    };
  } catch (error) {
    logger.error('Admin authentication error', error);
    return {
      authorized: false,
      error: 'Authentication system error',
    };
  }
}

/**
 * Create an unauthorized response with proper status code
 */
export function unauthorizedResponse(message = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}

/**
 * Create a forbidden response for non-admin users
 */
export function forbiddenResponse(message = 'Admin privileges required'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  );
}

/**
 * Middleware-style function that checks admin auth and returns error response if unauthorized
 * Returns null if authorized, or NextResponse if unauthorized
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const authResult = await verifyAdmin();

  if (!authResult.authorized) {
    if (!authResult.user) {
      // No user - not authenticated
      return unauthorizedResponse(authResult.error);
    } else {
      // User exists but not admin - forbidden
      return forbiddenResponse(authResult.error);
    }
  }

  return null; // Authorized
}
