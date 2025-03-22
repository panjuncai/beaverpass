"use client";
import DetailHeader from "@/components/banner/detail-header";
import { PostContext, type SerializedPost } from "@/contexts/post-context";
import { useState } from "react";

export default function DetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [post, setPost] = useState<SerializedPost|null>(null);

  return (
    <PostContext.Provider value={{ post, setPost }}>
      <div className="min-h-screen bg-base-200">
        <DetailHeader
          isShowBack={true}
          pageTitle={post?.title || ""}
          isShowRight={true}
        />
        <main className="flex-1 overflow-y-auto scroll-behavior-smooth -webkit-overflow-scrolling-touch mt-2">{children}</main>
      </div>
    </PostContext.Provider>
  );
}
