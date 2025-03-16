import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, router } from '..';

// 登录表单验证
const loginSchema = z.object({
  email: z.string().email('请输入有效的电子邮件地址'),
  password: z.string().min(6, '密码至少需要6个字符'),
});

// 注册表单验证
const registerSchema = z.object({
  email: z.string().email('请输入有效的电子邮件地址'),
  password: z.string().min(6, '密码至少需要6个字符'),
  confirmPassword: z.string().min(6, '密码至少需要6个字符'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '密码和确认密码不匹配',
  path: ['confirmPassword'],
});

export const authRouter = router({
  // 邮箱登录
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { data, error } = await ctx.supabase.auth.signInWithPassword({
          email: input.email,
          password: input.password,
        });

        if (error) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: error.message || '登录失败，请检查您的凭据',
          });
        }

        return { success: true, user: data.user };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '登录时出现错误',
        });
      }
    }),

  // 注册
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { data, error } = await ctx.supabase.auth.signUp({
          email: input.email,
          password: input.password,
        });

        if (error) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message || '注册失败',
          });
        }

        return { success: true, user: data.user };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '注册时出现错误',
        });
      }
    }),

  // 登出
  logout: publicProcedure.mutation(async ({ ctx }) => {
    const { error } = await ctx.supabase.auth.signOut();
    
    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || '登出时出现错误',
      });
    }
    
    return { success: true };
  }),

  // 获取当前用户
  getUser: publicProcedure.query(async ({ ctx }) => {
    return { user: ctx.session?.user || null };
  }),
}); 