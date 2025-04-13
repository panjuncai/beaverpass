import DeliveryHome from "@/components/icons/delivery-home";
import { SerializedPost } from "@/lib/types/post";
import { DeliveryType } from "@/lib/types/enum";

export default function PostDetailMainDelivery({
  post,
}: {
  post: SerializedPost | null;
}) {
  return (
    <>
      {post?.deliveryType === DeliveryType.HOME_DELIVERY && (
        <div className="mt-4 flex flex-col gap-1">
          <span className="font-medium text-xl">Home Delivery in 3 days.</span>
      <div className="flex items-center gap-2">
        <DeliveryHome />
        <div className="flex flex-col">
          <span className="text-sm text-gray-600">
            Send to my address <strong>from $50</strong>
          </span>
          <span className="text-sm font-bold">Baseline, Ottawa</span>
            </div>
          </div>
        </div>
      )}
      {post?.deliveryType === DeliveryType.PICKUP && (
        <div className="mt-4 flex flex-col gap-1">
          <span className="font-medium text-xl">Pickup in 3 days.</span>
        </div>
      )}
      {post?.deliveryType === DeliveryType.BOTH && (
        <div className="mt-4 flex flex-col gap-1">
          <span className="font-medium text-xl">Both Delivery in 3 days.</span>
        </div>
      )}
    </>
  );
}
