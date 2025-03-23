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
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { orderId} = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { post: true },
    });
    
    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    if (order.buyerId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
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

    return NextResponse.json({ 
      data: { clientSecret: paymentIntent.client_secret! }
    });
  } catch (error) {
    console.error("[PAYMENT_INTENT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 