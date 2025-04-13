import {PostStatus } from "@/lib/types/enum";

// 根据订单状态返回对应的样式类
export default function getPostStatus(status: string) {
    switch (status) {
        case PostStatus.ACTIVE:
            return "bg-blue-100 text-blue-800";
        case PostStatus.INACTIVE:
            return "bg-yellow-100 text-yellow-800";
        case PostStatus.SOLD:
            return "bg-green-100 text-green-800";
        case PostStatus.DELETED:
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};