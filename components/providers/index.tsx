'use client';

import { TRPCProvider } from './trpc-provider';
import { SupabaseProvider } from './supabase-provider';
import HandleAuthCallback from '../auth/handle-auth-callback';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <TRPCProvider>
        <HandleAuthCallback />
        {children}
      </TRPCProvider>
    </SupabaseProvider>
  );
}