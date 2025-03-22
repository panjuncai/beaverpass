'use client';

import { trpc } from "@/lib/trpc/client";
import Image from "next/image";

export default function PostDetail({ id }: { id: string }) {
  const { data: post, isLoading } = trpc.post.getPostById.useQuery({ id });

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Post not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="card bg-base-100 shadow-xl">
        <figure className="relative h-96 w-full">
          {post.images[0] && (
            <Image
              src={post.images[0].imageUrl}
              alt={post.title}
              fill
              className="object-cover"
            />
          )}
        </figure>
        <div className="card-body">
          <h2 className="card-title text-3xl">{post.title}</h2>
          <div className="flex items-center gap-4">
            <div className="badge badge-primary">{post.category}</div>
            <div className="badge badge-secondary">{post.condition}</div>
            {post.isNegotiable && (
              <div className="badge badge-accent">Negotiable</div>
            )}
          </div>
          <p className="text-2xl font-bold">
            ${post.amount.toString() === "0" ? "Free" : post.amount.toString()}
          </p>
          <p className="whitespace-pre-wrap">{post.description}</p>
          <div className="divider"></div>
          <div className="flex items-center gap-4">
            {post.poster?.avatar && (
              <div className="avatar">
                <div className="w-12 rounded-full">
                  <Image
                    src={post.poster.avatar}
                    alt={`${post.poster.firstName} ${post.poster.lastName}`}
                    width={48}
                    height={48}
                  />
                </div>
              </div>
            )}
            <div>
              <p className="font-bold">
                {post.poster?.firstName} {post.poster?.lastName}
              </p>
              <p className="text-sm text-gray-500">{post.poster?.email}</p>
            </div>
          </div>
          <div className="card-actions justify-end">
            <button className="btn btn-primary">Contact Seller</button>
          </div>
        </div>
      </div>
    </div>
  );
} 