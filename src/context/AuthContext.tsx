import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getProfile } from '@/services/api';
import type { Profile } from '@/lib/types';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  loading: boolean; // анхны session уншиж байгаа эсэх
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (s: Session | null) => {
    if (!s) return setProfile(null);
    try {
      setProfile(await getProfile(s.user.id));
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    // 1) SecureStore-д хадгалсан session-оо уншина
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await loadProfile(data.session);
      setLoading(false);
    });
    // 2) Нэвтрэх / гарах / token шинэчлэгдэх бүрд мэдэгдэл авна
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      // onAuthStateChange дотор шууд await хийхгүй (Supabase-ийн зөвлөмж)
      setTimeout(() => loadProfile(s), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const value = useMemo<AuthState>(
    () => ({
      session,
      profile,
      loading,
      refreshProfile: () => loadProfile(session),
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, profile, loading, loadProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth нь AuthProvider дотор байх ёстой');
  return ctx;
}
