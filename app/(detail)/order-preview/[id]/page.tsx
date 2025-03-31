"use client";
import OrderPostDetail from "./order-preview-postdetail";
import OrderFeedetail from "./order-preview-feedetail";
import OrderDelivery from "./order-preview-delivery";
import { usePostStore } from "@/lib/store/post-store";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import PaymentForm from "./payment-form";
import MessageModal from "@/components/modals/message-modal";
import { useAuthStore } from "@/lib/store/auth-store";
import { trpc } from "@/lib/trpc/client";
import { CreateOrderInput } from "@/lib/validations/order";
import { PaymentMethod } from "@/lib/types/enum";
import { Button, Form } from 'antd-mobile';

// 替换为您的 Stripe 公钥
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
);

export default function OrderPage() {
  const { loginUser } = useAuthStore();
  const previewPost = usePostStore((state) => state.previewPost);
  const [clientSecret, setClientSecret] = useState<string>("");
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm<CreateOrderInput>();

  const createOrderMutation = trpc.order.createOrder.useMutation({
    onError: (error) => {
      setError(error.message);
    },
  });

  useEffect(() => {
    if (!previewPost) {
      router.push("/search");
    }
  }, [previewPost, router]);

  if (!previewPost) {
    return null;
  }

  const fees = {
    amount: Number(previewPost.amount) || 0,
    deliveryFee: previewPost.deliveryType === "BOTH" ? 10 : 0,
    serviceFee: previewPost.isNegotiable ? 10 : 0,
    tax: (Number(previewPost.amount) || 0) * 0.13,
    paymentFee:
      ((Number(previewPost.amount) || 0) +
        (previewPost.deliveryType === "BOTH" ? 10 : 0) +
        (previewPost.isNegotiable ? 10 : 0)) *
        0.029 +
      0.3,
    total: 0,
  };

  fees.total =
    fees.amount +
    fees.deliveryFee +
    fees.serviceFee +
    fees.tax +
    fees.paymentFee;

  const onSubmit = async (values: CreateOrderInput) => {
    if (!loginUser?.id) {
      dialogRef.current?.showModal();
      return;
    }

    if (!previewPost || !previewPost.posterId) {
      setError("Invalid post data");
      return;
    }

    try {
      setError(null);
      // 构建完整的订单数据
      const orderData = {
        ...values,
        postId: previewPost.id,
        sellerId: previewPost.posterId,
        total: fees.total,
        deliveryFee: fees.deliveryFee,
        serviceFee: fees.serviceFee,
        tax: fees.tax,
        paymentFee: fees.paymentFee,
        paymentMethod: PaymentMethod.STRIPE,
      };
      
      console.log('Submitting order with data:', orderData);
      const order = await createOrderMutation.mutateAsync(orderData);

      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId: order.id }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Payment intent creation failed:", errorData);
        throw new Error("Failed to create payment intent");
      }

      const { data: paymentData } = await response.json();
      setClientSecret(paymentData.clientSecret);
    } catch (error) {
      console.error("Error creating order:", error);
      setError(error instanceof Error ? error.message : "Failed to create order");
    }
  };

  const handlePaymentSuccess = () => {
    router.push("/deals");
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  const handleClosePayment = () => {
    setClientSecret("");
  };

  return (
    <>
      <MessageModal
        title="Please login first"
        content="You need to login to buy the product"
        dialogRef={dialogRef}
        redirectUrl="/login"
      />
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        className="p-4 space-y-6 pb-24"
        footer={
          <div className="fixed bottom-4 left-0 right-0 px-4">
            <Button
              block
              color="primary"
              size="large"
              type="submit"
              loading={createOrderMutation.isLoading}
              disabled={createOrderMutation.isLoading}
              className="rounded-full"
            >
              {createOrderMutation.isLoading ? "Processing..." : "Confirm Order"}
            </Button>
          </div>
        }
      >
        {error && (
          <div className="alert alert-error">
            <p>{error}</p>
          </div>
        )}
        <OrderPostDetail post={previewPost} />
        <OrderDelivery />
        <OrderFeedetail fees={fees} />
        <div className="h-20"></div>
      </Form>
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm
            amount={fees.total}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onClose={handleClosePayment}
          />
        </Elements>
      )}
    </>
  );
}
