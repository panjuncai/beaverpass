import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "..";
import { createPostSchema } from "@/lib/validations/post";

// 创建帖子
export const postRouter = router({
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
