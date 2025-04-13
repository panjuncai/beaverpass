import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "..";
import { createPostSchema, getPostByIdSchema, getPostsSchema, updatePostSchema } from "@/lib/validations/post";
import { z } from 'zod';
import { PostStatus, OrderStatus } from '@/lib/types/enum';

// interface User {
//   id: string;
//   email: string;
//   firstName: string | null;
//   lastName: string | null;
//   avatar: string | null;
//   phone: string | null;
//   address: string | null;
// }

export const postRouter = router({
  // 获取单个帖子
  getPostById: publicProcedure
    .input(getPostByIdSchema)
    .query(async ({ input, ctx }) => {
      try {        
        const post = await ctx.prisma.post.findUnique({
          where: { id: input.id },
          include: {
            images: true,
            poster: true,
            orders: true
          },
        });
        
        if (!post) {
          console.error('🙀🙀🙀Post not found');
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Post not found',
          });
        }
        
        // 格式化返回数据，包含最新的order
        const orderTmp = post.orders.filter(order => 
          order.status === OrderStatus.PAID || 
          order.status === OrderStatus.COMPLETED || 
          order.status === OrderStatus.SHIPPED || 
          order.status === OrderStatus.DELIVERED
        )[0];

        const formattedPost = {
          ...post,
          order: orderTmp ? {
            id: orderTmp.id,
            shipping_address: orderTmp.shippingAddress,
            shipping_receiver: orderTmp.shippingReceiver,
            shipping_phone: orderTmp.shippingPhone,
            total: orderTmp.total ? Number(orderTmp.total) : null,
            delivery_type: orderTmp.deliveryType,
            status: orderTmp.status || '',
            createdAt: orderTmp.createdAt
          } : null
        };
        
        return formattedPost;
      } catch (error) {
        console.error('🙀🙀🙀Failed to get post:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to get post",
        });
      }
    }),
  // 获取帖子列表
  getPosts: publicProcedure
    .input(getPostsSchema)
    .query(async ({ input, ctx }) => {
      try {
        // 构建查询条件
        const where = {
          ...(input.posterId && { posterId: input.posterId }),
          ...(input.category && { category: input.category }),
          ...(input.status && { status: input.status }),
          ...(input.search && {
            OR: [
              { title: { contains: input.search, mode: 'insensitive' as const } },
              { description: { contains: input.search, mode: 'insensitive' as const } },
            ],
          }),
          ...(input.minPrice && { amount: { gte: input.minPrice } }),
          ...(input.maxPrice && { amount: { lte: input.maxPrice } }),
        };

        // 获取数据
        const posts = await ctx.prisma.post.findMany({
          take: input.limit,
          ...(input.cursor && { skip: 1, cursor: { id: input.cursor } }),
          where,
          orderBy: {
            [input.sortBy]: input.sortOrder,
          },
          include: {
            images: true,
            poster: true,
            orders: true
          },
        });
        
        
        // 获取下一页的游标
        let nextCursor: string | undefined = undefined;
        if (posts.length === input.limit) {
          nextCursor = posts[posts.length - 1].id;
        }
        
        // 格式化posts数据，添加order信息
        const formattedPosts = posts.map(post => {
          const orderTmp = post.orders.filter(order => 
            order.status === OrderStatus.PAID || 
            order.status === OrderStatus.COMPLETED || 
            order.status === OrderStatus.SHIPPED || 
            order.status === OrderStatus.DELIVERED
          )[0];
          return {
            ...post,
            order: orderTmp ? {
              id: orderTmp.id,
              shipping_address: orderTmp.shippingAddress,
              shipping_receiver: orderTmp.shippingReceiver,
              shipping_phone: orderTmp.shippingPhone,
              total: orderTmp.total ? Number(orderTmp.total) : null,
              delivery_type: orderTmp.deliveryType,
              status: orderTmp.status || '',
              createdAt: orderTmp.createdAt
            } : null
          };
        });
        // console.log("🌻🌻🌻formattedPosts", formattedPosts);
        return {
          items: formattedPosts,
          nextCursor: nextCursor ? { id: nextCursor } : undefined,
        };
      } catch (error) {
        console.error('🙀🙀🙀Failed to get posts:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to get posts",
        });
      }
    }),
  createPost: protectedProcedure
    .input(createPostSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const post = await ctx.prisma.post.create({
          data: {
            title: input.title,
            description: input.description,
            amount: input.amount,
            isNegotiable: input.isNegotiable,
            category: input.category,
            condition: input.condition,
            deliveryType: input.deliveryType,
            images: {
              create: input.images.map(image => ({
                imageUrl: image.imageUrl,
                imageType: image.imageType,
              })),
            },
            posterId: ctx.loginUser.id,
          },
        });
        return post;
      } catch (error) {
        console.error("Error creating post:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create post",
        });
      }
    }),
  updatePost: protectedProcedure
    .input(updatePostSchema)
    .mutation(async ({ input, ctx }) => {
      try{
      const { id, status } = input;
      const updatedPost = await ctx.prisma.post.update({
        where: { id },
        data: { status },
      });
      return updatedPost;
      } catch (error) {
        console.error('🙀🙀🙀Failed to update post:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to update post",
        });
      }
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        amount: z.number().optional(),
        category: z.string().optional(),
        images: z.array(z.string()).optional(),
        condition: z.string().optional(),
        status: z.nativeEnum(PostStatus).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const post = await ctx.prisma.post.update({
          where: { id: input.id },
          data: {
            title: input.title,
            description: input.description,
            amount: input.amount,
            category: input.category,
            images: input.images ? {
              deleteMany: {},
              create: input.images.map(imageUrl => ({
                imageUrl,
                imageType: 'image',
              })),
            } : undefined,
            condition: input.condition,
            status: input.status,
          },
        });
        return post;
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unknown error occurred',
        });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const post = await ctx.prisma.post.delete({
          where: { id: input.id },
        });
        return post;
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unknown error occurred',
        });
      }
    }),
});
