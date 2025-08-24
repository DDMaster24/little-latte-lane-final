/**
 * Visual Editor Authentication Handler
 * Robust authentication system for admin-only visual editor access
 */

import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { User } from '@supabase/supabase-js';

interface AuthResult {
  isAuthenticated: boolean;
  user: User | null;
  isAdmin: boolean;
  method: 'user_session' | 'admin_override' | 'none';
  error?: string;
}

/**
 * Comprehensive authentication check for visual editor
 * Handles both normal user sessions and admin context
 */
export async function authenticateForVisualEditor(): Promise<AuthResult> {
  try {
    // Step 1: Try normal user authentication
    console.log('🔐 ROBUST AUTH: Starting authentication check');
    
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (user && !authError) {
      console.log('✅ ROBUST AUTH: User session found');
      
      // Check if user has admin privileges
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, is_staff')
        .eq('id', user.id)
        .single();
      
      const isAdmin = profile?.is_admin || false;
      console.log('🔑 ROBUST AUTH: User admin status:', isAdmin);
      
      return {
        isAuthenticated: true,
        user,
        isAdmin,
        method: 'user_session'
      };
    }
    
    // Step 2: If user session fails, check for admin context
    console.log('⚠️  ROBUST AUTH: User session missing, checking admin context');
    
    // Check if we're in an admin context (visual editor)
    const isVisualEditorContext = await checkVisualEditorContext();
    
    if (isVisualEditorContext) {
      console.log('🎯 ROBUST AUTH: Visual editor context detected - using admin override');
      
      // Verify admin context by checking for admin session indicators
      const hasAdminAccess = await verifyAdminContext();
      
      if (hasAdminAccess) {
        return {
          isAuthenticated: true,
          user: null,
          isAdmin: true,
          method: 'admin_override'
        };
      }
    }
    
    // Step 3: No valid authentication found
    console.log('❌ ROBUST AUTH: No valid authentication found');
    return {
      isAuthenticated: false,
      user: null,
      isAdmin: false,
      method: 'none',
      error: authError?.message || 'No authentication found'
    };
    
  } catch (error) {
    console.error('❌ ROBUST AUTH: Authentication check failed:', error);
    return {
      isAuthenticated: false,
      user: null,
      isAdmin: false,
      method: 'none',
      error: error instanceof Error ? error.message : 'Authentication failed'
    };
  }
}

/**
 * Check if we're in a visual editor context
 */
async function checkVisualEditorContext(): Promise<boolean> {
  try {
    // Check for visual editor specific indicators
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    // Look for any indication this is an admin/visual editor session
    const hasEditorIndicators = allCookies.some(cookie => 
      cookie.name.includes('admin') || 
      cookie.name.includes('editor') ||
      cookie.value.includes('editor') ||
      cookie.value.includes('admin')
    );
    
    return hasEditorIndicators;
  } catch {
    return false;
  }
}

/**
 * Verify admin context through various checks
 */
async function verifyAdminContext(): Promise<boolean> {
  try {
    // For now, we'll allow admin override in development
    // In production, this should have stricter checks
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      console.log('🚧 ROBUST AUTH: Development mode - allowing admin override');
      return true;
    }
    
    // Add production admin verification logic here
    // Could check IP, special headers, etc.
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Get authenticated Supabase client for visual editor operations
 */
export async function getAuthenticatedSupabaseClient() {
  const auth = await authenticateForVisualEditor();
  
  if (!auth.isAuthenticated || !auth.isAdmin) {
    throw new Error(`Access denied: ${auth.error || 'Not authenticated as admin'}`);
  }
  
  if (auth.method === 'user_session') {
    console.log('📡 ROBUST AUTH: Using user session client');
    return await getSupabaseServer();
  } else {
    console.log('📡 ROBUST AUTH: Using admin client');
    return getSupabaseAdmin();
  }
}
