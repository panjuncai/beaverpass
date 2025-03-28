import { create } from 'zustand';
import { type SupabaseClient, type User, type Session } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

interface AuthState {
  supabase: SupabaseClient;
  loginUser: User | null;
  session: Session | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setLoginUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  supabase: createClient(),
  loginUser: null,
  session: null,
  isLoading: true,
  setSession: (session) => set({ session }),
  setLoginUser: (loginUser) => set({ loginUser }),
  setLoading: (isLoading) => set({ isLoading }),
  initialize: async () => {
    try {
      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth initialization error:', error);
        return;
      }

      console.log('Initializing auth state:', { session });
      
      set({ 
        session,
        loginUser: session?.user ?? null,
        isLoading: false
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
    }
  }
}));
