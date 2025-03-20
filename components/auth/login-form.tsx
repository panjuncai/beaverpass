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
    onSuccess: () => {
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
  setIsLoading(true);
  setError(null);
  
  try {
    // 准备查询参数，以便回调后可以重定向到正确的位置
    const queryParams = redirectTo ? { redirectTo } : undefined;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
         redirectTo: `${window.location.origin}/auth/callback`,
         queryParams, // 添加查询参数
      },
    });
    
    if (error) {
      throw error;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '使用Google登录时出错';
    setError(errorMessage);
    setIsLoading(false);
  }
}; 

  // 处理GitHub登录
  const handleGithubLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 准备查询参数，以便回调后可以重定向到正确的位置
      const queryParams = redirectTo ? { redirectTo } : undefined;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams, // 添加查询参数
        },
      });
      
      if (error) {
        throw error;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '使用GitHub登录时出错';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h1 className="text-2xl font-bold">BeaverPass</h1>
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
          className="w-full btn btn-primary"
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

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex items-center justify-center w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064 5.963 5.963 0 014.123 1.632l2.917-2.917a10.027 10.027 0 00-7.04-2.749 10.087 10.087 0 000 20.174c5.563 0 9.413-3.985 9.413-9.588 0-.669-.057-1.31-.163-1.93h-9.25z"
              fill="currentColor"
            />
          </svg>
          Google
        </button>
        <button
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
        </button>
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