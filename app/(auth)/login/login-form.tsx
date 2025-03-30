'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/providers/supabase-provider';

import { trpc } from '@/lib/trpc/client';
import Link from 'next/link';
import { loginSchema, LoginFormValues } from '@/lib/validations/auth';
import Loading from '@/components/utils/loading';
import { useAuthStore } from '@/lib/store/auth-store';
import Image from 'next/image';
interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const { supabase } = useSupabase();

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

   // 使用tRPC登录
   const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      // 更新客户端状态
      const { setSession, setLoginUser } = useAuthStore.getState();
      setSession(data.session);
      setLoginUser(data.user);
      
      // 导航
      router.push(redirectTo || '/search');
      router.refresh();
    },
    onError: (error) => {
      setError(error.message);
      setIsLoading(false);
    },
  });

  // 处理表单提交
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await loginMutation.mutateAsync(data);
      console.log('redirectTo', redirectTo);
      router.push(redirectTo || '/search');
      setIsLoading(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '登录失败';
      console.log('登录失败',errorMessage);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

 // 处理Google登录
 const handleGoogleLogin = async () => {
  try {
    setError(null);
    setIsLoading(true);
    const queryParams = redirectTo ? { redirectTo } : undefined;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams, // 添加查询参数
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Error logging in with Google';
    setError(errorMessage);
    setIsLoading(false);
  }
};

  // 注释掉未使用的GitHub登录处理函数
  /* const handleGithubLogin = async () => {
    try {
      setError(null);
      setIsLoading(true);

      await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: redirectTo || '/posts',
        },
      });
    } catch (error) {
      console.error("GitHub login error:", error);
      setError("Failed to login with GitHub");
      setIsLoading(false);
    }
  }; */

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      {/* <div className="text-center">
        <img 
          src="/homepage/logo_maple.png" 
          alt="BeaverPass" 
          className="h-12 mx-auto"
        />
      </div> */}
      <div className="text-center relative mx-auto h-18">
          <Image
            src="/homepage/logo_maple.png"
            alt="BeaverPass"
            priority
            fill
            objectFit='contain'
            className="object-contain rounded-xl w-full h-full"
          />
        </div>

      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
            disabled={isLoading}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full h-12 relative bg-yellow-900 rounded-3xl text-center text-white text-base font-semibold font-['Poppins'] transition-all duration-300 hover:bg-yellow-800"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="relative mt-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 text-gray-500 bg-white">Or sign in with social accounts</span>
        </div>
      </div>

      <div className="grid grid-cols-1">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex items-center justify-center w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
        {/* <button
          type="button"
          onClick={handleGithubLogin}
          className="flex items-center justify-center w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
              fill="currentColor"
            />
          </svg>
          GitHub
        </button> */}
      </div>

      <div className="text-center text-sm">
        <p className="text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-green-600 hover:text-green-500">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}