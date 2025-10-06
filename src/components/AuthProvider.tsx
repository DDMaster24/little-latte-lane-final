/**
 * Clean Auth Provider - Single Source of Truth
 *
 * This replaces the messy AuthProvider with proper hydration handling
 * and clean error management. No more band-aid fixes!
 */

'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { getSupabaseClient } from '@/lib/supabase-client';
import { sessionManager } from '@/lib/enhanced-session-manager';
import { User, Session } from '@supabase/supabase-js';
import { getOrCreateUserProfile } from '@/app/actions';

// Constants for profile fetching
const PROFILE_FETCH_DELAY_MS = 200; // Delay to ensure database consistency
const PROFILE_FETCH_MAX_RETRIES = 3;
const PROFILE_FETCH_RETRY_DELAY_MS = 500;

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  is_admin: boolean;
  is_staff: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  // Auth state
  user: User | null;
  session: Session | null;
  profile: Profile | null;

  // Loading states
  loading: boolean;

  // Actions
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Use ref to prevent race conditions in profile fetching
  const profileFetchInProgress = useRef<string | null>(null);
  const isCancelled = useRef(false);

  const supabase = getSupabaseClient();

  // Ensure component is mounted (prevents hydration issues)
  useEffect(() => {
    setMounted(true);
    return () => {
      isCancelled.current = true;
    };
  }, []);

  // Fetch user profile using server action with retry logic
  const fetchProfile = useCallback(
    async (userId: string, retryCount = 0): Promise<Profile | null> => {
      // Prevent duplicate fetches for same user
      if (profileFetchInProgress.current === userId) {
        if (process.env.NODE_ENV === 'development') {
          console.log('⏭️ AuthProvider: Profile fetch already in progress for user:', userId);
        }
        return null;
      }

      profileFetchInProgress.current = userId;

      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 AuthProvider: Fetching profile for user:', userId);
        }
        
        // Use server action to get or create profile
        const result = await getOrCreateUserProfile(userId);

        if (!result.success) {
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ AuthProvider: Profile fetch error:', result.error);
          }
          
          // Retry logic for transient failures
          if (retryCount < PROFILE_FETCH_MAX_RETRIES) {
            if (process.env.NODE_ENV === 'development') {
              console.log(`🔄 AuthProvider: Retrying profile fetch (${retryCount + 1}/${PROFILE_FETCH_MAX_RETRIES})...`);
            }
            await new Promise(resolve => setTimeout(resolve, PROFILE_FETCH_RETRY_DELAY_MS));
            return fetchProfile(userId, retryCount + 1);
          }
          
          return null;
        }

        if (result.profile) {
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ AuthProvider: Profile fetched successfully');
          }
          return {
            id: result.profile.id,
            full_name: result.profile.full_name,
            phone: result.profile.phone,
            address: result.profile.address,
            is_admin: result.profile.is_admin || false,
            is_staff: result.profile.is_staff || false,
            created_at: result.profile.created_at || new Date().toISOString(),
            updated_at: result.profile.updated_at || new Date().toISOString(),
          };
        }

        return null;
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ AuthProvider: Unexpected error:', err);
        }
        
        // Retry on unexpected errors
        if (retryCount < PROFILE_FETCH_MAX_RETRIES) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`🔄 AuthProvider: Retrying after error (${retryCount + 1}/${PROFILE_FETCH_MAX_RETRIES})...`);
          }
          await new Promise(resolve => setTimeout(resolve, PROFILE_FETCH_RETRY_DELAY_MS));
          return fetchProfile(userId, retryCount + 1);
        }
        
        return null;
      } finally {
        profileFetchInProgress.current = null;
      }
    },
    [] // Remove profile dependency to prevent infinite loop
  );

  // Handle auth state changes
  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;

    // Get initial session with recovery logic
    const getInitialSession = async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 AuthProvider: Getting initial session...');
        }
        
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (cancelled || isCancelled.current) return;

        if (process.env.NODE_ENV === 'development') {
          console.log('📧 AuthProvider: Initial session:', initialSession?.user?.email || 'none');
        }
        
        // If no session found, try to recover from backup storage
        if (!initialSession) {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 AuthProvider: No session found, attempting recovery...');
          }
          
          try {
            const recoveryResult = await sessionManager.attemptSessionRecovery();
            if (recoveryResult && !cancelled) {
              if (process.env.NODE_ENV === 'development') {
                console.log('✅ AuthProvider: Session recovered, re-fetching...');
              }
              
              // Re-fetch session after recovery
              const { data: { session: recoveredSession } } = await supabase.auth.getSession();
              if (recoveredSession && !cancelled) {
                setSession(recoveredSession);
                
                if (process.env.NODE_ENV === 'development') {
                  console.log('🎉 AuthProvider: Successfully restored session for:', recoveredSession.user?.email);
                }
                
                // Fetch profile for recovered session with delay for database consistency
                await new Promise(resolve => setTimeout(resolve, PROFILE_FETCH_DELAY_MS));
                const userProfile = await fetchProfile(recoveredSession.user.id);
                
                if (!cancelled && !isCancelled.current) {
                  setProfile(userProfile);
                }
                return; // Exit early since we handled the recovered session
              }
            }
          } catch (recoveryError) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('⚠️ AuthProvider: Session recovery failed:', recoveryError);
            }
          }
        } else {
          setSession(initialSession);
        }

        // Fetch profile for initial session
        if (initialSession?.user && !cancelled) {
          if (process.env.NODE_ENV === 'development') {
            console.log('👤 AuthProvider: Fetching profile for initial session...');
          }
          
          // Add delay to ensure database is ready
          await new Promise(resolve => setTimeout(resolve, PROFILE_FETCH_DELAY_MS));
          const userProfile = await fetchProfile(initialSession.user.id);
          
          if (!cancelled && !isCancelled.current) {
            setProfile(userProfile);
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ AuthProvider: Error getting initial session:', error);
        }
      } finally {
        if (!cancelled && !isCancelled.current) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes with improved handling
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, newSession: Session | null) => {
      if (cancelled || isCancelled.current) return;

      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 AuthProvider: Auth state change:', event, newSession?.user?.email || 'none');
      }
      
      setSession(newSession);

      if (newSession?.user) {
        // Only fetch profile if we don't have one or if it's a different user
        if (!profile || profile.id !== newSession.user.id) {
          if (process.env.NODE_ENV === 'development') {
            console.log('👤 AuthProvider: Fetching profile for auth change...');
          }
          
          // Add delay for database consistency
          await new Promise(resolve => setTimeout(resolve, PROFILE_FETCH_DELAY_MS));
          const userProfile = await fetchProfile(newSession.user.id);
          
          if (!cancelled && !isCancelled.current) {
            setProfile(userProfile);
          }
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('🚪 AuthProvider: User signed out, clearing profile');
        }
        setProfile(null);
      }

      if (!cancelled && !isCancelled.current) {
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [mounted, fetchProfile, profile, supabase.auth]);

  // Sign out function
  const signOut = useCallback(async () => {
    // Clear our enhanced session data first
    sessionManager.clearAllSessionData();
    // Then sign out from Supabase
    await supabase.auth.signOut();
  }, [supabase.auth]);

  // Manual refresh profile method
  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 AuthProvider: Refreshing profile for user:', session.user.id);
      }
      const userProfile = await fetchProfile(session.user.id);
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ AuthProvider: New profile data:', userProfile);
      }
      setProfile(userProfile);
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ AuthProvider: No session or user ID for refresh');
      }
    }
  }, [session, fetchProfile]);

  // Don't render children until mounted (prevents hydration mismatch)
  if (!mounted) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  const contextValue: AuthContextType = {
    user: session?.user || null,
    session,
    profile,
    loading,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
