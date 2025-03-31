import { router } from '..';
import { authRouter } from './auth';
import { chatRouter } from './chat';
import { orderRouter } from './order';
import { postRouter } from './post';
import { uploadRouter } from './upload';
import { userRouter } from './user';

export const appRouter = router({
  auth: authRouter,
  chat: chatRouter,
  order: orderRouter,
  post: postRouter,
  upload: uploadRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter; 