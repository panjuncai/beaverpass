'use client'
import  PostForm  from '@/app/(main)/post/post-form';
import { useAuthStore } from '@/lib/store/auth-store';
import NoLogin from '@/components/utils/no-login';
import CenteredLoading from '../loading';

export default function PostPage() {
  const { loginUser, isLoading } = useAuthStore();

  if (isLoading) {
    return <CenteredLoading />;
  }
  
  if (!loginUser) {
    return (
      <div className="flex flex-col h-full justify-center">
        <NoLogin />
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <PostForm />
    </div>
  );
} 