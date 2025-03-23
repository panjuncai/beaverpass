import { Order as PrismaOrder } from "@prisma/client";
// import type { inferRouterOutputs } from '@trpc/server';
// import type { AppRouter } from '@/lib/trpc/routers/_app';

// tRPC 输出类型
// type RouterOutput = inferRouterOutputs<AppRouter>;
// export type OrderResponse = RouterOutput['order']['getOrderById'];

// 序列化后的 Order 类型（用于前端展示）
export type SerializedOrder = 
Omit<PrismaOrder, 'paymentFee'> &
Omit<PrismaOrder, 'deliveryFee'> &
Omit<PrismaOrder, 'serviceFee'> &
Omit<PrismaOrder, 'tax'> &
Omit<PrismaOrder, 'total'> &
{
  paymentFee: number;
  deliveryFee: number;
  serviceFee: number;
  tax: number;
  total: number;
  buyer: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    address: string | null;
    avatar: string | null;
  };
  seller: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    address: string | null;
    avatar: string | null;
  };
}

export interface OrderQueryParams {
  limit?: number;
  cursor?: string;
  status?: string;
  buyerId?: string;
  sellerId?: string;
  postId?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentTransactionId?: string;
  paymentFee?: number;
  deliveryFee?: number;
  serviceFee?: number;
  tax?: number;
  total?: number;
  createdAt?: Date;
  updatedAt?: Date;
  sortBy?: 'createdAt' | 'total';
  sortOrder?: 'asc' | 'desc';
}