import { Metadata } from 'next';
import  PostForm  from '@/app/(main)/post/post-form';

export const metadata: Metadata = {
  title: 'Post | BeaverPass',
  description: 'Post Product',
};

export default function PostPage() {
  return (
    <div className="container px-4 py-8 mx-auto">
      <PostForm />
    </div>
  );
} 