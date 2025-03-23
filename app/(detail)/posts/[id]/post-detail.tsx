'use client';
import { usePostStore } from "@/lib/store/post-store";
import PostDetailMainSwiper from "./post-detail-swiper";
import PostDetailMainPostDetail from "./post-detail-postdetail";
import PostDetailMainSeller from "./post-detail-seller";
import PostDetailMainPostAbout from "./post-detail-postabout";
import PostDetailMainDelivery from "./post-detail-delivery";
import PostDetailBuy from "./post-detail-buy";
export default function PostDetail() {
  const currentPost = usePostStore(state => state.currentPost)
  return (
    <>
    <div className="pl-4 pr-4 pb-24">
      <PostDetailMainSwiper post={currentPost} />
      <PostDetailMainPostDetail post={currentPost} />
      <PostDetailMainSeller post={currentPost} />
      <PostDetailMainPostAbout />
      <PostDetailMainDelivery />
    </div>
    <PostDetailBuy />
    </>
  );
} 