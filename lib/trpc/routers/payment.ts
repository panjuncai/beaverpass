import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "..";
import { createPaymentIntentSchema } from "@/lib/validations/payment";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
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
          amount: Math.round(order.total * 100), // Stripe expects amount in cents
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
}); 