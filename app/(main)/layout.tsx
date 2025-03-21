'use client';

import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/providers/supabase-provider';
import Footer from '@/components/banner/footer';
import Header from '@/components/banner/header';
import { Suspense } from 'react';
import CenteredLoading from './loading';

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase } = useSupabase();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleRegister = () => {
    router.push('/register');
  };
  

  return (
    <div className="flex flex-col h-screen">
      <Header handleLogout={handleLogout} handleLogin={handleLogin} handleRegister={handleRegister} />
      <main className="flex-1 overflow-y-auto scroll-behavior-smooth -webkit-overflow-scrolling-touch">
        <Suspense fallback={<CenteredLoading />}>
          {children}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
} 