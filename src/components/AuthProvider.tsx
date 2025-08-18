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
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User, Session } from '@supabase/supabase-js';

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

  const supabase = createClientComponentClient();

  // Ensure component is mounted (prevents hydration issues)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user profile
  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      try {
        console.log('🔍 AuthProvider: Fetching profile for user:', userId);
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, phone, address, is_admin, is_staff, created_at, updated_at')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('❌ AuthProvider: Profile fetch error:', error);
          // If profile doesn't exist, create a default one
          if (error.code === 'PGRST116') {
            console.log('📝 AuthProvider: Creating new profile...');
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                full_name: null,
                phone: null,
                address: null,
                is_admin: false,
                is_staff: false,
              })
              .select('id, full_name, phone, address, is_admin, is_staff, created_at, updated_at')
              .single();

            if (insertError) {
              console.error('❌ AuthProvider: Profile creation error:', insertError);
              return null;
            }
            console.log('✅ AuthProvider: New profile created:', newProfile);
            return newProfile;
          }
          return null;
        }

        console.log('✅ AuthProvider: Profile fetched successfully:', data);
        return data;
      } catch (err) {
        console.error('❌ AuthProvider: Unexpected error:', err);
        return null;
      }
    },
    [supabase]
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
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
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
