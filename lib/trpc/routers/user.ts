import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '..';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/client';

// 用户资料更新验证模式
const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
});

export const userRouter = router({
  // 获取当前用户信息
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.loginUser) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not logged in',
      });
    }
    
    return ctx.loginUser;
  }),
  
  // 更新用户资料
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ input }) => {
      try {
        const supabase = await createClient();
        
        // 获取当前用户数据
        const { data: currentUser, error: fetchError } = await supabase.auth.getUser();
        if (fetchError) throw fetchError;

        // 获取现有的用户元数据
        const currentMetadata = currentUser.user.user_metadata || {};
        
        // 创建新的元数据对象，只包含有值的字段
        const newMetadata: Record<string, string> = {};
        
        // 检查每个字段，只添加非空值
        if (input.firstName) newMetadata.firstName = input.firstName;
        if (input.lastName) newMetadata.lastName = input.lastName;
        if (input.address) newMetadata.address = input.address;
        if (input.phone) newMetadata.phone = input.phone;
        if (input.avatar) newMetadata.avatar = input.avatar;

        // 合并现有元数据和新元数据
        const updatedMetadata = {
          ...currentMetadata,
          ...newMetadata
        };

        // 更新用户
        const { data, error } = await supabase.auth.updateUser({
          data: updatedMetadata
        });

        if (error) throw error;

        return data;
      } catch (error) {
        console.error('Error updating profile:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Update profile failed',
        });
      }
    }),
}); 