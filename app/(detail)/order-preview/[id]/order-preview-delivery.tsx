export default function OrderPreviewDelivery() {
  return (
    <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Shipping Information</h2>
            <input
              type="text"
              placeholder="Address"
              className="input input-bordered w-full"
            //   value={shippingInfo.address}
            //   onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Phone"
              className="input input-bordered w-full"
            //   value={shippingInfo.phone}
            //   onChange={(e) => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
        </div>
  )
}