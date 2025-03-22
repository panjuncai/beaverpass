'use client';

import Footer from '@/components/banner/footer';
import Header from '@/components/banner/header';
import { Suspense } from 'react';
import CenteredLoading from './loading';

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto scroll-behavior-smooth -webkit-overflow-scrolling-touch">
        <Suspense fallback={<CenteredLoading />}>
          {children}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
} 