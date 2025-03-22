'use client';
import { usePost } from "@/contexts/post-context";
import PostDetailMainSwiper from "./post-detail-main-swiper";
import PostDetailMainPostDetail from "./post-detail-main-postdetail";
import PostDetailMainSeller from "./post-detail-main-seller";
import PostDetailMainPostAbout from "./post-detail-main-postabout";
import PostDetailMainDelivery from "./post-detail-main-delivery";

export default function PostDetail() {
  const { post } = usePost();

  return (
    <div className="pl-4 pr-4 pb-24">
      <PostDetailMainSwiper post={post} />
      <PostDetailMainPostDetail post={post} />
      <PostDetailMainSeller post={post} />
      <PostDetailMainPostAbout />
      <PostDetailMainDelivery />
    </div>
  );
} 