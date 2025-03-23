import { Dispatch, SetStateAction } from 'react';

interface ShippingInfo {
  address: string;
  phone: string;
  receiver: string;
}

interface OrderDeliveryProps {
  shippingInfo: ShippingInfo;
  setShippingInfo: Dispatch<SetStateAction<ShippingInfo>>;
}

export default function OrderDelivery({ shippingInfo, setShippingInfo }: OrderDeliveryProps) {
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <h2 className="card-title">Shipping Information</h2>
        <input
          type="text"
          placeholder="Address"
          className="input input-bordered w-full"
          value={shippingInfo.address}
          onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
        />
        <input
          type="text"
          placeholder="Phone"
          className="input input-bordered w-full"
          value={shippingInfo.phone}
          onChange={(e) => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))}
        />
        <input
          type="text"
          placeholder="Receiver Name"
          className="input input-bordered w-full"
          value={shippingInfo.receiver}
          onChange={(e) => setShippingInfo(prev => ({ ...prev, receiver: e.target.value }))}
        />
      </div>
    </div>
  );
}