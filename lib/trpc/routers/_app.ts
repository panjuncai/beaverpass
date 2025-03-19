import { router } from '..';
import { authRouter } from './auth';
import { postRouter } from './post';

export const appRouter = router({
  auth: authRouter,
  post: postRouter,
});

export type AppRouter = typeof appRouter; 