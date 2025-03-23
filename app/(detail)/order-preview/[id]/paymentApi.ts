import { createApiWithBaseUrl } from './api';

interface CreatePaymentIntentRequest {
  orderId: string;
}

interface PaymentIntentResponse {
  clientSecret: string;
}

export const paymentApi = createApiWithBaseUrl('/payments', 'paymentApi').injectEndpoints({
  endpoints: (builder) => ({
    createPaymentIntent: builder.mutation<PaymentIntentResponse, CreatePaymentIntentRequest>({
      query: (data) => ({
        url: '/create-payment-intent',
        method: 'POST',
        data,
      }),
    }),
  }),
});

export const { useCreatePaymentIntentMutation } = paymentApi; 