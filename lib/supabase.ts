import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

// 创建Supabase客户端
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('缺少Supabase环境变量');
  }
  
  return createBrowserClient(supabaseUrl, supabaseKey,{
    cookieOptions: {
      name: 'supabase-auth-token', // cookie 名称
      domain: process.env.NODE_ENV === 'production' ? 'beaverpass-client.vercel.app' : 'localhost',
      path: '/',
      sameSite: 'lax', // 推荐lax
      secure: process.env.NODE_ENV === 'production', // 本地开发false，生产true
      maxAge: 60 * 60 * 24 * 7, // 7天
    },
    cookieEncoding: 'base64url',
  });
};


// 创建服务器端Supabase客户端
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('缺少Supabase服务端环境变量');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}; 