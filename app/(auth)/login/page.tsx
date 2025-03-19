import { LoginForm } from '@/components/auth/login-form';
import { Metadata } from 'next';
// import { createServerSupabaseClient } from '@/lib/supabase';
// import {trpc} from '@/lib/trpc/client';
import {createClient} from '@/utils/supabase/server'
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Sign In | BeaverPass',
  description: 'Sign In to your BeaverPass account',
};

type PageProps = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  };
export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const showRegisteredMessage = params.registered === 'true';
  const showVerificationMessage = params.verification === 'required';
  
  // 获取可能的重定向URL
  const redirectTo = typeof params.redirectTo === 'string' ? params.redirectTo : undefined;
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  // 检查用户是否已登录，如果已登录且不是从search重定向来的，则直接跳转到search
  // const supabase = createServerSupabaseClient();
  // const { data: { session } } = await supabase.auth.getSession();
  
  // 如果用户已登录，且不是从search重定向来的（防止循环重定向）
  if (session) {
    console.log('用户已登录，跳转到上一个被记录的页面');
    const destination=redirectTo || '/search';
    redirect(destination);
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gray-50">
      {showRegisteredMessage && (
        <div className="w-full max-w-md p-4 mb-4 text-green-700 bg-green-100 rounded-md">
          <p className="text-center">Registration successful! Please sign in to your account.</p>
        </div>
      )}
      
      {showVerificationMessage && (
        <div className="w-full max-w-md p-4 mb-4 text-yellow-700 bg-yellow-100 rounded-md">
          <p className="text-center">Please verify your email before signing in. We have sent a verification email to your inbox, please check it.</p>
        </div>
      )}
      
      <LoginForm redirectTo={redirectTo} />
    </div>
  );
}