'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/providers/supabase-provider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, user, isLoading } = useSupabase();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow">
        <div className="container flex items-center justify-between px-4 py-4 mx-auto">
          <Link href="/dashboard" className="text-2xl font-bold text-gray-900">
            BeaverPass
          </Link>
          <nav className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
            >
              仪表板
            </Link>
            <Link
              href="/dashboard/passwords"
              className="px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
            >
              密码
            </Link>
            <Link
              href="/dashboard/notes"
              className="px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
            >
              笔记
            </Link>
            <div className="relative ml-3">
              <div>
                <button
                  type="button"
                  className="flex items-center max-w-xs text-sm bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                  id="user-menu-button"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <span className="sr-only">打开用户菜单</span>
                  <div className="flex items-center justify-center w-8 h-8 text-white bg-blue-600 rounded-full">
                    {user?.email?.charAt(0).toUpperCase() || '?'}
                  </div>
                </button>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
            >
              登出
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-grow py-6 bg-gray-50">{children}</main>

      <footer className="bg-white border-t border-gray-200">
        <div className="container px-4 py-6 mx-auto">
          <div className="text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} BeaverPass. 保留所有权利。</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 