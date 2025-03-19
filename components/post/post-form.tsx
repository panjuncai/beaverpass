// 'use client';
import { trpc } from "@/lib/trpc/client";
export default function PostForm() {
  const { data: user } = trpc.auth.getUser.useQuery();
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-900 h-300">
          {user?.user?.email}
        </h1>
      </div>
    </div>
  );
}