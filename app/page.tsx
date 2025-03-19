import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'BeaverPass',
  description: 'BeaverPass - Your Best Secondhand Goods Store',
};

export default function HomePage() {
  redirect('/search');

  // 这段代码不会执行，因为 redirect 会中断函数执行
  return (
    <>
    Welcome to BeaverPass
    </>
  );
}