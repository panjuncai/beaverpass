'use client';
import { useSupabase } from '@/components/providers/supabase-provider';

export default function SearchPage() {
  const { user,session } = useSupabase();
  console.log('session',session);
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-red-900 h-300">{user?.email}</h1>
        <h1 className="text-3xl font-bold text-red-900 h-300">{session?.user?.email}</h1>
      </div>
    </div>
  );
} 