import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSession, clearSession, saveSession, getBiometricsEnabled, isBiometricsAvailable } from '@/lib/auth';
import type { AppUser } from '@/lib/types';

interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  setUser: (user: AppUser) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  signOut: async () => {},
  setUser: async () => {},
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
  }, []);

  async function setUser(u: AppUser) {
    await saveSession(u);
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
