import { createServerSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const supabase = createServerSupabaseClient();
    
    // 交换授权码获取会话
    await supabase.auth.exchangeCodeForSession(code);
  }
  
  // 重定向到主页
  return NextResponse.redirect(new URL('/', requestUrl.origin));
} 