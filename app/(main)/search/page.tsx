import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search | BeaverPass',
  description: 'Search Products',
};

export default async function SearchPage() {
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-red-900 h-300">The Search Page</h1>
      </div>
    </div>
  );
} 