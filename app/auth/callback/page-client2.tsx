'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSupabase } from '@/components/providers/supabase-provider';

export default function AuthCallback() {
  const { supabase } = useSupabase();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const exchangeCode = async () => {
      const code = searchParams?.get('code');
      const redirectTo = searchParams?.get('redirectTo') || '/search';
      console.log('code is............', code);
      console.log('redirectTo is............', redirectTo);
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          console.log('Google 登录成功,完成session创建');
          router.push('/search');
        } else {
          console.error('Exchange code error:', error);
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    };
    
    exchangeCode();
  }, [searchParams, router,supabase]);

  return <div>Please wait...</div>;
}
