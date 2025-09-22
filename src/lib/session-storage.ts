/**
 * Session Storage Utilities
 * Enhanced session persistence for better user experience
 */

// Storage keys for consistent session management
export const STORAGE_KEYS = {
  SUPABASE_AUTH: 'supabase.auth.token',
  REACT_BRICKS_AUTH: 'reactBricks.auth.token',
  USER_PREFERENCES: 'user.preferences',
  LAST_VISITED: 'user.lastVisited',
} as const;

/**
 * Safe localStorage wrapper with fallbacks
 */
export const sessionStorage = {
  get: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      console.warn('Failed to get from localStorage:', error);
      return null;
    }
  },

  set: (key: string, value: string): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('Failed to set localStorage:', error);
      return false;
    }
  },

  remove: (key: string): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
      return false;
    }
  },

  clear: (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      window.localStorage.clear();
      return true;
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
      return false;
    }
  },
};

/**
 * Enhanced session persistence helpers
 */
export const sessionHelpers = {
  /**
   * Store last visit timestamp for session validation
   */
  updateLastVisit: () => {
    sessionStorage.set(STORAGE_KEYS.LAST_VISITED, new Date().toISOString());
  },

  /**
   * Check if session is fresh (within last 7 days)
   */
  isSessionFresh: (): boolean => {
    const lastVisit = sessionStorage.get(STORAGE_KEYS.LAST_VISITED);
    if (!lastVisit) return false;

    const lastVisitDate = new Date(lastVisit);
    const now = new Date();
    const daysDiff = (now.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24);

    return daysDiff <= 7; // Fresh if within 7 days
  },

  /**
   * Validate and refresh authentication state
   */
  validateAuthState: async () => {
    if (typeof window === 'undefined') return false;

    try {
      // Check if Supabase auth token exists
      const authKey = sessionStorage.get(STORAGE_KEYS.SUPABASE_AUTH);
      if (!authKey) return false;

      // Update last visit
      sessionHelpers.updateLastVisit();

      return true;
    } catch (error) {
      console.warn('Auth state validation failed:', error);
      return false;
    }
  },

  /**
   * Clear all authentication data
   */
  clearAuthData: () => {
    sessionStorage.remove(STORAGE_KEYS.SUPABASE_AUTH);
    sessionStorage.remove(STORAGE_KEYS.REACT_BRICKS_AUTH);
    sessionStorage.remove(STORAGE_KEYS.USER_PREFERENCES);
    sessionStorage.remove(STORAGE_KEYS.LAST_VISITED);
  },
};

/**
 * Initialize session tracking on app start
 */
export const initializeSessionTracking = () => {
  if (typeof window === 'undefined') return;

  // Update last visit on page load
  sessionHelpers.updateLastVisit();

  // Set up beforeunload listener to save session state
  window.addEventListener('beforeunload', () => {
    sessionHelpers.updateLastVisit();
  });

  // Set up visibility change listener for better session tracking
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      sessionHelpers.updateLastVisit();
    }
  });
};