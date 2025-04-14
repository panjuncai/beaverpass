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
import { Avatar, Button, Form } from "antd-mobile";
import { Radio } from "antd-mobile";
import { DeliveryType } from "@/lib/types/enum";
import { LocationFill, UserOutline } from "antd-mobile-icons";
import DeliveryHome from "@/components/icons/delivery-home";
import AddressModal from "@/components/modals/address-modal";
import { createClient } from "@/utils/supabase/client";

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

  // 根据预览商品的配送类型设置初始配送方式
  const [selectedDelivery, setSelectedDelivery] = useState<keyof typeof DeliveryType>(
    previewPost?.deliveryType === "HOME_DELIVERY"
      ? DeliveryType.HOME_DELIVERY
      : DeliveryType.PICKUP
  );

  const { loginUser, setLoginUser, setSession } = useAuthStore();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [address, setAddress] = useState<string | undefined>(
    loginUser?.user_metadata?.address
  );
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [isRefreshingAuth, setIsRefreshingAuth] = useState(false);

  // 初始化时根据预览商品和选择的配送方式设置配送费
  useEffect(() => {
    if (!previewPost) return;

    if (selectedDelivery === DeliveryType.HOME_DELIVERY) {
      setDeliveryFee(50);
    } else {
      setDeliveryFee(0);
    }
  }, [selectedDelivery, previewPost]);

  useEffect(() => {
    setAddress(loginUser?.user_metadata?.address);
  }, [loginUser]);

  // 处理配送方式变更
  const handleDeliveryChange = (value: keyof typeof DeliveryType) => {
    // 如果商品只支持配送，则不允许更改配送方式
    if (previewPost?.deliveryType === "HOME_DELIVERY") {
      return;
    }
    // console.log("🌻🌻🌻value", value);
    setSelectedDelivery(value);
  };

  // 监听selectedDelivery变化，如果选择配送方式需要更新地址
  useEffect(() => {
    if (selectedDelivery === DeliveryType.HOME_DELIVERY && address) {
      form.setFieldsValue({ shippingAddress: address });
    }
  }, [selectedDelivery, address, form]);

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

  // 初始加载时刷新用户登录状态
  useEffect(() => {
    const refreshAuth = async () => {
      try {
        setIsRefreshingAuth(true);
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error refreshing auth:", error);
          return;
        }
        
        if (session) {
          setSession(session);
          setLoginUser(session.user);
        }
      } catch (err) {
        console.error("Failed to refresh auth:", err);
      } finally {
        setIsRefreshingAuth(false);
      }
    };
    
    void refreshAuth();
  }, [setLoginUser, setSession]);

  if (!previewPost) {
    return null;
  }

  const fees = {
    amount: Number(previewPost.amount) || 0,
    deliveryFee: deliveryFee,
    serviceFee:
      Number(previewPost.amount) * 0.1 < 1
        ? 1
        : Number(previewPost.amount) * 0.1,
    tax:
      (Number(previewPost.amount) || 0 + Number(previewPost.amount) * 0.1 < 1
        ? 1
        : Number(previewPost.amount) * 0.1) * 0.13,
    paymentFee:
      ((Number(previewPost.amount) || 0) +
        deliveryFee +
        (Number(previewPost.amount) * 0.1 < 1
          ? 1
          : Number(previewPost.amount) * 0.1)) *
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
    // 检查登录状态
    if (!loginUser?.id) {
      try {
        // 尝试刷新session
        setIsRefreshingAuth(true);
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          // 仍未登录，显示登录对话框
          dialogRef.current?.showModal();
          return;
        }
        
        // 更新认证状态
        setSession(session);
        setLoginUser(session.user);
      } catch (err) {
        console.error("Failed to refresh auth:", err);
        dialogRef.current?.showModal();
        return;
      } finally {
        setIsRefreshingAuth(false);
      }
    }
    
    // 再次检查登录状态，以防刷新失败
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
        shippingReceiver:
          loginUser.user_metadata.firstName +
          " " +
          loginUser.user_metadata.lastName,
        shippingPhone: loginUser.user_metadata.phone,
        total: fees.total,
        deliveryFee: deliveryFee,
        serviceFee: fees.serviceFee,
        tax: fees.tax,
        paymentFee: fees.paymentFee,
        paymentMethod: PaymentMethod.STRIPE,
        deliveryType: DeliveryType[selectedDelivery],
      };

      console.log("Submitting order with data:", orderData);
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
        return;
      }

      const { data: paymentData } = await response.json();
      setClientSecret(paymentData.clientSecret);
      console.log("Payment intent created successfully, clientSecret set");
    } catch (error) {
      console.error("Error creating order:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create order"
      );
    }
  };

  // const handlePaymentSuccess = () => {
  //   console.log("🌻🌻🌻payment success - this will not be called due to redirect");
  //   // 成功后会由Stripe直接重定向到return_url，不会执行这个函数
  // };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  const handleClosePayment = () => {
    setClientSecret("");
  };

  return (
    <>
      <MessageModal
        title="Login Required"
        content="Your session may have expired. Please login again to continue with your purchase."
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
              loading={createOrderMutation.isLoading || isRefreshingAuth}
              disabled={createOrderMutation.isLoading || isRefreshingAuth}
              shape='rounded'
            >
              {createOrderMutation.isLoading || isRefreshingAuth
                ? "Processing..."
                : "Confirm Order"}
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
          {/* part 1 */}
          <div className="card bg-base-100">
            <div className="card-body p-5">
              <h2 className="card-title mb-2">
                How would you like to receive it?
              </h2>
              <span className="text-sm text-gray-500 mb-4">
                Shipping has a cost that will be added to the price of the
                product.
              </span>
              <Form.Item label="" required>
                <Radio.Group
                  value={selectedDelivery}
                  onChange={(val) => handleDeliveryChange(val as keyof typeof DeliveryType)}
                >
                  <div className="space-y-3">
                    {/* In person option - 只在配送类型为PICKUP或BOTH时显示 */}
                    {(previewPost.deliveryType === DeliveryType.PICKUP ||
                      previewPost.deliveryType === DeliveryType.BOTH) && (
                      <label
                        className={`flex items-center justify-between rounded-xl p-4 cursor-pointer transition-all border ${
                          selectedDelivery === DeliveryType.PICKUP
                            ? "bg-white border-slate-300 shadow-sm"
                            : "bg-gray-50 border-transparent"
                        }`}
                        onClick={() =>
                          handleDeliveryChange(DeliveryType.PICKUP)
                        }
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
                        />
                      </label>
                    )}

                    {/* Home delivery option - 只在配送类型为HOME_DELIVERY或BOTH时显示 */}
                    {(previewPost.deliveryType === DeliveryType.HOME_DELIVERY ||
                      previewPost.deliveryType === DeliveryType.BOTH) && (
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
                            <p className="font-medium">
                              Send to my address for $50
                            </p>
                            <p className="text-sm text-gray-500">
                              1 to 3 days delivery.
                            </p>
                          </div>
                        </div>
                        <Radio
                          value={DeliveryType.HOME_DELIVERY}
                          className="adm-radio"
                        />
                      </label>
                    )}
                  </div>
                </Radio.Group>

                {selectedDelivery === DeliveryType.HOME_DELIVERY && (
                  <>
                    <div className="mt-3 bg-gray-30 rounded-xl">
                      <div className="flex gap-1">
                        <LocationFill
                          fontSize={24}
                          color="var(--adm-color-primary)"
                        />
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
              <Form.Item hidden initialValue={address} />
              <Form.Item hidden name="deliveryType" initialValue={selectedDelivery} />
            </div>
          </div>

          {/* part2  */}
          <div className="card bg-base-100">
            <div className="card-body flex-row">
              <Avatar
                src={previewPost?.images[0].imageUrl || "1"}
                style={{ "--size": "64px" }}
              />
              <div className="flex-1 flex flex-col">
                <div className="flex gap-2 items-center">
                  <span className="text-lg font-bold">{previewPost?.title}</span>
                </div>
                <div className="text-sx text-gray-700"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{previewPost?.description}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* part 3 */}
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
            email={loginUser?.email || ""}
            amount={fees.total}
            onError={handlePaymentError}
            onClose={handleClosePayment}
          />
        </Elements>
      )}
    </>
  );
}
