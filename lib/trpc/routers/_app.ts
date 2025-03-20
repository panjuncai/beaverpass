import { router } from '..';
import { authRouter } from './auth';
import { postRouter } from './post';
import { uploadRouter } from './upload';

export const appRouter = router({
  auth: authRouter,
  post: postRouter,
  upload: uploadRouter,
});

export type AppRouter = typeof appRouter; 