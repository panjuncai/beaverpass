import { SerializedOrder } from "@/lib/types/order";
import { useAuthStore } from "@/lib/store/auth-store";
import Image from "next/image";

export default function DealsOrderCard({ order }: { order: SerializedOrder }) {
    const {loginUser} = useAuthStore();
    if (!order.post) {
        return null;
    }
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
            <div className="badge badge-outline">{order.status}</div>
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