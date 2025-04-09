"use client";
import { SerializedPost } from "@/lib/types/post";
import { Swiper } from "antd-mobile";

import Image from "next/image";

export default function PostDetailMainSwiper({ post }: { post: SerializedPost | null }) {
  const items = post?.images.map((image, index) => (
    <Swiper.Item key={index}>
      <div className="relative w-full h-60 md:h-80 lg:h-[400px] xl:h-[500px] rounded-xl">
        <Image
          src={image.imageUrl}
          alt={post?.title || ""}
          priority={index === 0}
          fill
          className="object-contain p2 rounded-xl"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 70vw"
        />
        <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-sm">
        {index + 1} / {post?.images.length}
      </div>
      </div>
    </Swiper.Item>
  ));
  return (
    <div className="carousel w-full h-60 md:h-80 lg:h-[400px] xl:h-[500px] rounded-xl">
      <Swiper loop autoplay indicatorProps={{
              color: 'white',
            }}>
        {items}
      </Swiper>
    </div>
  );
}
