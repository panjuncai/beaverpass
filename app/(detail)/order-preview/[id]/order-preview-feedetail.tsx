interface OrderFees {
  total: number;
  deliveryFee: number;
  serviceFee: number;
  tax: number;
  paymentFee: number;
  amount: number;
}

interface OrderFeedetailProps {
  fees: OrderFees;
}

export default function OrderFeedetail({ fees }: OrderFeedetailProps) {
  return (
    <div className="card bg-base-100 shadow">
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
  );
}