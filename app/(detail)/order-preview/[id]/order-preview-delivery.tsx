import { Form } from 'antd-mobile';

export default function OrderDelivery() {
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <h2 className="card-title">Shipping Information</h2>
        <Form.Item
          name="shippingAddress"
          label="Address"
          rules={[{ required: true, message: 'Please enter shipping address' }]}
        >
          <input
            type="text"
            placeholder="Address"
            className="input input-bordered w-full"
          />
        </Form.Item>
        
        <Form.Item
          name="shippingPhone"
          label="Phone"
          rules={[{ required: true, message: 'Please enter phone number' }]}
        >
          <input
            type="text"
            placeholder="Phone"
            className="input input-bordered w-full"
          />
        </Form.Item>
        
        <Form.Item
          name="shippingReceiver"
          label="Receiver Name"
          rules={[{ required: true, message: 'Please enter receiver name' }]}
        >
          <input
            type="text"
            placeholder="Receiver Name"
            className="input input-bordered w-full"
          />
        </Form.Item>
      </div>
    </div>
  );
}