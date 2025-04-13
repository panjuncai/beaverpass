import { OrderStatus } from "@/lib/types/enum";

// 根据订单状态返回对应的样式类
export default function getOrderStatus(status: string) {
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