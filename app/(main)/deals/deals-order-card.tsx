import { SerializedOrder } from "@/lib/types/order";
import { useAuthStore } from "@/lib/store/auth-store";
import Image from "next/image";
import { OrderStatus } from "@/lib/types/enum";

export default function DealsOrderCard({ order }: { order: SerializedOrder }) {
    const {loginUser} = useAuthStore();
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

    return (
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
                        <div className="flex">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status || '')}`}>
                              {order.status}
                          </div>
                        <div className="flex-1"></div>
                        </div>
                        <p className="text-xl font-bold mt-2">${order.total.toFixed(2)}</p>
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
    );
}