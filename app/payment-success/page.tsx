"use client";

import { useEffect, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { OrderStatus } from "@/lib/types/enum";
import { Toast } from 'antd-mobile';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentIntent = searchParams.get("payment_intent");
  const redirectStatus = searchParams.get("redirect_status");
  const [isProcessing, setIsProcessing] = useState(true);

  const updateOrderMutation = trpc.order.updateOrderStatus.useMutation({
    onSuccess: () => {
      setIsProcessing(false);
      Toast.show({
        icon: 'success',
        content: 'Payment successful!',
      });
      // 成功后跳转到订单列表页
      router.push("/deals");
    },
    onError: (error) => {
      setIsProcessing(false);
      console.error("Failed to update order status:", error);
      // Toast.show({
      //   icon: 'fail',
      //   content: 'Failed to update order status. Please contact support.',
      // });
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
      }).catch(error => {
        console.error("Error updating order status:", error);
      });
    } else {
      // 如果状态不是成功，直接跳转
      setIsProcessing(false);
      router.push("/deals");
    }
  }, [paymentIntent, redirectStatus, router, updateOrderMutation]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          {isProcessing ? "Processing payment result..." : "Redirecting..."}
        </h1>
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