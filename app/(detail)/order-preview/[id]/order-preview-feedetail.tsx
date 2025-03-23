import { DeliveryType } from "@/lib/types/enum";
import { SerializedPost } from "@/lib/types/post";

export default function OrderPreviewFeedetail({ post }: { post: SerializedPost }) {
    const calculateFees = () => {
        const baseAmount = Number(post?.amount || 0);
        const deliveryFee = post?.deliveryType === DeliveryType.BOTH ? 10 : 0;
        const serviceFee = post?.isNegotiable ? 10 : 0;
        const tax = baseAmount * 0.13;
        const paymentFee = (baseAmount + deliveryFee + serviceFee + tax) * 0.029 + 0.30;
        const total = baseAmount + deliveryFee + serviceFee + tax + paymentFee;
    
        return {
          amount: baseAmount,
          deliveryFee,
          serviceFee,
          tax,
          paymentFee,
          total
        };
      };
    
  return (
    <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Price:</span>
                {/* <span>${fees.amount.toFixed(2)}</span> */}
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee:</span>
                {/* <span>${fees.deliveryFee.toFixed(2)}</span> */}
              </div>
              <div className="flex justify-between">
                <span>Service Fee:</span>
                {/* <span>${fees.serviceFee.toFixed(2)}</span> */}
              </div>
              <div className="flex justify-between">
                <span>Tax (HST 13%):</span>
                {/* <span>${fees.tax.toFixed(2)}</span> */}
              </div>
              <div className="flex justify-between">
                <span>Payment Processing Fee:</span>
                {/* <span>${fees.paymentFee.toFixed(2)}</span> */}
              </div>
              <div className="divider"></div>
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                {/* <span>${fees.total.toFixed(2)}</span> */}
              </div>
            </div>
          </div>
        </div>
  )
}