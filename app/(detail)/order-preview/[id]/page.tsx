"use client";
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
import { Radio } from "antd-mobile";
import { DeliveryType } from "@/lib/types/enum";
import { UserOutline } from "antd-mobile-icons";
import DeliveryHome from "@/components/icons/delivery-home";
import AddressModal from "@/components/modals/address-modal";

// 替换为您的 Stripe 公钥
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
);

export default function OrderPage() {
  const previewPost = usePostStore((state) => state.previewPost);
  const [clientSecret, setClientSecret] = useState<string>("");
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm<CreateOrderInput>();

  const [selectedDelivery, setSelectedDelivery] = useState<string | number>(
    DeliveryType.PICKUP
  );
  const { loginUser } = useAuthStore();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [address, setAddress] = useState<string | undefined>(
    loginUser?.user_metadata?.address
  );
  const [deliveryFee, setDeliveryFee] = useState<number>(
    previewPost?.deliveryType === "BOTH" ? 10 : 0
  );

  // 添加一个useEffect来在配送方式改变时重新计算费用
  useEffect(() => {
    // 当选择HOME_DELIVERY时更新配送费
    if (selectedDelivery === DeliveryType.HOME_DELIVERY) {
      setDeliveryFee(50);
    } else {
      setDeliveryFee(previewPost?.deliveryType === "BOTH" ? 10 : 0);
    }
  }, [selectedDelivery, previewPost]);

  useEffect(() => {
    setAddress(loginUser?.user_metadata?.address);
  }, [loginUser]);

  const handleDeliveryChange = (value: string | number) => {
    setSelectedDelivery(value);
    // 更新表单中的值
    // if (form) {
    //   form.setFieldsValue({ delivery: value });
    // }
  };

  const showAddressModal = () => {
    setIsAddressModalOpen(true);
  };

  const handleAddressSelect = (selectedAddress: string) => {
    setAddress(selectedAddress);
    setIsAddressModalOpen(false);

    // 如果表单存在，更新地址字段
    if (form) {
      form.setFieldsValue({ shippingAddress: selectedAddress });
    }
  };

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
    deliveryFee: deliveryFee,
    serviceFee: previewPost.isNegotiable ? 10 : 0,
    tax: (Number(previewPost.amount) || 0) * 0.13,
    paymentFee:
      ((Number(previewPost.amount) || 0) +
        deliveryFee +
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
        shippingAddress: loginUser.user_metadata.address,
        shippingReceiver: loginUser.user_metadata.firstName + " " + loginUser.user_metadata.lastName,
        shippingPhone: loginUser.user_metadata.phone,
        total: fees.total,
        deliveryFee: deliveryFee,
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
        setError(JSON.stringify(errorData));
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
        className="p-4 space-y-2 pb-24"
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


<>
      <div className="card bg-base-100">
        <div className="card-body p-5">
          <h2 className="card-title mb-2">How would you like to receive it?</h2>
          <span className="text-sm text-gray-500 mb-4">
            Shipping has a cost that will be added to the price of the product.
          </span>
          <Form.Item name="delivery" label="" required>
            <Radio.Group
              value={selectedDelivery}
              onChange={handleDeliveryChange}
            >
              <div className="space-y-3">
                {/* In person option */}
                <label
                  className={`flex items-center justify-between rounded-xl p-4 cursor-pointer transition-all border ${
                    selectedDelivery === DeliveryType.PICKUP
                      ? "bg-white border-slate-300 shadow-sm"
                      : "bg-gray-50 border-transparent"
                  }`}
                  onClick={() => handleDeliveryChange(DeliveryType.PICKUP)}
                >
                  <div className="flex items-center gap-3">

                      <UserOutline fontSize={24} />
                    <div>
                      <p className="font-medium">In person</p>
                      <p className="text-sm text-gray-500">
                        Meet the seller and pick up by yourself.
                      </p>
                    </div>
                  </div>
                  <Radio
                    value={DeliveryType.PICKUP}
                    className="adm-radio"
                    defaultChecked={true}
                  />
                </label>

                {/* Home delivery option */}
                <label
                  className={`flex items-center justify-between rounded-xl p-4 cursor-pointer transition-all border ${
                    selectedDelivery === DeliveryType.HOME_DELIVERY
                      ? "bg-white border-slate-300 shadow-sm"
                      : "bg-gray-50 border-transparent"
                  }`}
                  onClick={() =>
                    handleDeliveryChange(DeliveryType.HOME_DELIVERY)
                  }
                >
                  <div className="flex items-center gap-3">
                    <DeliveryHome />
                    <div>
                      <p className="font-medium">Send to my address for $50</p>
                      <p className="text-sm text-gray-500">
                        1 to 3 days delivery.
                      </p>
                    </div>
                  </div>
                  <Radio
                    value={DeliveryType.HOME_DELIVERY}
                    className="adm-radio"
                    checked={selectedDelivery === DeliveryType.HOME_DELIVERY}
                  />
                </label>
              </div>
            </Radio.Group>

            {selectedDelivery === DeliveryType.HOME_DELIVERY && (
              <>
                <div className="mt-3 bg-gray-30 rounded-xl">
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-amber-900 flex items-center justify-center flex-shrink-0">
                      <svg
                        width="13"
                        height="12"
                        viewBox="0 0 13 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.52564 0.125C9.80496 0.125 12.4631 2.3075 12.4631 5C12.4631 7.06 10.7002 9.305 7.21987 11.759C7.02635 11.8955 6.77961 11.9705 6.5245 11.9703C6.26938 11.9701 6.0228 11.8948 5.82958 11.758L5.59939 11.594C2.27317 9.204 0.588135 7.014 0.588135 5C0.588135 2.3075 3.24631 0.125 6.52564 0.125ZM6.52564 3.125C5.91997 3.125 5.33912 3.32254 4.91085 3.67417C4.48258 4.02581 4.24198 4.50272 4.24198 5C4.24198 5.49728 4.48258 5.97419 4.91085 6.32583C5.33912 6.67746 5.91997 6.875 6.52564 6.875C7.1313 6.875 7.71215 6.67746 8.14042 6.32583C8.56869 5.97419 8.80929 5.49728 8.80929 5C8.80929 4.50272 8.56869 4.02581 8.14042 3.67417C7.71215 3.32254 7.1313 3.125 6.52564 3.125Z"
                          fill="white"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-yellow-950">
                        Home
                      </p>
                      {address ? (
                        <div className="text-sm text-gray-700 mt-1">
                          {address}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 mt-1">
                          No address set
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        showAddressModal();
                      }}
                      className="flex-shrink-0 text-gray-400"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M13.75 4.375L16.25 6.875M14.7656 3.35938C15.2188 2.90625 15.8594 2.90625 16.3125 3.35938L17.2656 4.3125C17.7188 4.76562 17.7188 5.40625 17.2656 5.85938L5.9375 17.1875H2.5V13.75L13.8281 2.42188C14.0781 2.17188 14.4219 3.35938 14.7656 3.35938ZM2.5 17.5H17.5"
                          stroke="#9CA3AF"
                          strokeWidth="1.25"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </Form.Item>
          <Form.Item name="shippingAddress" hidden initialValue={address} />
        </div>
      </div>

      <div className="card bg-base-100">
      <div className="card-body">
        <h2 className="card-title">Order Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Price:</span>
            <span>${fees.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee:</span>
            <span>${fees.deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Service Fee:</span>
            <span>${fees.serviceFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (HST 13%):</span>
            <span>${fees.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Processing Fee:</span>
            <span>${fees.paymentFee.toFixed(2)}</span>
          </div>
          <div className="divider"></div>
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>${fees.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
      {/* 地址选择模态框 */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSelect={handleAddressSelect}
        initialAddress={address}
        showSaveButton={true}
      />
    </>



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
