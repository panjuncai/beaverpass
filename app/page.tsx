import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'BeaverPass - 安全的密码管理器',
  description: '使用BeaverPass安全地管理您的密码和凭据',
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow">
        <div className="container flex items-center justify-between px-4 py-6 mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">BeaverPass</h1>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              登录
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              注册
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="container px-4 py-12 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              安全地管理您的密码
            </h2>
            <p className="mt-5 text-xl text-gray-500">
              BeaverPass是一个安全的密码管理器，帮助您生成、存储和管理强密码，保护您的在线账户安全。
            </p>
            <div className="flex justify-center mt-8 space-x-4">
              <Link
                href="/register"
                className="px-8 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                开始使用
              </Link>
              <Link
                href="/about"
                className="px-8 py-3 text-base font-medium text-blue-700 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200"
              >
                了解更多
              </Link>
            </div>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="p-6 bg-white rounded-lg shadow">
                <div className="flex items-center justify-center w-12 h-12 mx-auto text-white bg-blue-500 rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-center text-gray-900">安全存储</h3>
                <p className="mt-2 text-base text-center text-gray-500">
                  使用高级加密技术安全地存储您的密码和敏感信息。
                </p>
              </div>

              <div className="p-6 bg-white rounded-lg shadow">
                <div className="flex items-center justify-center w-12 h-12 mx-auto text-white bg-blue-500 rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-center text-gray-900">自动同步</h3>
                <p className="mt-2 text-base text-center text-gray-500">
                  在您的所有设备上自动同步您的密码和凭据。
                </p>
              </div>

              <div className="p-6 bg-white rounded-lg shadow">
                <div className="flex items-center justify-center w-12 h-12 mx-auto text-white bg-blue-500 rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-center text-gray-900">强密码生成</h3>
                <p className="mt-2 text-base text-center text-gray-500">
                  生成强大、唯一的密码，提高您的在线安全性。
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800">
        <div className="container px-4 py-8 mx-auto">
          <div className="text-center text-white">
            <p>&copy; {new Date().getFullYear()} BeaverPass. 保留所有权利。</p>
          </div>
        </div>
      </footer>
    </div>
  );
}