import { z } from 'zod'

export const createPaymentIntentSchema = z.object({
  orderId: z.string(),
  total:z.number()
})

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>

export const paymentIntentResponseSchema = z.object({
  clientSecret: z.string(),
})

export type PaymentIntentResponse = z.infer<typeof paymentIntentResponseSchema> 