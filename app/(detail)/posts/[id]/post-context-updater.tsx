'use client';

import { usePost, type SerializedPost } from "@/contexts/post-context";
import { useEffect } from "react";

export function PostContextUpdater({ post }: { post: SerializedPost | null }) {
  const { setPost } = usePost();

  useEffect(() => {
    setPost(post);
    return () => setPost(null);
  }, [post, setPost]);

  return null;
} 