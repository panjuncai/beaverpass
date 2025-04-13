import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@/lib/trpc/routers/_app';
import { Decimal } from '@prisma/client/runtime/library';
import { DeliveryType } from './enum';

// tRPC 输出类型
type RouterOutput = inferRouterOutputs<AppRouter>;
export type PostResponse = RouterOutput['post']['getPostById'];

// 序列化后的 Post 类型（用于前端展示）
export interface SerializedPost {
  id: string;
  title: string;
  description: string;
  amount: number | string | Decimal; // Allow Decimal type from Prisma
  category: string;
  condition: string;
  isNegotiable: boolean | null;
  deliveryType: string;
  status: string | null;
  posterId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  images: {
    id: string;
    imageUrl: string;
    imageType: string | null;
    postId: string;
    createdAt: Date | null;
  }[];
  poster: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
    phone: string | null;
    address: string | null;
    schoolEmail: string | null;
    schoolEmailVerified: boolean | null;
  } | null;
  order: {
    id: string;
    shipping_address: string | null;
    shipping_receiver: string | null;
    shipping_phone: string | null;
    total: number | null;
    delivery_type: keyof typeof DeliveryType | null;
    status: string;
    createdAt: Date | null;
  } | null;
}

// Post 相关的查询参数类型
export interface PostQueryParams {
  limit?: number;
  cursor?: string;
  posterId?: string;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'createdAt' | 'amount';
  sortOrder?: 'asc' | 'desc';
  pageParam?: number;
}

export interface PostsResponse {
  items: SerializedPost[];
  nextCursor?: { id: string };
  total: number;
} 