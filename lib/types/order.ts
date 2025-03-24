// import type { inferRouterOutputs } from '@trpc/server';
// import type { AppRouter } from '@/lib/trpc/routers/_app';

// tRPC 输出类型
// type RouterOutput = inferRouterOutputs<AppRouter>;
// export type OrderResponse = RouterOutput['order']['getOrderById'];

// 序列化后的 Order 类型（用于前端展示）
export type SerializedOrder = {
  id: string;
  status: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  buyerId: string;
  sellerId: string;
  postId: string;
  shippingAddress: string;
  shippingReceiver: string;
  shippingPhone: string;
  paymentMethod: string;
  paymentTransactionId: string | null;
  paymentFee: number;
  deliveryFee: number;
  serviceFee: number;
  tax: number;
  total: number;
  post: {
    id: string;
    title: string;
    amount: number;
    images: { 
      id: string; 
      createdAt: Date | null; 
      imageUrl: string; 
      imageType: string | null; 
      postId: string; 
    }[];
  } | null;
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
  id?: string;
  buyerId?: string;
  sellerId?: string;
  postId?: string;
  shippingAddress?: string;
  shippingReceiver?: string;
  shippingPhone?: string;
  paymentMethod?: string;
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
  include?: {
    post?: {
      include?: {
        images?: boolean;
      };
    };
    buyer?: boolean;
    seller?: boolean;
  };
}