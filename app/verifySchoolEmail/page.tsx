'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { Result, SpinLoading } from 'antd-mobile';
import { SmileOutline, CloseOutline } from 'antd-mobile-icons';
import { useAuthStore } from '@/lib/store/auth-store';
import { createClient } from '@/utils/supabase/client';

function VerifySchoolEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loginUser, setLoginUser, setSession } = useAuthStore();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const verifyMutation = trpc.user.verifySchoolEmailToken.useMutation({
    onSuccess: () => {
      setVerificationStatus('success');
      // 3秒后重定向到个人资料页面
      setTimeout(() => {
        router.push('/profile');
      }, 3000);
    },
    onError: (error) => {
      setVerificationStatus('error');
      setErrorMessage(error.message);
    },
  });

  useEffect(() => {
    const initAuth = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setVerificationStatus('error');
        setErrorMessage('No verification token provided');
        return;
      }

      try {
        // 如果没有登录，先获取当前会话
        if (!loginUser) {
          const supabase = createClient();
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            throw error;
          }

          if (session) {
            setSession(session);
            setLoginUser(session.user);
          } else {
            throw new Error('Please login first');
          }
        }

        // 只在组件首次加载时验证一次
        if (verificationStatus === 'loading') {
          verifyMutation.mutate({ token });
        }
      } catch (error) {
        setVerificationStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Authentication failed');
      }
    };

    void initAuth();
  }, [searchParams]); // 移除 verifyMutation 从依赖数组

  if (verificationStatus === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <SpinLoading />
        <p className="mt-4 text-gray-600">Verifying your school email...</p>
      </div>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Result
          icon={<SmileOutline />}
          status='success'
          title='Verification Successful'
          description='Your school email has been verified successfully. Redirecting to profile page...'
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Result
        icon={<CloseOutline />}
        status='error'
        title='Verification Failed'
        description={
          errorMessage === 'Please login first' ? (
            <div>
              <p>{errorMessage}</p>
              <button
                onClick={() => router.push(`/login?redirectTo=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Go to Login
              </button>
            </div>
          ) : (
            errorMessage || 'Failed to verify your school email. Please try again.'
          )
        }
      />
    </div>
  );
}

// 加载状态组件
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <SpinLoading />
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  );
}

// 主页面组件
export default function VerifySchoolEmailPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <VerifySchoolEmailContent />
    </Suspense>
  );
} 