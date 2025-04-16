import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "..";
import { createPostSchema, getPostByIdSchema, getPostsSchema, updatePostSchema } from "@/lib/validations/post";
import { OrderStatus } from "@/lib/types/enum";


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
            orders: {
              where: {
                status: {
                  in: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.COMPLETED],
                },
              },
            },
          },
        });
        
        if (!post) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Post not found',
          });
        }
        
        return post;
      } catch (error) {
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
            orders: {
              where: {
                status: {
                  in: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.COMPLETED],
                },
              },
            },
          },
        });
        
        
        // 获取下一页的游标
        let nextCursor: string | undefined = undefined;
        if (posts.length === input.limit) {
          nextCursor = posts[posts.length - 1].id;
        }
        
        return {
          items: posts,
          nextCursor: nextCursor ? { id: nextCursor } : undefined,
        };
      } catch (error) {
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
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to create post",
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
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to update post",
        });
      }
    }),
});
