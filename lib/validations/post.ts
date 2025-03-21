import {z} from 'zod'

const imageSchema = z.object({
  imageUrl: z.string().url(),
  imageType: z.string(),
});

// 创建帖子的 schema
export const createPostSchema = z.object({
    category: z.string().min(1, 'Category is required'),
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    condition: z.string().min(1, 'Condition is required'),
    amount: z.coerce.number().min(0, 'Amount must be greater than 0'),
    isNegotiable: z.boolean().optional(),
    deliveryType: z.string().min(1, 'Delivery type is required'),
    images: z.array(imageSchema),
})

// 查询帖子的 schema
export const getPostsSchema = z.object({
    limit: z.number().min(1).max(100).optional().default(10),
    cursor: z.string().optional(),
    category: z.string().optional(),
    search: z.string().optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    sortBy: z.enum(['createdAt', 'price']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

// 获取单个帖子的 schema
export const getPostByIdSchema = z.object({
    id: z.string().uuid(),
})

export type CreatePostSchema = z.infer<typeof createPostSchema>;
export type GetPostsSchema = z.infer<typeof getPostsSchema>;
export type GetPostByIdSchema = z.infer<typeof getPostByIdSchema>;