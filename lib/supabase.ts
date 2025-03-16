import { createClient } from '@supabase/supabase-js';

// 创建Supabase客户端
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('缺少Supabase环境变量');
  }
  
  return createClient(supabaseUrl, supabaseKey);
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