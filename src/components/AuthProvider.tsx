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
  type ReactNode,
} from 'react';
import { getSupabaseClient } from '@/lib/supabase-client';
import { User, Session } from '@supabase/supabase-js';
import { getOrCreateUserProfile } from '@/app/actions';

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

  const supabase = getSupabaseClient();

  // Ensure component is mounted (prevents hydration issues)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user profile using server action
  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      try {
        console.log('🔍 AuthProvider: Fetching profile for user:', userId);
        
        // Use server action to get or create profile
        const result = await getOrCreateUserProfile(userId);

        if (!result.success) {
          console.error('❌ AuthProvider: Profile fetch error:', result.error);
          return null;
        }

        if (result.profile) {
          console.log('✅ AuthProvider: Profile fetched successfully:', result.profile);
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
        console.error('❌ AuthProvider: Unexpected error:', err);
        return null;
      }
    },
    []
  );

  // Handle auth state changes
  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (cancelled) return;

        setSession(initialSession);

        if (initialSession?.user) {
          const userProfile = await fetchProfile(initialSession.user.id);
          if (!cancelled) {
            setProfile(userProfile);
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, newSession: Session | null) => {
      if (cancelled) return;

      setSession(newSession);

      if (newSession?.user) {
        const userProfile = await fetchProfile(newSession.user.id);
        if (!cancelled) {
          setProfile(userProfile);
        }
      } else {
        setProfile(null);
      }

      if (!cancelled) {
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [mounted, fetchProfile, supabase.auth]);

  // Sign out function
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase.auth]);

  // Manual refresh profile method
  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) {
      console.log('🔄 AuthProvider: Refreshing profile for user:', session.user.id);
      const userProfile = await fetchProfile(session.user.id);
      console.log('✅ AuthProvider: New profile data:', userProfile);
      setProfile(userProfile);
    } else {
      console.log('❌ AuthProvider: No session or user ID for refresh');
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
