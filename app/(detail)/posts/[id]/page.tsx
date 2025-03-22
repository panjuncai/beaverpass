import PostDetail from "@/app/(detail)/posts/[id]/post-detail-main";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PostContextUpdater } from "./post-context-updater";

export default async function PostDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      images: true,
      poster: true,
    },
  });

  if (!post) {
    notFound();
  }

  // Convert Decimal to number
  const serializedPost = {
    ...post,
    amount: Number(post.amount),
  };

  return (
    <>
      <PostContextUpdater post={serializedPost} />
      <PostDetail />
    </>
  );
}
