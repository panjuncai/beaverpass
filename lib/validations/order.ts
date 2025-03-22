import { z } from 'zod';

export const createOrderSchema = z.object({
  shippingAddress: z.string().min(1, "收货地址不能为空"),
  shippingReceiver: z.string().min(1, "收货人不能为空"),
  shippingPhone: z.string().min(1, "联系电话不能为空"),
  paymentMethod: z.string().min(1, "请选择支付方式"),
  postId: z.string().uuid("无效的商品ID"),
  sellerId: z.string().uuid("无效的卖家ID"),
  total: z.number().positive("总金额必须大于0"),
  // 以下字段有默认值，可选
  paymentTransactionId: z.string().optional(),
  paymentFee: z.number().default(0),
  deliveryFee: z.number().default(0),
  serviceFee: z.number().default(0),
  tax: z.number().default(0),
  status: z.string().default("PENDING_PAYMENT")
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// 订单状态枚举
export const OrderStatus = {
  PENDING_PAYMENT: "PENDING_PAYMENT",    // 待付款
  PAID: "PAID",                         // 已付款
  SHIPPED: "SHIPPED",                   // 已发货
  DELIVERED: "DELIVERED",               // 已送达
  COMPLETED: "COMPLETED",               // 已完成
  CANCELLED: "CANCELLED",               // 已取消
  REFUNDED: "REFUNDED"                  // 已退款
} as const;

// 支付方式枚举
export const PaymentMethod = {
  CREDIT_CARD: "CREDIT_CARD",          // 信用卡
  DEBIT_CARD: "DEBIT_CARD",           // 借记卡
  PAYPAL: "PAYPAL",                    // PayPal
  VENMO: "VENMO"                       // Venmo
} as const;