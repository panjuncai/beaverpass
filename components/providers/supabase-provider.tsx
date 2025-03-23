'use client';

import { createContext, useContext, useEffect } from 'react';
import { type SupabaseClient, type User, type Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

type SupabaseContextType = {
  supabase: SupabaseClient;
  loginUser: User | null;
  session: Session | null;
  isLoading: boolean;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { 
    supabase, 
    loginUser, 
    session, 
    isLoading,
    setSession,
    setLoginUser,
    initialize 
  } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoginUser(session?.user ?? null);
        router.refresh();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, setSession, setLoginUser]);

  return (
    <SupabaseContext.Provider value={{ supabase, loginUser, session, isLoading }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}; 