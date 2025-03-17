import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'BeaverPass',
  description: 'BeaverPass - Your Best Secondhand Goods Store',
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="container px-4 py-12 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mt-8 space-x-4">
              <h1>BeaverPass</h1>
              <Link
                href="/register"
                className="px-8 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                注册 
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 text-base font-medium text-blue-700 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200"
              >
                登录
              </Link>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}