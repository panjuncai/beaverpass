'use client';

import { Post as PrismaPost } from "@prisma/client";
import { createContext, useContext } from 'react';

export type SerializedPost = Omit<PrismaPost, 'amount'> & {
  amount: number;
  images: { id: string; createdAt: Date | null; imageUrl: string; imageType: string | null; postId: string; }[];
  poster: { 
    id: string; 
    email: string; 
    firstName: string | null; 
    lastName: string | null; 
    avatar: string | null; 
    phone: string | null;
    address: string | null;
    createdAt: Date | null; 
    updatedAt: Date | null; 
  } | null;
};

interface PostContextType {
  post: SerializedPost | null;
  setPost: (post: SerializedPost | null) => void;
}

export const PostContext = createContext<PostContextType | null>(null);

export function usePost() {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePost must be used within a PostProvider');
  }
  return context;
} 