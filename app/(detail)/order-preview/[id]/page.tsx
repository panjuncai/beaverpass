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
import { Modal } from "antd-mobile";
import { PaymentMethod } from "@/lib/types/enum";

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
  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    phone: "",
    receiver: "",
  });

  const createOrderMutation = trpc.order.createOrder.useMutation();

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

  const handleCreateOrder = async () => {
    if (!loginUser?.id) {
      dialogRef.current?.showModal();
      return;
    }

    if (!previewPost) {
      Modal.show({
        content: "Post not found",
        closeOnMaskClick: true,
      });
      return;
    }

    if (
      !shippingInfo.address ||
      !shippingInfo.phone ||
      !shippingInfo.receiver
    ) {
      Modal.show({
        content: "Please fill in all shipping information",
        closeOnMaskClick: true,
      });
      return;
    }

    try {
      // 创建订单
      const order = await createOrderMutation.mutateAsync({
        postId: previewPost.id,
        sellerId: previewPost.posterId!,
        total: fees.total,
        deliveryFee: fees.deliveryFee,
        serviceFee: fees.serviceFee,
        tax: fees.tax,
        paymentFee: fees.paymentFee,
        shippingAddress: shippingInfo.address,
        shippingPhone: shippingInfo.phone,
        shippingReceiver: shippingInfo.receiver,
        paymentMethod: PaymentMethod.STRIPE,
      });

      // 创建支付意向
      const { data } = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId: order.id }),
      }).then((res) => res.json());

      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error("Error creating order:", error);
      Modal.show({
        content: "Failed to create order",
        closeOnMaskClick: true,
      });
    }
  };

  const handlePaymentSuccess = () => {
    Modal.show({
      content: "Payment successful!",
      closeOnMaskClick: true,
    });
    router.push("/deals");
  };

  const handlePaymentError = (error: string) => {
    Modal.show({
      content: error,
      closeOnMaskClick: true,
    });
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
      <div className="p-4 space-y-6">
        <OrderPostDetail post={previewPost} />
        <OrderDelivery
          shippingInfo={shippingInfo}
          setShippingInfo={setShippingInfo}
        />
        <OrderFeedetail fees={fees} />
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
        <div className="h-20"></div>
      </div>
      <div className="fixed bottom-4 left-0 right-0 flex justify-center">
          <button
            className="btn btn-primary btn-xl w-4/5 rounded-full shadow-md"
            onClick={() => void handleCreateOrder()}
            disabled={createOrderMutation.isLoading}
          >
            {createOrderMutation.isLoading ? "Processing..." : "Confirm Order"}
          </button>
        </div>
    </>
  );
}
