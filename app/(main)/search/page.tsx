import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '仪表板 | BeaverPass',
  description: '管理您的密码和凭据',
};

export default async function DashboardPage() {
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">欢迎回来</h1>
      </div>
    </div>
  );
} 