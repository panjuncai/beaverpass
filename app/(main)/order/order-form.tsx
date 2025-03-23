'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOrderSchema, type CreateOrderInput } from '@/lib/validations/order';
import { trpc } from '@/lib/trpc/client';
import { useRouter } from 'next/navigation';
import Loading from '@/components/utils/loading';
import { PaymentMethod } from '@/lib/types/enum';

interface OrderFormProps {
  postId: string;
  sellerId: string;
  total: number;
}

export function OrderForm({ postId, sellerId, total }: OrderFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      postId,
      sellerId,
      total,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      status: 'PENDING_PAYMENT',
      paymentFee: 0,
      deliveryFee: 0,
      serviceFee: 0,
      tax: 0,
    },
  });

  const createOrderMutation = trpc.order.createOrder.useMutation({
    onSuccess: () => {
      router.push('/deals');
      router.refresh();
    },
    onError: (error) => {
      setError(error.message);
      setIsLoading(false);
    },
  });

  const onSubmit = async (data: CreateOrderInput) => {
    setIsLoading(true);
    setError(null);
    try {
      await createOrderMutation.mutateAsync(data);
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">创建订单</h2>
      
      {error && (
        <div className="p-3 mb-4 text-sm text-red-500 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 收货地址 */}
        <div>
          <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700">
            收货地址
          </label>
          <input
            type="text"
            id="shippingAddress"
            {...register('shippingAddress')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          {errors.shippingAddress && (
            <p className="mt-1 text-sm text-red-500">{errors.shippingAddress.message}</p>
          )}
        </div>

        {/* 收货人 */}
        <div>
          <label htmlFor="shippingReceiver" className="block text-sm font-medium text-gray-700">
            收货人
          </label>
          <input
            type="text"
            id="shippingReceiver"
            {...register('shippingReceiver')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          {errors.shippingReceiver && (
            <p className="mt-1 text-sm text-red-500">{errors.shippingReceiver.message}</p>
          )}
        </div>

        {/* 联系电话 */}
        <div>
          <label htmlFor="shippingPhone" className="block text-sm font-medium text-gray-700">
            联系电话
          </label>
          <input
            type="tel"
            id="shippingPhone"
            {...register('shippingPhone')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          {errors.shippingPhone && (
            <p className="mt-1 text-sm text-red-500">{errors.shippingPhone.message}</p>
          )}
        </div>

        {/* 支付方式 */}
        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
            支付方式
          </label>
          <select
            id="paymentMethod"
            {...register('paymentMethod')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            {Object.entries(PaymentMethod).map(([key, value]) => (
              <option key={key} value={value}>
                {key.replace('_', ' ')}
              </option>
            ))}
          </select>
          {errors.paymentMethod && (
            <p className="mt-1 text-sm text-red-500">{errors.paymentMethod.message}</p>
          )}
        </div>

        {/* 订单金额信息 */}
        <div className="border-t pt-4 mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">商品总价</span>
            <span className="font-medium">${total}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">配送费</span>
            <span className="font-medium">${0}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">服务费</span>
            <span className="font-medium">${0}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">税费</span>
            <span className="font-medium">${0}</span>
          </div>
          <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
            <span>总计</span>
            <span>${total}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn btn-primary"
        >
          {isLoading ? '提交中...' : '提交订单'}
        </button>
      </form>
    </div>
  );
}
