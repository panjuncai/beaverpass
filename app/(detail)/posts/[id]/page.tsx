import PostDetail from "@/components/post/post-detail";

export default async function PostDetailPage({params}: {params: {id: string}}) {
    return <PostDetail id={params.id} />;
} 