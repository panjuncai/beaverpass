import { Post as PrismaPost } from "@prisma/client";
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@/lib/trpc/routers/_app';

// tRPC 输出类型
type RouterOutput = inferRouterOutputs<AppRouter>;
export type PostResponse = RouterOutput['post']['getPostById'];

// 序列化后的 Post 类型（用于前端展示）
export type SerializedPost = Omit<PrismaPost, 'amount'> & {
  amount: number;
  images: { 
    id: string; 
    createdAt: Date | null; 
    imageUrl: string; 
    imageType: string | null; 
    postId: string; 
  }[];
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

// Post 相关的查询参数类型
export interface PostQueryParams {
  limit?: number;
  cursor?: string;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'createdAt' | 'price';
  sortOrder?: 'asc' | 'desc';
} 