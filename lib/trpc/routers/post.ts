import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "..";
import { createPostSchema, getPostByIdSchema, getPostsSchema, updatePostSchema } from "@/lib/validations/post";


export const postRouter = router({
  // 获取单个帖子
  getPostById: publicProcedure
    .input(getPostByIdSchema)
    .query(async ({ input, ctx }) => {
      try {
        // Define a mapping function to handle nullable fields
        const mapUser = (user: any) => {
          if (!user) return null;
          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            avatar: user.avatar || null,
            phone: user.phone || null,
            address: user.address || null
          };
        };
        
        const post = await ctx.prisma.post.findUnique({
          where: { id: input.id },
          include: {
          images: true,
          poster: true,
        },
      });
      if (!post) {
        console.error('🙀🙀🙀Post not found');
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Post not found',
        });
      }
      
      // Map the post to handle nullable fields
      const mappedPost = {
        ...post,
        poster: mapUser(post.poster)
      };
      
      return mappedPost;
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
        // Define a mapping function to handle nullable fields
        const mapUser = (user: any) => {
          if (!user) return null;
          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            avatar: user.avatar || null,
            phone: user.phone || null,
            address: user.address || null
          };
        };
        
        const posts = await ctx.prisma.post.findMany({
          take: input.limit,
          where: {
          ...(input.posterId && { posterId: input.posterId }),
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
        include: {
          images: true,
          poster: true,
        },
        ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
      });
      
      // Map the posts to handle nullable fields
      const mappedPosts = posts.map(post => ({
        ...post,
        poster: mapUser(post.poster)
      }));
      
      return mappedPosts;
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
    .mutation(async ({ input, ctx }) => {
      try {
        // Define a mapping function to handle nullable fields
        const mapUser = (user: any) => {
          if (!user) return null;
          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            avatar: user.avatar || null,
            phone: user.phone || null,
            address: user.address || null
          };
        };
        
        // 使用事务来确保帖子和图片同时保存
        const post = await ctx.prisma.$transaction(async (tx) => {
          // 创建帖子
          const newPost = await tx.post.create({
            data: {
              category: input.category,
              title: input.title,
              description: input.description,
              condition: input.condition,
              amount: input.amount,
              isNegotiable: input.isNegotiable,
              deliveryType: input.deliveryType,
              posterId: ctx.loginUser.id,
            },
          });

          // 创建图片记录
          if (input.images.length > 0) {
            await tx.postImage.createMany({
              data: input.images.map(image => ({
                postId: newPost.id,
                imageUrl: image.imageUrl,
                imageType: image.imageType,
              })),
            });
          }

          // 返回包含图片的完整帖子
          return tx.post.findUnique({
            where: { id: newPost.id },
            include: {
              images: true,
              poster: true,
            },
          });
        });

        // Map the post to handle nullable fields
        const mappedPost = post ? {
          ...post,
          poster: mapUser(post.poster)
        } : null;

        return mappedPost;
      } catch (error) {
        console.error('🙀🙀🙀Failed to create post:', error);
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
        console.error('🙀🙀🙀Failed to update post:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to update post",
        });
      }
    }),
});
