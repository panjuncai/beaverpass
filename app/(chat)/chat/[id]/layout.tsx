'use client';

import { Suspense } from 'react';
import CenteredLoading from '@/components/utils/loading';
import DetailHeader from '@/components/banner/detail-header';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen">
      <DetailHeader isShowBack={true} pageTitle="Chat" isShowRight={false} />
      <main className="flex-1 overflow-y-auto scroll-behavior-smooth -webkit-overflow-scrolling-touch">
        <Suspense fallback={<CenteredLoading />}>
          {children}
        </Suspense>
      </main>
    </div>
  );
} 