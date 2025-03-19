'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const access_token = hashParams.get('access_token');
    const redirectTo = hashParams.get('redirectTo') || '/search';

    if (access_token) {
      console.log('Google 登录成功,Token:', access_token);
      router.push(redirectTo);
    } else {
      router.push('/login');
    }
  }, [router]);

  return <div>Please wait...</div>;
}
