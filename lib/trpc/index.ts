import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
// import { createClient } from '@supabase/supabase-js';

// 创建上下文类型
export const createTRPCContext = async (opts: { headers: Headers }) => {
  // 调试：打印请求头信息
  // console.log('【服务器】收到的请求头:', {
  //   cookie: opts.headers.get('cookie'),
  //   source: opts.headers.get('x-trpc-source'),
  // });
  
  // const supabase = createClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.SUPABASE_SERVICE_ROLE_KEY!,
  //   {
  //     auth: {
  //       persistSession: false,
  //       autoRefreshToken: false,
  //     },
  //     global: {
  //       headers: {
  //         cookie: opts.headers.get('cookie') || '',
  //       },
  //     },
  //   }
  // );
  
  // 获取当前会话
  // const {
  //   data: { session },
  // } = await supabase.auth.getSession();
  
  // // 调试：打印会话信息
  // console.log('【服务器】Supabase 会话状态:', {
  //   hasSession: !!session,
  //   userId: session?.user?.id,
  // });
  
  // return {
  //   supabase,
  //   session,
  //   headers: opts.headers,
  // };
  return {
    headers: opts.headers,
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
// export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
//   if (!ctx.session || !ctx.session.user) {
//     throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You need to login to access this resource' });
//   }
  
//   return next({
//     ctx: {
//       ...ctx,
//       session: { ...ctx.session },
//       user: ctx.session.user,
//     },
//   });
// }); 