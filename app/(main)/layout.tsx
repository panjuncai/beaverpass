'use client';

import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/providers/supabase-provider';
import Footer from '@/components/footer/footer';
import Header from '@/components/header/header';

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

  return (
    <div className="flex flex-col h-screen">
     
      <Header handleLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto scroll-behavior-smooth -webkit-overflow-scrolling-touch">{children}</main>

      {/* <footer className="bg-white border-t border-gray-200">
        <div className="container px-4 py-6 mx-auto">
          <div className="text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} BeaverPass. All rights reserved.</p>
          </div>
        </div>
      </footer> */}
      <Footer />
    </div>
  );
} 