'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import superjson from 'superjson';
import { trpc } from '@/lib/trpc/client';
import { useAuthStore } from '@/lib/store/auth-store';

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const { session } = useAuthStore();


  // 创建一个新的 trpcClient 实例，每当 session 变化时都会更新
  const trpcClient = trpc.createClient({
    links: [
      httpBatchLink({
        url: '/api/trpc',
        async headers() {
          const token = session?.access_token;
          return {
            'x-trpc-source': 'client',
            'authorization': token ? `Bearer ${token}` : '',
          };
        },
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: 'include',
          });
        },
      }),
    ],
    transformer: superjson,
  });

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
} 