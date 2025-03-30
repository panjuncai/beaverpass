'use client';

import ChatHeader from '@/components/banner/chat-header';
import { Suspense } from 'react';
import CenteredLoading from '../(main)/loading';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen">
      <ChatHeader />
      <main className="flex-1 overflow-y-auto scroll-behavior-smooth -webkit-overflow-scrolling-touch">
        <Suspense fallback={<CenteredLoading />}>
          {children}
        </Suspense>
      </main>
    </div>
  );
} 