'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSupabase } from '../providers/supabase-provider';

export default function HandleAuthCallback() {
  const router = useRouter();
  const { supabase } = useSupabase();
  
  useEffect(() => {
    // 检查URL中是否包含access_token（哈希片段中）
    const hasAccessToken = window.location.hash && window.location.hash.includes('access_token');
    
    if (hasAccessToken) {
      // 如果URL中包含access_token，Supabase客户端会自动处理它
      // 我们只需检查会话是否存在，然后重定向
      const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // 登录成功，重定向到dashboard
          router.push('/dashboard');
        }
      };
      
      checkSession();
    }
  }, [router, supabase.auth]);
  
  // 这个组件不渲染任何内容
  return null;
} 