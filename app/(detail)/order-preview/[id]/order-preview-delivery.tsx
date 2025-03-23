import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { CreateOrderInput } from '@/lib/validations/order';

interface OrderDeliveryProps {
  register: UseFormRegister<CreateOrderInput>;
  errors: FieldErrors<CreateOrderInput>;
}

export default function OrderDelivery({ register, errors }: OrderDeliveryProps) {
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <h2 className="card-title">Shipping Information</h2>
        <input
          type="text"
          placeholder="Address"
          className="input input-bordered w-full"
          {...register("shippingAddress")}
        />
        {errors.shippingAddress && (
          <p className="text-red-500 text-sm mt-1">{errors.shippingAddress.message}</p>
        )}
        
        <input
          type="text"
          placeholder="Phone"
          className="input input-bordered w-full"
          {...register("shippingPhone")}
        />
        {errors.shippingPhone && (
          <p className="text-red-500 text-sm mt-1">{errors.shippingPhone.message}</p>
        )}
        
        <input
          type="text"
          placeholder="Receiver Name"
          className="input input-bordered w-full"
          {...register("shippingReceiver")}
        />
        {errors.shippingReceiver && (
          <p className="text-red-500 text-sm mt-1">{errors.shippingReceiver.message}</p>
        )}
      </div>
    </div>
  );
}