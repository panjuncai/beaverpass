"use client";
import DetailHeader from "@/components/banner/detail-header";
import { usePostStore } from "@/lib/store/post-store";
import { AntdRegistry } from '@ant-design/nextjs-registry';

export default function DetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const post = usePostStore(state => state.currentPost)
  return (
    <AntdRegistry>
    <div className="flex flex-col h-screen">
      <DetailHeader
        isShowBack={true}
        pageTitle={post?.title || ""}
        isShowRight={true}
      />
      <main className="flex-1 overflow-y-auto scroll-behavior-smooth -webkit-overflow-scrolling-touch mt-2">{children}</main>
    </div>
    </AntdRegistry>
  );
}
