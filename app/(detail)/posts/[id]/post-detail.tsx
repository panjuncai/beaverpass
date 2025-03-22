'use client';
import { usePost } from "@/contexts/post-context";
import PostDetailMainSwiper from "./post-detail-swiper";
import PostDetailMainPostDetail from "./post-detail-postdetail";
import PostDetailMainSeller from "./post-detail-seller";
import PostDetailMainPostAbout from "./post-detail-postabout";
import PostDetailMainDelivery from "./post-detail-delivery";
import PostDetailBuy from "./post-detail-buy";
export default function PostDetail() {
  const { post } = usePost();
  return (
    <>
    <div className="pl-4 pr-4 pb-24">
      <PostDetailMainSwiper post={post} />
      <PostDetailMainPostDetail post={post} />
      <PostDetailMainSeller post={post} />
      <PostDetailMainPostAbout />
      <PostDetailMainDelivery />
    </div>
    <PostDetailBuy />
    </>
  );
} 