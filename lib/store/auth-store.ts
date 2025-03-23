import { create } from 'zustand';
import { type SupabaseClient, type User, type Session } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

interface AuthState {
  supabase: SupabaseClient;
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  supabase: createClient(),
  user: null,
  session: null,
  isLoading: true,
  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  initialize: async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    set({ 
      session,
      user: session?.user ?? null,
      isLoading: false
    });
  }
})); 