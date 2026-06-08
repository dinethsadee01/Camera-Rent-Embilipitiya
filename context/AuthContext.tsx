import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getSession, clearSession, getBiometricsEnabled, isBiometricsAvailable, supabaseUserToAppUser } from '@/lib/auth';
import type { AppUser } from '@/lib/types';

interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  setUser: (user: AppUser) => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  signOut: async () => {},
  setUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const u = await getSession();
      if (u) {
        const bioEnabled = await getBiometricsEnabled();
        if (bioEnabled && await isBiometricsAvailable()) {
          // Session exists but biometrics required — let login screen handle prompt
          setIsLoading(false);
          return;
        }
      }
      setUserState(u);
      setIsLoading(false);
    }
    init();

    // React to Supabase auth events: token refresh, expiry, sign-out
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUserState(null);
      } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session.user) {
        setUserState(supabaseUserToAppUser(session.user));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Supabase already persists the session — this just updates in-memory state
  function setUser(u: AppUser) {
    setUserState(u);
  }

  async function signOut() {
    await clearSession();
    setUserState(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
