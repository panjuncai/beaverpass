// app/api/payments/webhook/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { OrderStatus } from "@/lib/types/enum";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-08-16"
});

// Webhook密钥
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature") as string;
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed.`, err);
    return new NextResponse(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`, { status: 400 });
  }

  // 处理不同的事件类型
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    await handlePaymentIntentSucceeded(paymentIntent);
  } else if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    await handlePaymentIntentFailed(paymentIntent);
  }
  
  return new NextResponse(JSON.stringify({ received: true }));
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { orderId } = paymentIntent.metadata;
  
  // 更新订单状态为已支付
  await prisma.order.update({
    where: { id: orderId },
    data: { 
      status: OrderStatus.PAID,
    }
  });
  
  // 这里可以添加其他逻辑，如更新商品状态、发送通知等
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { orderId } = paymentIntent.metadata;
  
  // 更新订单支付状态
  await prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.FAILED }
  });
}