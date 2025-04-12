import { SerializedOrder } from "@/lib/types/order";
import { useAuthStore } from "@/lib/store/auth-store";
import Image from "next/image";
import { OrderStatus } from "@/lib/types/enum";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button} from "antd-mobile";
import PaymentForm from "@/app/(detail)/order-preview/[id]/payment-form";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";


const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
  );
export default function DealsOrderCard({ order }: { order: SerializedOrder }) {
    const { loginUser } = useAuthStore();
    const router = useRouter();
    const [remainingTime, setRemainingTime] = useState<string>("");
    const [isExpired, setIsExpired] = useState(false);
    const [clientSecret, setClientSecret] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const handlePaymentSuccess = () => {
        router.push("/deals");
      };

      const handlePaymentError = (error: string) => {
        setError(error);
      };

      const handleClosePayment = () => {
        setClientSecret("");
      };
    
    
    // tRPC mutations
    const cancelExpiredOrderMutation = trpc.order.cancelExpiredOrder.useMutation({
        onSuccess: () => {
            // Toast.show({
            //     icon: 'success',
            //     content: 'Order has been cancelled'
            // });
            // 刷新订单列表
            window.location.reload();
        },
        onError: (error) => {
            console.log(error)
            // Toast.show({
            //     icon: 'fail',
            //     content: error.message || 'Failed to cancel order'
            // });
        }
    });
    
    const reenterPaymentMutation = trpc.order.reenterPayment.useMutation({
        onSuccess: (data) => {
            // 生成支付意图
            handleGeneratePaymentIntent(data.id);
        },
        onError: (error) => {
            console.log(error)
            // Toast.show({
            //     icon: 'fail',
            //     content: error.message || 'Failed to process payment'
            // });
        }
    });

    // 计算剩余时间
    useEffect(() => {
        if (order.status !== OrderStatus.PENDING_PAYMENT) {
            return;
        }

        // 避免重复尝试取消订单
        let hasTriedCancelling = false;

        const updateRemainingTime = () => {
            const now = new Date();
            // 设置30分钟倒计时（从订单创建时间开始）
            const orderCreatedAt = order.createdAt ? new Date(order.createdAt) : now;
            const deadline = new Date(orderCreatedAt.getTime() + 30 * 60000); // 30分钟 = 30 * 60 * 1000毫秒
            const diffMs = deadline.getTime() - now.getTime();
            
            if (diffMs <= 0) {
                setRemainingTime("Expired");
                setIsExpired(true);
                // 自动取消订单 - 只尝试一次
                if (order.status === OrderStatus.PENDING_PAYMENT && !hasTriedCancelling) {
                    hasTriedCancelling = true;
                    cancelExpiredOrderMutation.mutate({ orderId: order.id });
                }
                return;
            }
            
            // 计算分钟和秒
            const diffMins = Math.floor(diffMs / 60000);
            const diffSecs = Math.floor((diffMs % 60000) / 1000);
            setRemainingTime(`${diffMins}:${diffSecs < 10 ? '0' : ''}${diffSecs}`);
        };
        
        // 立即更新一次
        updateRemainingTime();
        
        // 每秒更新一次倒计时
        const interval = setInterval(updateRemainingTime, 1000);
        
        return () => clearInterval(interval);
    }, [order.status, order.id, order.createdAt]);

    if (!order.post) {
        return null;
    }

    // 根据订单状态返回对应的样式类
    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case OrderStatus.PENDING_PAYMENT:
                return "bg-yellow-100 text-yellow-800";
            case OrderStatus.PAID:
                return "bg-blue-100 text-blue-800";
            case OrderStatus.SHIPPED:
                return "bg-indigo-100 text-indigo-800";
            case OrderStatus.DELIVERED:
                return "bg-green-100 text-green-800";
            case OrderStatus.COMPLETED:
                return "bg-green-100 text-green-800";
            case OrderStatus.CANCELLED:
                return "bg-red-100 text-red-800";
            case OrderStatus.REFUNDED:
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // 处理重新支付
    const handleReenterPayment = () => {
        reenterPaymentMutation.mutate({ orderId: order.id });
    };

    // 生成支付意图
    const handleGeneratePaymentIntent = async (orderId: string) => {
        try {
            const response = await fetch("/api/payments/create-intent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ orderId }),
            });
        
            if (!response.ok) {
                const errorData = await response.text();
                console.error("Payment intent creation failed:", errorData);
                setError(JSON.stringify(errorData));
            }else{
            const { data: paymentData } = await response.json();
            setClientSecret(paymentData.clientSecret);}
        } catch (error) {
            console.error("Failed to generate payment intent:", error);
            setError("Failed to process payment."+error);
        }
    };

    return (
        <>
        {error && (
          <div className="alert alert-error">
            <p>{error}</p>
          </div>
        )}
        <div className="card bg-base-100 shadow-md mb-4">
            <div className="card-body">
                <div className="flex items-center gap-4">
                    <Image
                        src={order.post.images[0].imageUrl}
                        alt={order.post.title}
                        width={100}
                        height={100}
                    />
                    <div className="flex-1">
                        <h3 className="card-title">{order.post.title}</h3>
                        <div className="flex items-center">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status || '')}`}>
                              {order.status}
                          </div>
                          
                          {/* 显示待支付倒计时 */}
                          {order.status === OrderStatus.PENDING_PAYMENT && (
                            <div className="ml-2 text-xl font-medium">
                              {isExpired ? 'Expired' : `${remainingTime}`}
                            </div>
                          )}
                          
                          <div className="flex-1"></div>
                        </div>
                        <p className="text-xl font-bold mt-2">${order.total.toFixed(2)}</p>
                        
                        {/* 待支付状态显示重新支付按钮 */}
                        {order.status === OrderStatus.PENDING_PAYMENT && !isExpired && (
                          <div className="mt-2">
                            <Button 
                              color="primary" 
                              size="small"
                              loading={reenterPaymentMutation.isLoading}
                              onClick={handleReenterPayment}
                            >
                              Pay Now
                            </Button>
                          </div>
                        )}
                    </div>
                </div>
                <div className="divider my-2"></div>
                <div className="flex justify-between text-sm">
                    <span>
                        Order Date: {order.createdAt?.toLocaleDateString()}
                    </span>
                    <span
                        className={
                            order.buyerId === loginUser?.id
                                ? "text-primary"
                                : "text-success"
                        }
                    >
                        {order.buyerId === loginUser?.id ? "Buying" : "Selling"}
                    </span>
                </div>
            </div>
        </div>
        {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm
            amount={order.total}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onClose={handleClosePayment}
          />
        </Elements>
      )}
        </>
    );
}