'use client';

import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/providers/supabase-provider';
import Image from 'next/image';

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
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow">
        <div className="container flex items-center justify-between px-4 py-4 mx-auto">
          <Image src="/logo_beta_removebg.png" alt="logo" width={80} height={300} />
          <nav className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm font-medium text-blue-700 rounded-md hover:bg-gray-100"
            >
              
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-grow py-6 bg-gray-50">{children}</main>

      <footer className="bg-white border-t border-gray-200">
        <div className="container px-4 py-6 mx-auto">
          <div className="text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} BeaverPass. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 