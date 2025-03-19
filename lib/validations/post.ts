import {z} from 'zod'

export const createPostSchema = z.object({
    category: z.string().min(1, 'Category is required'),
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    condition: z.string().min(1, 'Condition is required'),
    amount: z.coerce.number().min(0, 'Amount must be greater than 0'),
    isNegotiable: z.boolean().optional(),
    deliveryType: z.string().min(1, 'Delivery type is required'),
})

export type CreatePostSchema = z.infer<typeof createPostSchema>;