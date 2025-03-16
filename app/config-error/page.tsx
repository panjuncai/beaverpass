import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '配置错误 | BeaverPass',
  description: '应用配置错误',
};

export default function ConfigErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">配置错误</h1>
          <div className="flex items-center justify-center mt-4 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="mt-4 text-gray-600">
            应用程序配置错误。缺少必要的环境变量。
          </p>
        </div>

        <div className="p-4 mt-4 text-sm text-red-700 bg-red-100 rounded-md">
          <p>请确保以下环境变量已正确设置：</p>
          <ul className="pl-5 mt-2 list-disc">
            <li>NEXT_PUBLIC_SUPABASE_URL</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            <li>SUPABASE_SERVICE_ROLE_KEY</li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            如果您是网站管理员，请检查服务器配置。
          </p>
          <Link href="/" className="inline-block px-4 py-2 mt-4 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
} 