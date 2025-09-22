/**
 * Enhanced Session Persistence Manager
 * Aggressive approach to maintain authentication across browser sessions
 */

import { createClient } from '@supabase/supabase-js';
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
  private supabase: ReturnType<typeof createClient<Database>>;
  private sessionCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: {
            getItem: (key: string) => {
              if (typeof window === 'undefined') return null;
              try {
                // First try localStorage, then sessionStorage, then our backup
                let value = window.localStorage.getItem(key);
                if (!value) {
                  value = window.sessionStorage.getItem(key);
                }
                
                // If it's the main auth token and we don't have it, try to restore from backup
                if (!value && key.includes('auth-token')) {
                  const backupSession = window.localStorage.getItem(STORAGE_KEYS.SESSION);
                  if (backupSession) {
                    console.log(`🔄 Restoring ${key} from backup session`);
                    console.log(`📋 Backup session data:`, backupSession.substring(0, 100) + '...');
                    // Restore the backup session to the expected key
                    window.localStorage.setItem(key, backupSession);
                    value = backupSession;
                  } else {
                    console.log(`❌ No backup session found for ${key}`);
                  }
                }
                
                console.log(`📦 Getting storage key "${key}":`, value ? 'Found' : 'Not found');
                return value;
              } catch (error) {
                console.warn('Storage getItem error:', error);
                return null;
              }
            },
            setItem: (key: string, value: string) => {
              if (typeof window === 'undefined') return;
              try {
                // Store in both localStorage and sessionStorage for redundancy
                window.localStorage.setItem(key, value);
                window.sessionStorage.setItem(key, value);
                console.log(`💾 Stored key "${key}" in both storage types`);
                
                // Also store our custom session backup - but avoid infinite loops
                if (!key.includes('lll-')) {
                  this.backupSessionData(key, value);
                }
              } catch (error) {
                console.warn('Storage setItem error:', error);
                // Fallback: try to store in just one location
                try {
                  window.localStorage.setItem(key, value);
                } catch (fallbackError) {
                  console.error('Critical storage error:', fallbackError);
                }
              }
            },
            removeItem: (key: string) => {
              if (typeof window === 'undefined') return;
              try {
                window.localStorage.removeItem(key);
                window.sessionStorage.removeItem(key);
                console.log(`🗑️ Removed key "${key}" from both storage types`);
              } catch (error) {
                console.warn('Storage removeItem error:', error);
              }
            },
          },
        },
      }
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

    // Wait a bit before starting aggressive monitoring to avoid conflicts
    setTimeout(() => {
      // Check session every 30 seconds (less aggressive than before)
      this.sessionCheckInterval = setInterval(() => {
        this.validateAndRecoverSession();
      }, 30000);

      // Check on visibility change (tab focus) - but only after initial load
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          // Add delay to avoid conflicts with other initialization
          setTimeout(() => {
            this.validateAndRecoverSession();
          }, 1000);
        }
      });
    }, 2000); // Wait 2 seconds after construction

    // Initial session recovery attempt - but delayed to avoid conflicts
    setTimeout(() => {
      this.attemptSessionRecovery();
    }, 3000); // Wait 3 seconds for other systems to initialize
  }

  /**
   * Attempt to recover session from backup storage
   */
  public async attemptSessionRecovery() {
    if (typeof window === 'undefined') return false;

    try {
      console.log('🔄 Attempting session recovery...');
      
      // Check if we have a current session
      const { data: { session: currentSession } } = await this.supabase.auth.getSession();
      
      if (currentSession) {
        console.log('✅ Current session is valid');
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
            return true;
          } else {
            console.warn('❌ Session recovery failed:', error);
          }
        } else {
          console.log('⏰ Backup session has expired');
        }
      }

      console.log('❌ No recoverable session found');
      return false;
    } catch (error) {
      console.error('❌ Session recovery error:', error);
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
      
      // Look for any Supabase auth key
      const supabaseAuthKey = allKeys.find(key => 
        key.includes('auth-token') || 
        key.includes('supabase') ||
        key.startsWith('sb-')
      );
      
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