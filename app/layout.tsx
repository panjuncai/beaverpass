import './globals.css';
import 'antd-mobile/es/global';
import type { Metadata } from 'next';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'BeaverPass',
  description: 'BeaverPass - Your Best Secondhand Goods Store',
  icons: {
    icon: '/browser_logo.svg',
    apple: '/browser_logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className="container">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
