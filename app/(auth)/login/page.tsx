import { LoginForm } from '@/components/auth/login-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '登录 | BeaverPass',
  description: '登录到您的BeaverPass账户',
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { registered?: string };
}) {
  const showRegisteredMessage = searchParams.registered === 'true';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gray-50">
      {showRegisteredMessage && (
        <div className="w-full max-w-md p-4 mb-4 text-green-700 bg-green-100 rounded-md">
          <p className="text-center">注册成功！请登录您的账户。</p>
        </div>
      )}
      <LoginForm />
    </div>
  );
}