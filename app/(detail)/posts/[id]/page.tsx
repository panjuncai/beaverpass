import PostDetail from "@/app/(detail)/posts/[id]/post-detail-main";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PostContextUpdater } from "./post-context-updater";

interface PageProps {
  params: Promise<{ id: string }> | undefined;
}

export default async function PostDetailPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams?.id;

  if (!id) {
    notFound();
  }

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
