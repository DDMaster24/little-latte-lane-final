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
import { Database } from '@/types/supabase';
import { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  phone_number: string | null;
  full_name: string | null;
  is_admin: boolean;
  is_staff: boolean;
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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const supabase = createClientComponentClient<Database>();

  // Ensure component is mounted (prevents hydration issues)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user profile
  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, phone_number, full_name, is_admin, is_staff')
          .eq('id', userId)
          .single();

        if (error) {
          // If profile doesn't exist, create a default one
          if (error.code === 'PGRST116') {
            // Get the user's email from auth
            const { data: { user } } = await supabase.auth.getUser();
            const userEmail = user?.email || '';

            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                email: userEmail,
                phone_number: null,
                full_name: null,
                is_admin: false,
                is_staff: false,
              })
              .select('id, email, phone_number, full_name, is_admin, is_staff')
              .single();

            return insertError ? null : newProfile;
          }
          return null;
        }

        return data;
      } catch {
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
