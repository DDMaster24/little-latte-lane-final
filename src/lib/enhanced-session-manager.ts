/**
 * Enhanced Session Persistence Manager
 * Using Supabase SSR for cookie-based auth compatible with middleware
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

// Storage keys for persistent session data
const STORAGE_KEYS = {
  SESSION: 'lll-session-data',
  USER: 'lll-user-data', 
  EXPIRES: 'lll-session-expires',
  REFRESH_TOKEN: 'lll-refresh-token',
  ACCESS_TOKEN: 'lll-access-token',
} as const;

/**
 * Custom session storage that persists across browser restarts
 */
class SessionPersistenceManager {
  private static instance: SessionPersistenceManager;
  private supabase: ReturnType<typeof createBrowserClient<Database>>;
  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private lastRecoveryAttempt: number = 0;
  private recoveryAttemptCount: number = 0;
  private readonly RECOVERY_COOLDOWN_MS = 30000; // 30 seconds between recovery attempts
  private readonly MAX_RECOVERY_ATTEMPTS = 3; // Max attempts before giving up

  private constructor() {
    this.supabase = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    this.initializeSessionMonitoring();
  }

  static getInstance(): SessionPersistenceManager {
    if (!SessionPersistenceManager.instance) {
      SessionPersistenceManager.instance = new SessionPersistenceManager();
    }
    return SessionPersistenceManager.instance;
  }

  /**
   * Backup session data to multiple storage locations
   */
  private backupSessionData(key: string, value: string) {
    if (typeof window === 'undefined') return;
    
    try {
      // Parse the session data if it's the auth token
      if (key.includes('auth-token') && value) {
        const sessionData = JSON.parse(value);
        
        if (sessionData.access_token) {
          window.localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, sessionData.access_token);
        }
        
        if (sessionData.refresh_token) {
          window.localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, sessionData.refresh_token);
        }
        
        if (sessionData.expires_at) {
          window.localStorage.setItem(STORAGE_KEYS.EXPIRES, sessionData.expires_at.toString());
        }
        
        if (sessionData.user) {
          window.localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(sessionData.user));
        }
        
        // Store the entire session as backup
        window.localStorage.setItem(STORAGE_KEYS.SESSION, value);
        
