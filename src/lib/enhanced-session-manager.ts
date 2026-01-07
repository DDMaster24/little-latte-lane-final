/**
 * Enhanced Session Persistence Manager
 * Using Supabase SSR for cookie-based auth compatible with middleware
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

// Storage keys for persistent session data
// SECURITY: Only store non-sensitive metadata, never tokens
const STORAGE_KEYS = {
  SESSION_META: 'lll-session-meta', // Only stores expiry and user email for UX
  USER: 'lll-user-data', // Non-sensitive user display data only
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
   * Backup non-sensitive session metadata only
   * SECURITY: Never stores tokens in localStorage - relies on Supabase SSR cookies
   */
  private backupSessionMetadata(key: string, value: string) {
    if (typeof window === 'undefined') return;

    try {
      // Parse the session data if it's the auth token
      if (key.includes('auth-token') && value) {
        const sessionData = JSON.parse(value);

        // Only store non-sensitive user display data
        if (sessionData.user) {
          const safeUserData = {
            email: sessionData.user.email,
            id: sessionData.user.id,
            // Don't store any tokens or sensitive metadata
          };
          window.localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(safeUserData));
        }

        // Store only expiry time for session status display
        if (sessionData.expires_at) {
          window.localStorage.setItem(STORAGE_KEYS.SESSION_META, JSON.stringify({
            expires_at: sessionData.expires_at,
            last_updated: Date.now(),
          }));
        }

        // SECURITY: Do NOT store access_token, refresh_token, or full session
        // Supabase SSR handles token storage via httpOnly cookies
      }
    } catch (error) {
      console.warn('Session metadata backup error:', error);
    }
  }

  private visibilityHandler: (() => void) | null = null;

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
        this.validateAndRefreshSession();
      }, 5 * 60 * 1000); // 5 minutes

      // Check on visibility change (tab focus) after significant idle time
      let lastCheck = Date.now();
      this.visibilityHandler = () => {
        if (!document.hidden) {
          // Only check if tab was hidden for more than 10 minutes
          const timeSinceLastCheck = Date.now() - lastCheck;
          if (timeSinceLastCheck > 10 * 60 * 1000) {
            setTimeout(() => {
              this.validateAndRefreshSession();
              lastCheck = Date.now();
            }, 1000);
          }
        }
      };
      document.addEventListener('visibilitychange', this.visibilityHandler);

      // SECURITY: Add cleanup on page unload to prevent memory leaks
      window.addEventListener('beforeunload', () => {
        this.cleanup();
      });
    }, 5000); // Wait 5 seconds for auth system to fully initialize

    // Don't attempt recovery on startup - let normal auth flow handle it
    // Recovery is only needed when session is truly lost, not on every page load
  }

  /**
   * Check if session is valid using Supabase SSR (no localStorage tokens)
   * SECURITY: Relies on httpOnly cookies managed by Supabase SSR
   */
  public async checkSessionValidity(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      // Circuit breaker: Check if we're checking too frequently
      const now = Date.now();
      const timeSinceLastAttempt = now - this.lastRecoveryAttempt;

      if (timeSinceLastAttempt < this.RECOVERY_COOLDOWN_MS) {
        return false;
      }

      // Check if we've exceeded max attempts
      if (this.recoveryAttemptCount >= this.MAX_RECOVERY_ATTEMPTS) {
        this.clearSessionMetadata();
        this.recoveryAttemptCount = 0;
        return false;
      }

      this.lastRecoveryAttempt = now;
      this.recoveryAttemptCount++;

      // Check if we have a current session via Supabase SSR cookies
      const { data: { session: currentSession } } = await this.supabase.auth.getSession();

      if (currentSession) {
        this.recoveryAttemptCount = 0; // Reset on success
        // Update metadata for UX
        this.backupSessionMetadata('auth-token', JSON.stringify(currentSession));
        return true;
      }

      // No session - user needs to log in again
      // SECURITY: Do NOT attempt to recover from localStorage tokens
      // Supabase SSR handles all token management via secure cookies
      this.clearSessionMetadata();
      return false;
    } catch (error) {
      console.error('Session validity check error:', error);
      return false;
    }
  }

  /**
   * @deprecated Use checkSessionValidity instead
   * Kept for backwards compatibility but now just delegates to checkSessionValidity
   */
  public async attemptSessionRecovery(): Promise<boolean> {
    return this.checkSessionValidity();
  }

  /**
   * Validate current session and refresh if needed
   * SECURITY: Uses Supabase SSR cookie-based session management
   */
  private async validateAndRefreshSession() {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();

      if (!session) {
        // No session - clear metadata and let user log in again
        this.clearSessionMetadata();
        return;
      }

      // Session exists, check if it needs refresh
      const expiryTime = (session.expires_at || 0) * 1000;
      const now = Date.now();
      const timeUntilExpiry = expiryTime - now;

      // Refresh if expiring within 10 minutes
      if (timeUntilExpiry < 10 * 60 * 1000) {
        const { data } = await this.supabase.auth.refreshSession();
        if (data.session) {
          // Update metadata with new session info
          this.backupSessionMetadata('auth-token', JSON.stringify(data.session));
        }
      }
    } catch (error) {
      console.warn('Session validation error:', error);
    }
  }

  /**
   * Force save current session metadata (not tokens)
   */
  async forceSaveSessionMetadata(): Promise<boolean> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();

      if (session) {
        this.backupSessionMetadata('auth-token', JSON.stringify(session));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Force save session metadata error:', error);
      return false;
    }
  }

  /**
   * @deprecated Use forceSaveSessionMetadata instead
   */
  async forceSaveSession(): Promise<boolean> {
    return this.forceSaveSessionMetadata();
  }

  /**
   * Clear session metadata (not tokens - those are in httpOnly cookies)
   */
  clearSessionMetadata() {
    if (typeof window === 'undefined') return;

    Object.values(STORAGE_KEYS).forEach(key => {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    });

    // Also clear any legacy keys that may have stored tokens
    const legacyKeys = [
      'lll-session-data',
      'lll-refresh-token',
      'lll-access-token',
      'lll-session-expires',
    ];

    legacyKeys.forEach(key => {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    });
  }

  /**
   * @deprecated Use clearSessionMetadata instead
   */
  clearAllSessionData() {
    this.clearSessionMetadata();
  }

  /**
   * Get session information for debugging (no sensitive data)
   */
  public getSessionInfo() {
    if (typeof window === 'undefined') {
      return { hasSession: false, storageInfo: {} };
    }

    try {
      const sessionMeta = window.localStorage.getItem(STORAGE_KEYS.SESSION_META);
      const userData = window.localStorage.getItem(STORAGE_KEYS.USER);

      let parsedMeta = null;
      let parsedUser = null;

      try {
        if (sessionMeta) parsedMeta = JSON.parse(sessionMeta);
        if (userData) parsedUser = JSON.parse(userData);
      } catch {
        // Ignore parse errors
      }

      return {
        hasSession: !!parsedMeta,
        storageInfo: {
          sessionMeta: !!sessionMeta,
          userData: !!userData,
        },
        userEmail: parsedUser?.email || null,
        expiresAt: parsedMeta?.expires_at || null,
        lastUpdated: parsedMeta?.last_updated || null,
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
   * Cleanup on unmount - prevents memory leaks
   */
  cleanup() {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }

    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
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