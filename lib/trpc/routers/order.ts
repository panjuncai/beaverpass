import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "..";
import { createOrderSchema, getOrdersSchema } from "@/lib/validations/order";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { OrderStatus, PostStatus } from "@/lib/types/enum";

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
      const maxRetries = 3;
      let retryCount = 0;
      let lastError = null;

      while (retryCount < maxRetries) {
        try {
          const order = await ctx.prisma.order.findFirst({
            where: {
              paymentTransactionId: input.paymentIntentId,
            },
            include: {
              post: true, // 获取关联的post信息
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

          let updatedOrder;
          
          // 如果订单状态更新为已支付，同时更新post状态为已售出
          if (input.status === OrderStatus.PAID && order.post) {
            // 更新订单状态
            updatedOrder = await ctx.prisma.order.update({
              where: { id: order.id },
              data: { status: input.status },
            });
            
            // 更新商品状态为已售出
            await ctx.prisma.post.update({
              where: { id: order.post.id },
              data: { status: PostStatus.SOLD },
            });
          } else {
            // 只更新订单状态
            updatedOrder = await ctx.prisma.order.update({
              where: { id: order.id },
              data: { status: input.status },
            });
          }
          
          // 操作成功，返回更新后的订单并退出函数
          return updatedOrder;
        } catch (error) {
          lastError = error;
          retryCount++;
          
          if (error instanceof TRPCError) {
            throw error; // 直接抛出业务逻辑错误
          }
          
          // 如果是数据库连接错误，等待后重试
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            console.log(`Retrying order status update (attempt ${retryCount + 1}/${maxRetries})`);
            continue;
          }
          
          console.error("Failed to update order status after retries:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update order status after multiple attempts",
          });
        }
      }

      throw lastError;
    }),
  // 重新进入支付界面
  reenterPayment: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const order = await ctx.prisma.order.findUnique({
          where: { id: input.orderId },
          include: { post: true },
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
            message: "Not authorized to access this order",
          });
        }

        // 检查订单状态是否为待支付
        if (order.status !== OrderStatus.PENDING_PAYMENT) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Order is not in pending payment status",
          });
        }

        // 只返回订单信息，不进行更新
        return order;
      } catch (error) {
        console.error('Failed to reenter payment:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to reenter payment",
        });
      }
    }),
  // 取消超时未支付的订单
  cancelExpiredOrder: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const order = await ctx.prisma.order.findUnique({
          where: { id: input.orderId },
          include: { post: true },
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
            message: "Not authorized to cancel this order",
          });
        }

        // 检查订单状态，只有非终态订单才能取消
        if (order.status === OrderStatus.COMPLETED || 
            order.status === OrderStatus.CANCELLED || 
            order.status === OrderStatus.REFUNDED) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This order cannot be cancelled",
          });
        }

        // 更新订单状态为已取消
        const updatedOrder = await ctx.prisma.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.CANCELLED },
        });

        // 如果有关联的商品，将商品状态更新为活跃
        if (order.post) {
          await ctx.prisma.post.update({
            where: { id: order.post.id },
            data: { status: PostStatus.ACTIVE },
          });
        }

        return updatedOrder;
      } catch (error) {
        console.error('Failed to cancel expired order:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to cancel order",
        });
      }
    }),
});
