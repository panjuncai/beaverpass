import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Post | BeaverPass',
  description: 'Post Product',
};

export default async function PostPage() {
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Post Product</h1>
      </div>
    </div>
  );
} 