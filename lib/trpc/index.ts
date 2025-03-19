import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '../prisma';
import { PrismaClient } from '@prisma/client';
import { User } from '@supabase/supabase-js';

// 定义上下文类型
interface Context {
  headers: Headers;
  user: User | null;
  prisma: PrismaClient;
}

// 创建上下文
export const createTRPCContext = async (opts: { headers: Headers }): Promise<Context> => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return {
      headers: opts.headers,
      user,
      prisma,
    };
};

// 初始化tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

// 创建路由器和过程
export const router = t.router;
export const publicProcedure = t.procedure;

// 创建受保护的过程（需要登录）
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You need to login to access this resource' });
  }
  
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
}); 