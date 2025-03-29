import { createTRPCReact } from '@trpc/react-query';
import { type AppRouter } from './routers/_app';
import { inferRouterOutputs, inferRouterInputs } from '@trpc/server';

export const trpc = createTRPCReact<AppRouter>(); 

// 从 tRPC API 推断出类型
export type RouterOutput = inferRouterOutputs<AppRouter>;
export type RouterInput = inferRouterInputs<AppRouter>;

// 聊天相关类型
export type GetMessagesOutput = RouterOutput['chat']['getMessages'];
export type MessageOutput = RouterOutput['chat']['getMessages'][number];
export type ChatRoomsOutput = RouterOutput['chat']['getChatRooms'];
export type ChatRoomOutput = RouterOutput['chat']['getChatRooms'][number];

  