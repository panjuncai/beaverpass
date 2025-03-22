'use client'
import { SerializedPost } from "@/contexts/post-context";
import Image from "next/image";

export default function OrderPreviewPostDetail({ post }: { post: SerializedPost }) {
  const imageUrl = post?.images?.[0]?.imageUrl;
  
  if (!imageUrl) {
    return <div>Loading...</div>;
  }

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
      <h2 className="card-title">{post?.title}</h2>
        <div className="relative w-full h-60 rounded-xl">
          <Image
            src={imageUrl}
            alt={post?.title || "Product image"}
            priority
            fill
            className="object-cover rounded-xl"
          />
        </div>
        <p>{post?.description}</p>
        <div className="badge badge-outline">{post?.condition}</div>
      </div>
    </div>
  );
}