import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "..";
import { createOrderSchema, getOrdersSchema } from "@/lib/validations/order";
import { z } from "zod";
// import { Prisma } from "@prisma/client";
import { OrderStatus, PostStatus } from "@/lib/types/enum";


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
        buyer: true,
        seller: true,
        post: {
          include: {
            images: true
          }
        },
      },
      ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
    });
    return orders;
  }),
  // 获取订单详情
  getOrder: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const order = await ctx.prisma.order.findUnique({
      where: { id: input.id },
      include: {
        buyer: true,
        seller: true,
        post: {
          include: {
            images: true,
          },
        },
      },
    });
    return order;
  }),
  // 创建订单
  createOrder: protectedProcedure.input(createOrderSchema).mutation(async ({ ctx, input }) => {
    try {
      const { sellerId, postId, total, shippingPhone, ...rest } = input;
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
          shippingPhone: shippingPhone || "",
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
  updateOrderStatus: publicProcedure
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
          // if (order.buyerId !== ctx.loginUser.id) {
          //   throw new TRPCError({
          //     code: "UNAUTHORIZED",
          //     message: "Not authorized to update this order",
          //   });
          // }
          
          // 检查订单当前状态，提供幂等性处理
          if (order.status === input.status) {
            console.log(`Order ${order.id} already has status ${input.status}, skipping update`);
            return order; // 直接返回订单，不进行更新操作
          }

          let updatedOrder;
          
          // 如果订单状态更新为已支付，同时更新post状态为已售出
          if (input.status === OrderStatus.PAID && order.post) {
            // 使用事务确保数据一致性
            updatedOrder = await ctx.prisma.$transaction(async (tx) => {
              // 更新订单状态
              const updated = await tx.order.update({
                where: { id: order.id },
                data: { status: input.status },
              });
              
              // 更新商品状态为已售出
              await tx.post.update({
                where: { id: order.post.id },
                data: { status: PostStatus.SOLD },
              });
              
              return updated;
            });
          } else {
            // 只更新订单状态
            updatedOrder = await ctx.prisma.order.update({
              where: { id: order.id },
              data: { status: input.status },
            });
          }
          
          // 操作成功，返回更新后的订单并退出函数
          console.log(`Successfully updated order ${order.id} status to ${input.status}`);
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
            message: error instanceof Error ? error.message : "Failed to update order status after multiple attempts",
          });
        }
      }

      throw lastError;
    }),
    // 更新订单预约时间
  updateOrderPickupTime:publicProcedure
  .input(
    z.object({
      orderId: z.string(),
      pickupStartTime: z.string(),
      pickupEndTime: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const order = await ctx.prisma.order.findFirst({
          where: {
            id: input.orderId,
          }, 
        });

        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        // 验证订单必须是卖家才能更新预约时间
        // if (order.sellerId !== ctx.loginUser.id) {
        //   throw new TRPCError({
        //     code: "UNAUTHORIZED",
        //     message: "Not authorized to update this order",
        //   });
        // }
        
        // 只更新订单预约时间
        const updatedOrder = await ctx.prisma.order.update({
          where: { id: order.id },
          data: { pickupStartTime: input.pickupStartTime, pickupEndTime: input.pickupEndTime },
        });
        
        // 操作成功，返回更新后的订单并退出函数
        console.log(`Successfully updated order ${order.id} pickup time to ${input.pickupStartTime} - ${input.pickupEndTime}`);
        return updatedOrder;
      } catch (error) {
        console.error('update order pickup time error:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to update order pickup time",
        });
      }
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

        // 检查订单状态，只有Pending_Payment状态的订单才能取消
        if (order.status !== OrderStatus.PENDING_PAYMENT) {
          // 如果订单已经是终态，直接返回订单，不抛出错误
          console.log(`Order ${order.id} already in final state: ${order.status}`);
          return order;
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
