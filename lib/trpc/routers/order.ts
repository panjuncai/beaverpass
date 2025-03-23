import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "..";
import { createOrderSchema, getOrdersSchema } from "@/lib/validations/order";

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
            post: true,
            buyer: true,
            seller: true,
        },
        ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
    });
    return orders;
  }),
  // 创建订单
  createOrder: protectedProcedure.input(createOrderSchema).mutation(async ({ ctx, input }) => {
    try {
      // 使用普通的 create 操作替代事务
      const order = await ctx.prisma.order.create({
        data: {
          ...input,
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
});
