'use client';
import NoLogin from '@/components/utils/no-login';
import { useAuthStore } from '@/lib/store/auth-store';
import CenteredLoading from '@/app/(main)/loading';
import ProfileForm from './profile-form';

export default function ProfilePage() {
    
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
    <div className="max-w-xl mx-auto">
      <ProfileForm />
    </div>
  );
}