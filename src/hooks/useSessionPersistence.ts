/**
 * Session Persistence Hook
 * Provides manual session persistence controls for debugging
 */

import { useCallback, useEffect, useState } from 'react';
import { sessionManager } from '@/lib/enhanced-session-manager';
import { useAuth } from '@/components/AuthProvider';

export function useSessionPersistence() {
  const { user, session } = useAuth();
  const [isSessionStored, setIsSessionStored] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

  // Check if session is stored
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasStoredSession = Boolean(
        window.localStorage.getItem('lll-session-data') ||
        window.localStorage.getItem('lll-refresh-token')
      );
      setIsSessionStored(hasStoredSession);
    }
  }, [user, session]);

  // Force save current session
  const forceSaveSession = useCallback(async () => {
    try {
      const success = await sessionManager.forceSaveSession();
      if (success) {
        setLastSaveTime(new Date());
        setIsSessionStored(true);
        console.log('✅ Session force-saved successfully');
        return { success: true, message: 'Session saved successfully' };
      } else {
        console.warn('⚠️ No session to save');
        return { success: false, message: 'No active session to save' };
      }
    } catch (error) {
      console.error('❌ Force save failed:', error);
      return { success: false, message: `Save failed: ${error}` };
    }
  }, []);

  // Clear all session data
  const clearAllSessions = useCallback(() => {
    try {
      sessionManager.clearAllSessionData();
      setIsSessionStored(false);
      setLastSaveTime(null);
      console.log('🗑️ All session data cleared');
      return { success: true, message: 'All session data cleared' };
    } catch (error) {
      console.error('❌ Clear sessions failed:', error);
      return { success: false, message: `Clear failed: ${error}` };
    }
  }, []);

  // Get session storage info
  const getSessionInfo = useCallback(() => {
    if (typeof window === 'undefined') {
      return { hasSession: false, storageInfo: {} };
    }

    const storageInfo = {
      sessionData: Boolean(window.localStorage.getItem('lll-session-data')),
      refreshToken: Boolean(window.localStorage.getItem('lll-refresh-token')),
      accessToken: Boolean(window.localStorage.getItem('lll-access-token')),
      expiresAt: window.localStorage.getItem('lll-session-expires'),
      userData: Boolean(window.localStorage.getItem('lll-user-data')),
      supabaseAuth: Boolean(window.localStorage.getItem('supabase.auth.token')),
    };

    return {
      hasSession: Object.values(storageInfo).some(Boolean),
      storageInfo,
      isLoggedIn: Boolean(user),
      userEmail: user?.email || null,
      lastSave: lastSaveTime,
    };
  }, [user, lastSaveTime]);

  return {
    isSessionStored,
    lastSaveTime,
    forceSaveSession,
    clearAllSessions,
    getSessionInfo,
  };
}