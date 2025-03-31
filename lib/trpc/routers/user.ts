import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '..';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';

// 用户资料更新验证模式
const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
});

export const userRouter = router({
  // 获取当前用户信息
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.loginUser) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: '用户未登录',
      });
    }
    
    return ctx.loginUser;
  }),
  
  // 更新用户资料
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.loginUser?.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: '未登录用户无法更新资料',
          });
        }
        
        const supabase = await createClient();
        
        // 更新Supabase用户元数据
        const { data, error } = await supabase.auth.updateUser({
          data: {
            firstName: input.firstName,
            lastName: input.lastName,
            address: input.address,
            phone: input.phone,
            avatar: input.avatar,
          }
        });
        
        if (error || !data.user) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error?.message || '更新用户资料失败',
          });
        }
        
        // 同时更新数据库中的用户记录
        // const updatedDbUser = await ctx.prisma.user.upsert({
        //   where: { id: ctx.loginUser.id },
        //   update: {
        //     firstName: input.firstName,
        //     lastName: input.lastName,
        //     address: input.address || null,
        //     phone: input.phone || null,
        //     avatar: input.avatar || null,
        //     updatedAt: new Date(),
        //   },
        //   create: {
        //     id: ctx.loginUser.id,
        //     email: ctx.loginUser.email!,
        //     firstName: input.firstName,
        //     lastName: input.lastName,
        //     address: input.address || null,
        //     phone: input.phone || null,
        //     avatar: input.avatar || null,
        //   },
        // });
        
        return {
          success: true,
          user: data.user,
        //   dbUser: updatedDbUser
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        console.error('更新用户资料失败:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : '更新用户资料失败',
        });
      }
    }),
}); 