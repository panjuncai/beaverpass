import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '../prisma';
import { PrismaClient } from '@prisma/client';
import { User } from '@supabase/supabase-js';
import { jwtDecode } from 'jwt-decode';
import { LRUCache } from 'lru-cache';

// 定义上下文类型
interface Context {
  headers: Headers;
  user: User | null;
  prisma: PrismaClient;
}

// 创建缓存实例
export const userCache = new LRUCache<string, User>({
  max: 500,
  ttl: 1000 * 60 * 5,
});

// 创建上下文
export const createTRPCContext = async (opts: { headers: Headers }): Promise<Context> => {
  const token = opts.headers.get('authorization')?.split('Bearer ')[1];
  
  // console.log('Server context creation:', {
  //   hasToken: !!token,
  //   headers: Object.fromEntries(opts.headers.entries())
  // });

  if (!token) {
    return { headers: opts.headers, user: null, prisma };
  }

  try {
    // 1. 先验证 token 格式和过期时间（本地操作，无网络请求）
    const decoded = jwtDecode(token);
    console.log('Token validation:', {
      decoded,
      expired: decoded.exp && decoded.exp < Date.now() / 1000
    });

    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return { headers: opts.headers, user: null, prisma };
    }

    // 2. 检查缓存
    const cachedUser = userCache.get(token);
    console.log('Cache check:', {
      hasCachedUser: !!cachedUser
    });

    if (cachedUser) {
      return { headers: opts.headers, user: cachedUser, prisma };
    }

    // 3. 缓存未命中才请求 Supabase
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      userCache.set(token, user);
    }

    return { headers: opts.headers, user, prisma };
  } catch (error) {
    console.error('Auth error:', error);
    return { headers: opts.headers, user: null, prisma };
  }
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