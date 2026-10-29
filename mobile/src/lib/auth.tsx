import type { Session } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { api, type Me } from './api';
import { supabase } from './supabase';

export const ALLOWED_DOMAIN = 'unbosque.edu.co';
export const isAllowedEmail = (email: string) => new RegExp(`^[^\\s@]+@${ALLOWED_DOMAIN.replace('.', '\\.')}$`, 'i').test(email.trim());

type AuthValue = {
  session: Session | null;
  loading: boolean;
  me: Me | undefined;
  meLoading: boolean;
  refreshMe: () => Promise<unknown>;
  sendCode: (email: string, createUser: boolean) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const qc = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) qc.clear();
    });
    return () => data.subscription.unsubscribe();
  }, [qc]);

  const meQuery = useQuery({ queryKey: ['me'], queryFn: api.me, enabled: !!session });

  const value: AuthValue = {
    session,
    loading,
    me: meQuery.data,
    meLoading: meQuery.isLoading,
    refreshMe: () => meQuery.refetch(),
    async sendCode(email, createUser) {
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { shouldCreateUser: createUser } });
      // Respuesta uniforme: si la cuenta no existe en el login no lo revelamos.
      if (error && !(!createUser && /signups not allowed|user not found/i.test(error.message))) throw error;
    },
    async verifyCode(email, code) {
      const { error } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: code, type: 'email' });
      if (error) throw error;
    },
    async signOut() {
      await supabase.auth.signOut();
      qc.clear();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
