"use client";
import { SerializedPost } from "@/lib/types/post";
import { ImageViewer, Swiper } from "antd-mobile";

import Image from "next/image";
import { useState } from "react";

export default function PostDetailMainSwiper({ post }: { post: SerializedPost | null }) {
  const [visible, setVisible] = useState(false);
  const fullImages=(
    <ImageViewer.Multi
        images={post?.images.map((image) => image.imageUrl) || []}
        visible={visible}
        defaultIndex={1}
        onClose={() => {
          setVisible(false)
        }}
      />
  )
  const items = post?.images.map((image, index) => (
    <Swiper.Item key={index} onClick={() => setVisible(true)}>
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
    <>
    <div className="carousel w-full h-60 md:h-80 lg:h-[400px] xl:h-[500px] rounded-xl">
      <Swiper loop autoplay indicatorProps={{
              color: 'white',
            }}>
        {items}
      </Swiper>
    </div>
    {fullImages}
    </>
  );
}
