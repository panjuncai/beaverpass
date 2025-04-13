import './globals.css';
import 'antd-mobile/es/global';
import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { Inter, Poppins } from 'next/font/google';


const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins'
});

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
    <html lang="en" translate="no">
      <head />
      <body className={`${inter.className} ${poppins.variable} container notranslate`}>
          <Providers>{children}</Providers>
      </body>
    </html>
  );
}
