import { router } from '..';
import { authRouter } from './auth';
import { postRouter } from './post';
import { uploadRouter } from './upload';
import { orderRouter } from './order';
import { chatRouter } from './chat';

export const appRouter = router({
  auth: authRouter,
  post: postRouter,
  upload: uploadRouter,
  order: orderRouter,
  chat: chatRouter,
});

export type AppRouter = typeof appRouter; 