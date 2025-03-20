import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "..";
import { createPostSchema, getPostByIdSchema, getPostsSchema } from "@/lib/validations/post";

// 创建帖子
export const postRouter = router({
  // 获取单个帖子
  getPostById: publicProcedure
    .input(getPostByIdSchema)
    .query(async ({ input, ctx }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id },
      });
      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Post not found',
        });
      }
      return post;
    }),
  // 获取帖子列表
  getPosts: publicProcedure
    .input(getPostsSchema)
    .query(async ({ input, ctx }) => {
      const posts = await ctx.prisma.post.findMany({
        take: input.limit,
        where: {
          ...(input.category && { category: input.category }),
          ...(input.search && {
            OR: [
              { title: { contains: input.search, mode: 'insensitive' } },
              { description: { contains: input.search, mode: 'insensitive' } },
            ],
          }),
          ...(input.minPrice && { amount: { gte: input.minPrice } }),
          ...(input.maxPrice && { amount: { lte: input.maxPrice } }),
        },
        orderBy: {
          [input.sortBy]: input.sortOrder,
        },
        ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
      });
      return posts;
    }),
  createPost: protectedProcedure
    .input(createPostSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const post = await ctx.prisma.post.create({
          data: {
            category: input.category,
            title: input.title,
            description: input.description,
            condition: input.condition,
            amount: input.amount,
            isNegotiable: input.isNegotiable,
            deliveryType: input.deliveryType,
            posterId: ctx.user.id,
          },
        });

        return { success: true, post };
      } catch (error) {
        console.error('Failed to create post:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to create post",
        });
      }
    }),
});
