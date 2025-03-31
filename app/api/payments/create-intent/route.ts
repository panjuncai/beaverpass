import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import {createClient} from "@/utils/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-08-16",
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.id) {
      console.error("🙀🙀🙀 [PAYMENT_INTENT] No authenticated user found");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      console.error("🙀🙀🙀 [PAYMENT_INTENT] No orderId provided");
      return new NextResponse("Order ID is required", { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { post: true },
    });
    
    if (!order) {
      console.error("🙀🙀🙀 [PAYMENT_INTENT] Order not found:", orderId);
      return new NextResponse("Order not found", { status: 404 });
    }

    if (order.buyerId !== session.user.id) {
      console.error("🙀🙀🙀 [PAYMENT_INTENT] Unauthorized access attempt:", {
        orderBuyerId: order.buyerId,
        sessionUserId: session.user.id
      });
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!order.total || order.total.lessThan(0)) {
      console.error("🙀🙀🙀 [PAYMENT_INTENT] Invalid order total:", order.total);
      return new NextResponse("Invalid order total", { status: 400 });
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

    // 更新订单的支付ID
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentTransactionId: paymentIntent.id },
    });

    return NextResponse.json({ 
      data: { clientSecret: paymentIntent.client_secret! }
    });
  } catch (error) {
    console.error("🙀🙀🙀 [PAYMENT_INTENT] Error:", error);
    if (error instanceof Stripe.errors.StripeError) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
} 