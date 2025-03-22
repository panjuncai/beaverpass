import DeliveryHome from "@/components/icons/delivery-home";

export default function PostDetailMainDelivery() {
  return (
    <div className="mt-4 flex flex-col gap-1">
              <span className="font-medium text-xl">
                Home Delivery in 3 days.
              </span>
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
  );
}