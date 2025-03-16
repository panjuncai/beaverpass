import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase';

export const metadata: Metadata = {
  title: '仪表板 | BeaverPass',
  description: '管理您的密码和凭据',
};

export default async function DashboardPage() {
  // 在服务器端检查用户是否已登录
  const supabase = createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    // 如果用户未登录，重定向到登录页面
    redirect('/login');
  }
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">欢迎回来，{session.user.email}</h1>
        <p className="mt-2 text-gray-600">管理您的密码和凭据</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900">密码库</h2>
          <p className="mt-2 text-gray-600">安全地存储和管理您的密码</p>
          <button className="px-4 py-2 mt-4 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            查看密码
          </button>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900">安全笔记</h2>
          <p className="mt-2 text-gray-600">存储敏感信息和笔记</p>
          <button className="px-4 py-2 mt-4 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            查看笔记
          </button>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900">密码生成器</h2>
          <p className="mt-2 text-gray-600">生成强大、唯一的密码</p>
          <button className="px-4 py-2 mt-4 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            生成密码
          </button>
        </div>
      </div>
    </div>
  );
} 