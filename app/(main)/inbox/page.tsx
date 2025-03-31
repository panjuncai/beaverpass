'use client';
import { useAuthStore } from '@/lib/store/auth-store';
import CenteredLoading from '../loading';
import NoLogin from '@/components/utils/no-login';
import InboxList from './inbox-list';

export default function InboxPage() {
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
      <InboxList />
    </div>
  );
} 