import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import {createClient} from "@/utils/supabase/server"

// 列出所有环境变量的键（不显示值，仅用于调试）
console.log("🔥🔥🔥 Available env keys:", Object.keys(process.env).filter(key => 
  key.includes('STRIPE') || key.includes('stripe')
));

// 获取 Stripe 密钥
let stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

// 如果在 Vercel 上遇到问题，可以在这里配置一个硬编码的测试键（仅用于开发环境）
// !!!注意：这仅适用于开发/调试，不应在生产环境使用!!!
if (stripeSecretKey) {
  stripeSecretKey = 'sk_test_51QYfmnCcbR3U95qJuCdoSGfNlinwCkRAjAEGxo0X5YoDAjCNRnD3PEU6601xd12v8L5G20akoYqJiM8xTM0SW2Ns004qDD4GQH'; // 替换为你的测试密钥
  console.log("🔥🔥🔥 Using fallback test key for development"+stripeSecretKey.substring(0, 20));
}

// 初始化 Stripe 实例（延迟初始化）
let stripeInstance: Stripe | null = null;

// 获取 Stripe 实例的函数
const getStripe = (): Stripe => {
  if (!stripeInstance && stripeSecretKey) {
    stripeInstance = new Stripe(stripeSecretKey, { apiVersion: "2023-08-16" });
  }
  
  if (!stripeInstance) {
    throw new Error('Stripe not initialized - missing API key');
  }
  
  return stripeInstance;
};

export async function POST(req: Request) {
  try {
    // 检查密钥
    if (!stripeSecretKey) {
      console.error("🙀🙀🙀 [PAYMENT_INTENT] STRIPE_SECRET_KEY is not set in environment variables");
      return new NextResponse("Stripe configuration error", { status: 500 });
    }

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

    if (!order.total || Number(order.total) <= 0) {
      console.error("🙀🙀🙀 [PAYMENT_INTENT] Invalid order total:", order.total);
      return new NextResponse("Invalid order total", { status: 400 });
    }

    console.log("🐱🐱🐱[PAYMENT_INTENT] Creating payment intent with amount:", order.total);
    
    try {
      // 获取 Stripe 实例
      const stripe = getStripe();
      
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
    } catch (stripeError) {
      console.error("🙀🙀🙀 [PAYMENT_INTENT] Stripe API Error:", stripeError);
      throw stripeError;
    }
  } catch (error) {
    console.error("🙀🙀🙀 [PAYMENT_INTENT] Error:", error);
    if (error instanceof Stripe.errors.StripeError) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
} 