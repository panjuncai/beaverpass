import { LoginForm } from '@/components/auth/login-form';
import { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: '登录 | BeaverPass',
  description: '登录到您的BeaverPass账户',
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
  
  // 检查用户是否已登录，如果已登录且不是从dashboard重定向来的，则直接跳转到dashboard
  const supabase = createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  // 如果用户已登录，且不是从dashboard重定向来的（防止循环重定向）
  if (session && redirectTo !== '/dashboard') {
    redirect('/dashboard');
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gray-50">
      {showRegisteredMessage && (
        <div className="w-full max-w-md p-4 mb-4 text-green-700 bg-green-100 rounded-md">
          <p className="text-center">注册成功！请登录您的账户。</p>
        </div>
      )}
      
      {showVerificationMessage && (
        <div className="w-full max-w-md p-4 mb-4 text-yellow-700 bg-yellow-100 rounded-md">
          <p className="text-center">请先验证您的邮箱，然后再登录。我们已向您的邮箱发送了一封验证邮件，请查收。</p>
        </div>
      )}
      
      <LoginForm redirectTo={redirectTo} />
    </div>
  );
}