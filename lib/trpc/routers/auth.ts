import { TRPCError } from '@trpc/server';
import { publicProcedure, router } from '..';
import { loginSchema, registerSchema } from '@/lib/validations/auth';

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
            message: error.message || 'Login failed, please check your credentials',
          });
        }

        return { success: true, user: data.user };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Login failed',
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
          options: {
            // 开启邮箱确认
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
          }
        });

        if (error) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message || 'Sign up failed',
          });
        }

        return { success: true, user: data.user };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Registration failed',
        });
      }
    }),

  // 登出
  logout: publicProcedure.mutation(async ({ ctx }) => {
    const { error } = await ctx.supabase.auth.signOut();
    
    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Logout failed',
      });
    }
    
    return { success: true };
  }),

  // 获取当前用户
  getUser: publicProcedure.query(async ({ ctx }) => {
    return { user: ctx.session?.user || null };
  }),
}); 