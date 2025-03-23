'use client';

import type { SerializedPost } from "@/lib/types/post";
import { useEffect } from "react";
import { usePostStore } from "@/lib/store/post-store";

export function PostStoreUpdater({ post }: { post: SerializedPost | null }) {
  const setCurrentPost = usePostStore(state => state.setCurrentPost);

  useEffect(() => {
    setCurrentPost(post);
  }, [post, setCurrentPost]);

  return null;
} 