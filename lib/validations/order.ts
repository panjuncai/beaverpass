import { z } from 'zod';
import type { OrderQueryParams } from '@/lib/types/order';
import { PaymentMethod, DeliveryType } from '@/lib/types/enum';

export const createOrderSchema = z.object({
  shippingAddress: z.string().min(1, "Address is required"),
  shippingReceiver: z.string().min(1, "Receiver is required"),
  shippingPhone: z.string().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  deliveryType: z.nativeEnum(DeliveryType),
  postId: z.string().uuid("Invalid post ID").optional(),
  sellerId: z.string().uuid("Invalid seller ID").optional(),
  total: z.number().positive("Total must be greater than 0").optional(),
  paymentTransactionId: z.string().optional(),
  paymentFee: z.number().default(0),
  deliveryFee: z.number().default(0),
  serviceFee: z.number().default(0),
  tax: z.number().default(0),
  status: z.string().default("PENDING_PAYMENT")
});

export const getOrdersSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(10),
  cursor: z.string().optional(),
  status: z.string().optional(),
  id: z.string().uuid("Invalid order ID").optional(),
  buyerId: z.string().uuid("Invalid buyer ID").optional(),
  sellerId: z.string().uuid("Invalid seller ID").optional(),
  postId: z.string().uuid("Invalid post ID").optional(),
  shippingAddress: z.string().optional(),
  shippingReceiver: z.string().optional(),
  shippingPhone: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentTransactionId: z.string().optional(),
  paymentFee: z.number().optional(),
  deliveryFee: z.number().optional(),
  serviceFee: z.number().optional(),
  tax: z.number().optional(),
  total: z.number().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  sortBy: z.enum(['createdAt', 'total']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  include: z.object({
    post: z.object({
      include: z.object({
        images: z.boolean()
      })
    }).optional(),
    buyer: z.boolean().optional(),
    seller: z.boolean().optional()
  }).optional()
}) satisfies z.ZodType<OrderQueryParams>;

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type GetOrdersInput = z.infer<typeof getOrdersSchema>;
