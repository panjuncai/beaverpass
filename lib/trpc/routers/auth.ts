import { TRPCError } from '@trpc/server';
import { publicProcedure, router } from '..';
import { loginSchema, registerSchema } from '@/lib/validations/auth';
import { createClient } from '@/utils/supabase/server';
import { userCache } from '..';  // 导入缓存实例

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
        if (data.user && data.session) {
          // 使用 access_token 作为缓存的 key
          userCache.set(data.session.access_token, data.user);
          
          // 返回完整的会话信息
          return { 
            success: true, 
            user: data.user,
            session: data.session 
          };
        }

        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Login failed: No session created',
        });
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
        console.log('Starting registration process for:', input.email);
        const supabase = await createClient();
        
        console.log('Attempting to sign up user with Supabase...');
        const { data, error } = await supabase.auth.signUp({
          email: input.email,
          password: input.password,
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
          }
        });

        if (error) {
          console.error('Supabase signup error:', {
            error: error.message,
            code: error.status,
            name: error.name,
            timestamp: new Date().toISOString()
          });
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message || 'Sign up failed',
          });
        }

        console.log('User registration successful:', {
          userId: data.user?.id,
          email: data.user?.email,
          timestamp: new Date().toISOString()
        });

        return { success: true, user: data.user };
      } catch (error) {
        console.error('Unexpected error during registration:', {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        });
        
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
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.signOut();
      
      // 获取 token 并清理对应的缓存
      const token = ctx.headers.get('authorization')?.split('Bearer ')[1];
      if (token) {
        userCache.delete(token);
      }
      
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

}); 