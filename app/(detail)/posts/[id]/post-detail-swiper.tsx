"use client";
import { type SerializedPost } from "@/contexts/post-context";
import { Swiper } from "antd-mobile";

import Image from "next/image";

export default function PostDetailMainSwiper({ post }: { post: SerializedPost | null }) {
  const items = post?.images.map((image, index) => (
    <Swiper.Item key={index}>
      <div className="relative w-full h-60 rounded-xl">
        <Image
          src={image.imageUrl}
          alt={post?.title || ""}
          priority={index === 0}
          fill
          className="object-cover"
        />
      </div>
    </Swiper.Item>
  ));
  return (
    <div className="carousel w-full h-60 rounded-xl">
      <Swiper loop autoplay indicatorProps={{
              color: 'white',
            }}>
        {items}
      </Swiper>
    </div>
  );
}
