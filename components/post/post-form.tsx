'use client';
import { useSupabase } from '@/components/providers/supabase-provider';

export default function PostForm() {
  const { user } = useSupabase();
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-900 h-300">
          {user?.email}
        </h1>
      </div>
    </div>
  );
}