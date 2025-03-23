"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { OrderStatus } from "@/lib/types/enum";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentIntent = searchParams.get("payment_intent");
  const redirectStatus = searchParams.get("redirect_status");

  const updateOrderMutation = trpc.order.updateOrderStatus.useMutation({
    onSuccess: () => {
      // 成功后跳转到订单列表页
      router.push("/deals");
    },
    onError: (error) => {
      console.error("Failed to update order status:", error);
      // 即使更新失败也跳转到订单列表页
      router.push("/deals");
    },
  });

  useEffect(() => {
    if (redirectStatus === "succeeded" && paymentIntent) {
      // 更新订单状态
      updateOrderMutation.mutateAsync({
        paymentIntentId: paymentIntent,
        status: OrderStatus.PAID
      });
    } else {
      // 如果状态不是成功，直接跳转
      router.push("/deals");
    }
  }, [paymentIntent, redirectStatus, router, updateOrderMutation]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Processing payment result...</h1>
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
} 