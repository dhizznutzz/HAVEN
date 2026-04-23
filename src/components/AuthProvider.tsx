'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types';

interface AuthContextValue {
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    const fetchProfile = async (userId: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (mounted) {
        setProfile(data ?? null);
        setLoading(false);
      }
    };

    // Keep the callback synchronous so Supabase releases the auth lock
    // immediately — async work is deferred via setTimeout to avoid the
    // "lock stolen" error that occurs when the callback itself awaits.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        if (event === 'TOKEN_REFRESHED' && !session) {
          supabase.auth.signOut({ scope: 'local' });
          if (mounted) { setProfile(null); setLoading(false); }
          return;
        }

        if (session?.user) {
          // Defer the DB fetch outside the lock window
          setTimeout(() => { fetchProfile(session.user.id); }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      // Ignore — clear state and redirect regardless.
    }
    setProfile(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
