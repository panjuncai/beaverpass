'use client';

import { TRPCProvider } from './trpc-provider';
import { SupabaseProvider } from './supabase-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <TRPCProvider>{children}</TRPCProvider>
    </SupabaseProvider>
  );
} 