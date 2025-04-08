import { z } from 'zod'
import type { PostQueryParams } from '@/lib/types/post'
import { PostStatus } from '../types/enum';

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
    amount: z.coerce.number().min(0, 'Amount must be greater than 0').or(z.string().min(1, 'Amount is required')),
    isNegotiable: z.boolean().optional(),
    deliveryType: z.string().min(1, 'Delivery type is required'),
    images: z.array(imageSchema),
})

// 更新帖子的 schema
export const updatePostSchema = z.object({
    id: z.string().uuid(),
    status: z.enum([PostStatus.ACTIVE, PostStatus.INACTIVE, PostStatus.SOLD, PostStatus.DELETED]),
})

// 查询帖子的 schema
export const getPostsSchema = z.object({
    limit: z.number().min(1).max(100).optional().default(10),
    cursor: z.string().optional(),
    posterId: z.string().optional(),
    category: z.string().optional(),
    search: z.string().optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    status: z.nativeEnum(PostStatus).optional(),
    sortBy: z.enum(['createdAt', 'amount']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
}) satisfies z.ZodType<PostQueryParams>

// 获取单个帖子的 schema
export const getPostByIdSchema = z.object({
    id: z.string().uuid(),
})

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type GetPostByIdInput = z.infer<typeof getPostByIdSchema>;
export type GetPostsInput = z.infer<typeof getPostsSchema>;