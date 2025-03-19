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
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error('OAuth 登录失败:', error.message);
          return;
        }

        // 登录成功，cookie 自动保存
        router.push(redirectTo || '/search');
      } else {
        router.push('/login');
      }
    };
    
    exchangeCode();
  }, [searchParams, router]);

  return <div>Please wait...</div>;
}
