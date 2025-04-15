import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "..";
import { createPaymentIntentSchema } from "@/lib/validations/payment";
import Stripe from "stripe";
import { z } from "zod";
import { OrderStatus, SettlementStatus } from "@/lib/types/enum";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-08-16",
});

export const paymentRouter = router({
  createPaymentIntent: protectedProcedure
    .input(createPaymentIntentSchema)
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

        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(Number(order.total) * 100), // Stripe expects amount in cents
          currency: "cad",
          automatic_payment_methods: {
            enabled: true,
          },
          metadata: {
            orderId: order.id,
            postId: order.postId,
            buyerId: order.buyerId,
            sellerId: order.sellerId,
          },
        });

        return { clientSecret: paymentIntent.client_secret! };
      } catch (error) {
        console.error("Error creating payment intent:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create payment intent",
        });
      }
    }),
  transferToSeller: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // 获取订单信息
      const order = await ctx.prisma.order.findUnique({
        where: { id: input.orderId },
        include: { seller: true },
      });

      if (!order || order.status !== OrderStatus.PAID) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Order not eligible for settlement",
        });
      }

      // 卖家的Stripe账户ID
      const sellerStripeAccountId = order.seller.stripeAccountId;
      if (!sellerStripeAccountId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Seller has no connected Stripe account",
        });
      }

      try {
        // 计算卖家应得金额 (减去平台服务费)
        const applicationFee =
          Number(order.serviceFee) +
          Number(order.paymentFee) +
          Number(order.deliveryFee) +
          Number(order.tax);
        const sellerAmount = Number(order.total) - applicationFee;

        // 创建转账
        const transfer = await stripe.transfers.create({
          amount: Math.round(sellerAmount * 100),
          currency: "cad",
          destination: sellerStripeAccountId,
          transfer_group: order.id,
          source_transaction: order.paymentTransactionId ?? undefined,
          metadata: { orderId: order.id },
        });

        // 更新订单结算状态
        await ctx.prisma.order.update({
          where: { id: order.id },
          data: {
            settlementStatus: SettlementStatus.COMPLETED,
            settlementId: transfer.id,
          },
        });

        return { success: true, transferId: transfer.id };
      } catch (error) {
        console.error("Transfer to seller failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to transfer funds to seller",
        });
      }
    }),
});