        console.log('📋 Backed up session data to multiple keys');
      }
    } catch (error) {
      console.warn('Session backup error:', error);
      // Don't let backup errors break the main flow
    }
  }

  /**
   * Initialize session monitoring and recovery
   */
  private initializeSessionMonitoring() {
    if (typeof window === 'undefined') return;

    // Only monitor session, don't force recovery on startup
    // This prevents conflicts with normal auth flow
    setTimeout(() => {
      // Check session every 5 minutes (much less aggressive)
      this.sessionCheckInterval = setInterval(() => {
        this.validateAndRecoverSession();
      }, 5 * 60 * 1000); // 5 minutes

      // Check on visibility change (tab focus) after significant idle time
      let lastCheck = Date.now();
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          // Only check if tab was hidden for more than 10 minutes
          const timeSinceLastCheck = Date.now() - lastCheck;
          if (timeSinceLastCheck > 10 * 60 * 1000) {
            setTimeout(() => {
              this.validateAndRecoverSession();
              lastCheck = Date.now();
            }, 1000);
          }
        }
      });
    }, 5000); // Wait 5 seconds for auth system to fully initialize

    // Don't attempt recovery on startup - let normal auth flow handle it
    // Recovery is only needed when session is truly lost, not on every page load
  }

  /**
   * Attempt to recover session from backup storage
   * Now with circuit breaker to prevent infinite loops
   */
  public async attemptSessionRecovery() {
    if (typeof window === 'undefined') return false;

    try {
      // Circuit breaker: Check if we're attempting recovery too frequently
      const now = Date.now();
      const timeSinceLastAttempt = now - this.lastRecoveryAttempt;
      
      if (timeSinceLastAttempt < this.RECOVERY_COOLDOWN_MS) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`⏸️ Recovery cooldown active. Wait ${Math.round((this.RECOVERY_COOLDOWN_MS - timeSinceLastAttempt) / 1000)}s before retry`);
        }
        return false;
      }
      
      // Check if we've exceeded max recovery attempts
      if (this.recoveryAttemptCount >= this.MAX_RECOVERY_ATTEMPTS) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🛑 Max recovery attempts reached. Clearing invalid data.');
        }
        this.clearAllSessionData();
        this.recoveryAttemptCount = 0; // Reset for next session
        return false;
      }
      
      this.lastRecoveryAttempt = now;
      this.recoveryAttemptCount++;
      
      console.log(`🔄 Attempting session recovery (${this.recoveryAttemptCount}/${this.MAX_RECOVERY_ATTEMPTS})...`);
      
      // Check if we have a current session
      const { data: { session: currentSession } } = await this.supabase.auth.getSession();
      
      if (currentSession) {
        console.log('✅ Current session is valid');
        this.recoveryAttemptCount = 0; // Reset on success
        return true;
      }

      // Try to recover from backup storage
      const refreshToken = window.localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      const expiresAt = window.localStorage.getItem(STORAGE_KEYS.EXPIRES);

      if (refreshToken && expiresAt) {
        const expiryTime = parseInt(expiresAt) * 1000;
        const now = Date.now();
        
        // Check if session hasn't expired (with 1 hour buffer)
        if (expiryTime > now + (60 * 60 * 1000)) {
          console.log('🔄 Attempting to refresh session from backup...');
          
          // Try to refresh the session
          const { data, error } = await this.supabase.auth.setSession({
            access_token: window.localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || '',
            refresh_token: refreshToken,
          });

          if (data.session && !error) {
            console.log('✅ Session recovered successfully!');
            this.recoveryAttemptCount = 0; // Reset on success
            return true;
          } else {
            console.warn('❌ Session recovery failed:', error);
            // CRITICAL FIX: Clear invalid session data to prevent infinite loop
            if (error?.message?.includes('Refresh Token Not Found') || 
                error?.message?.includes('Invalid Refresh Token') ||
                error?.status === 400) {
              console.log('🗑️ Clearing invalid refresh token to prevent loop');
              this.clearAllSessionData();
              this.recoveryAttemptCount = 0; // Reset after clearing
            }
          }
        } else {
          console.log('⏰ Backup session has expired, clearing old data');
          // Clear expired session data
          this.clearAllSessionData();
          this.recoveryAttemptCount = 0; // Reset after clearing
        }
      }

      console.log('❌ No recoverable session found');
      return false;
    } catch (error) {
      console.error('❌ Session recovery error:', error);
      // On error, increment attempt count and respect cooldown
      return false;
    }
  }

  /**
   * Validate current session and attempt recovery if needed
   */
  private async validateAndRecoverSession() {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      
      if (!session) {
        console.log('⚠️ No session detected, attempting recovery...');
        await this.attemptSessionRecovery();
      } else {
        // Session exists, check if it needs refresh
        const expiryTime = (session.expires_at || 0) * 1000;
        const now = Date.now();
        const timeUntilExpiry = expiryTime - now;
        
        // Refresh if expiring within 10 minutes
        if (timeUntilExpiry < 10 * 60 * 1000) {
          console.log('🔄 Session expiring soon, refreshing...');
          await this.supabase.auth.refreshSession();
        }
      }
    } catch (error) {
      console.warn('Session validation error:', error);
    }
  }

  /**
   * Force save current session to backup storage
   */
  async forceSaveSession(): Promise<boolean> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      
      if (session) {
        this.backupSessionData('auth-token', JSON.stringify(session));
        console.log('💾 Force saved current session');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Force save session error:', error);
      return false;
    }
  }

  /**
   * Clear all session data
   */
  clearAllSessionData() {
    if (typeof window === 'undefined') return;
    
    Object.values(STORAGE_KEYS).forEach(key => {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    });
    
    // Clear standard Supabase keys
    const supabaseKeys = [
      'supabase.auth.token',
      'sb-awytuszmunxvthuizyur-auth-token',
    ];
    
    supabaseKeys.forEach(key => {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    });
    
    console.log('🗑️ Cleared all session data');
  }

  /**
   * Get comprehensive session information for debugging
   */
  public getSessionInfo() {
    if (typeof window === 'undefined') {
      return { hasSession: false, storageInfo: {} };
    }

    try {
      // Get all localStorage keys to find Supabase auth key
      const allKeys = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) allKeys.push(key);
      }
      
      // Enhanced Supabase auth key detection with multiple patterns
      const supabaseAuthKey = allKeys.find(key => 
        key.includes('auth-token') || 
        key.includes('supabase') ||
        key.startsWith('sb-') ||
        key === 'sb-awytuszmunxvthuizyur-auth-token' || // Exact key for our project
        key.includes('awytuszmunxvthuizyur') || // Our project ID anywhere in key
        key.match(/^sb-.*-auth-token.*$/) || // Any sb-*-auth-token pattern
        (key.includes('session') && key.includes('supabase')) // Any supabase session key
      );
      
      // Debug logging with comprehensive information
      console.log('🔍 Supabase Auth Debug:', {
        totalKeys: allKeys.length,
        allKeys: allKeys,
        detectedKey: supabaseAuthKey,
        matchedKeys: allKeys.filter(key => 
          key.includes('auth-token') || 
          key.includes('supabase') ||
          key.startsWith('sb-') ||
          key.includes('awytuszmunxvthuizyur')
        ),
        // Show keys that contain our project ID
        projectIdKeys: allKeys.filter(key => key.includes('awytuszmunxvthuizyur')),
        // Show any auth-related keys
        authKeys: allKeys.filter(key => key.toLowerCase().includes('auth'))
      });
      
      const supabaseAuthData = supabaseAuthKey ? window.localStorage.getItem(supabaseAuthKey) : null;
      
      const sessionData = window.localStorage.getItem(STORAGE_KEYS.SESSION);
      const refreshToken = window.localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      const accessToken = window.localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const expiresAt = window.localStorage.getItem(STORAGE_KEYS.EXPIRES);
      const userData = window.localStorage.getItem(STORAGE_KEYS.USER);

      return {
        hasSession: !!(sessionData || refreshToken),
        storageInfo: {
          sessionData: !!sessionData,
          refreshToken: !!refreshToken,
          accessToken: !!accessToken,
          expiresAt: expiresAt,
          userData: !!userData,
          supabaseAuth: !!supabaseAuthData,
        },
        isLoggedIn: !!(sessionData && refreshToken),
        userEmail: userData ? JSON.parse(userData).email : null,
        lastSave: null,
        // Debug info
        allStorageKeys: allKeys,
        supabaseKeyFound: supabaseAuthKey,
        supabaseAuthExists: !!supabaseAuthData,
      };
    } catch (error) {
      console.error('Error getting session info:', error);
      return { hasSession: false, storageInfo: {} };
    }
  }

  /**
   * Get the Supabase client
   */
  getClient() {
    return this.supabase;
  }

  /**
   * Cleanup on unmount
   */
  cleanup() {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }
  }
}

// Export singleton instance
export const sessionManager = SessionPersistenceManager.getInstance();

// Export the client for compatibility
export const getEnhancedSupabaseClient = () => sessionManager.getClient();

// Auto-initialize on module load
if (typeof window !== 'undefined') {
  console.log('🚀 Enhanced session persistence manager initialized');
}