import { router } from '..';
import { authRouter } from './auth';
import { postRouter } from './post';
import { uploadRouter } from './upload';
import { orderRouter } from './order';
export const appRouter = router({
  auth: authRouter,
  post: postRouter,
  upload: uploadRouter,
  order: orderRouter,
});

export type AppRouter = typeof appRouter; 