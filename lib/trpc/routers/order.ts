import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "..";
import { createOrderSchema, getOrdersSchema } from "@/lib/validations/order";
import { z } from "zod";
import { Prisma } from "@prisma/client";

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    post: {
      include: {
        images: true;
      };
    };
    buyer: true;
    seller: true;
  };
}>;

const serializeOrder = (order: OrderWithRelations) => ({
  ...order,
  paymentFee: order.paymentFee ? Number(order.paymentFee) : 0,
  deliveryFee: order.deliveryFee ? Number(order.deliveryFee) : 0,
  serviceFee: order.serviceFee ? Number(order.serviceFee) : 0,
  tax: order.tax ? Number(order.tax) : 0,
  total: order.total ? Number(order.total) : 0,
  post: order.post ? {
    ...order.post,
    amount: order.post.amount ? Number(order.post.amount) : 0
  } : null
});

export const orderRouter = router({
  // 获取订单列表
  getOrders: publicProcedure.input(getOrdersSchema).query(async ({ ctx, input }) => {
    const orders = await ctx.prisma.order.findMany({
      take: input.limit,
      where: {
        ...(input.id && { id: input.id }),
        ...(input.postId && { postId: input.postId }),
        ...(input.buyerId && { buyerId: input.buyerId }),
        ...(input.sellerId && { sellerId: input.sellerId }),
        ...(input.status && { status: input.status }),
        ...(input.paymentMethod && { paymentMethod: input.paymentMethod }),
        ...(input.paymentTransactionId && { paymentTransactionId: input.paymentTransactionId }),
        ...(input.shippingAddress && { shippingAddress: {contains: input.shippingAddress} }),
        ...(input.shippingReceiver && { shippingReceiver: {contains: input.shippingReceiver} }),
        ...(input.shippingPhone && { shippingPhone: {contains: input.shippingPhone} }),
      },
      orderBy: {
        [input.sortBy]: input.sortOrder,
      },
      include: {
        post: {
          include: {
            images: true
          }
        },
        buyer: true,
        seller: true,
      },
      ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
    });
    return orders.map(serializeOrder);
  }),
  // 创建订单
  createOrder: protectedProcedure.input(createOrderSchema).mutation(async ({ ctx, input }) => {
    try {
      const { sellerId, postId, total, ...rest } = input;
      if (!sellerId || !postId || total === undefined) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Missing required fields",
        });
      }
      const order = await ctx.prisma.order.create({
        data: {
          ...rest,
          sellerId,
          postId,
          total,
          buyerId: ctx.loginUser.id,
        },
      });
      return order;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Failed to create order",
      });
    }
  }),
  // 更新订单状态
  updateOrderStatus: protectedProcedure
    .input(
      z.object({
        paymentIntentId: z.string(),
        status: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const order = await ctx.prisma.order.findFirst({
          where: {
            paymentTransactionId: input.paymentIntentId,
          },
        });

        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        // 验证订单所有者
        if (order.buyerId !== ctx.loginUser.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Not authorized to update this order",
          });
        }

        // 更新订单状态
        const updatedOrder = await ctx.prisma.order.update({
          where: { id: order.id },
          data: { status: input.status },
        });

        return updatedOrder;
      } catch (error) {
        console.error("Failed to update order status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to update order status",
        });
      }
    }),
});
