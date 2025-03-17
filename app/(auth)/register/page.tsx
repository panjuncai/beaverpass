import { RegisterForm } from '@/components/auth/register-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up | BeaverPass',
  description: 'Create your BeaverPass account',
};

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-50">
      <RegisterForm />
    </div>
  );
} 