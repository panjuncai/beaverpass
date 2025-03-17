import { createServerSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const supabase = createServerSupabaseClient();
    
    // 交换授权码获取会话
    await supabase.auth.exchangeCodeForSession(code);
    
    // 检查是否有指定的重定向URL
    const redirectTo = requestUrl.searchParams.get('redirectTo');
    if (redirectTo) {
      return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
    }
  }
  
  // 默认重定向到dashboard
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
} 