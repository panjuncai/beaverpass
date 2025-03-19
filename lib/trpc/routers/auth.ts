import { TRPCError } from '@trpc/server';
import { publicProcedure, router } from '..';
import { loginSchema, registerSchema } from '@/lib/validations/auth';
// import { createSupabaseClient } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';
export const authRouter = router({
  // 邮箱登录
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input }) => {
      try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
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
    .mutation(async ({ input }) => {
      try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.signUp({
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
  logout: publicProcedure.mutation(async () => {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Logout failed',
        });
      }
      
      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Logout failed',
      });
    }
  }),

  // 获取当前用户
  getUser: publicProcedure.query(async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return { user: user || null };
  }),
}); 