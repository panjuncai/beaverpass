'use client';

import { Suspense } from 'react';
import CenteredLoading from '@/components/utils/loading';
import Header from '@/components/banner/header';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen">
      <Header/>
      <main className="flex-1 overflow-y-auto scroll-behavior-smooth -webkit-overflow-scrolling-touch">
        <Suspense fallback={<CenteredLoading />}>
          {children}
        </Suspense>
      </main>
    </div>
  );
} 