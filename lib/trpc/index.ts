import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { createClient } from '@/utils/supabase/server';

// 创建上下文类型
export const createTRPCContext = async (opts: { headers: Headers }) => {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return {
    headers: opts.headers,
    session,
  };
};

// 初始化tRPC
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

// 创建路由器和过程
export const router = t.router;
export const publicProcedure = t.procedure;

// 创建受保护的过程（需要登录）
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You need to login to access this resource' });
  }
  
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session },
      user: ctx.session.user,
    },
  });
}); 