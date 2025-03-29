import { z } from "zod";
import { MessageType } from "../types/enum";

export const createChatRoomSchema = z.object({
  participantIds: z.array(z.string().uuid()).min(1, "At least one participant is required"),
  postId: z.string().uuid().optional(),
});

export const sendMessageSchema = z.object({
  chatRoomId: z.string().uuid(),
  // 根据消息类型有条件地验证
  content: z.string().optional(),
  postId: z.string().uuid().optional(),
  messageType: z.nativeEnum(MessageType),
}).refine(data => {
  if (data.messageType === MessageType.TEXT) {
    return !!data.content; // 文本消息必须有内容
  } else if (data.messageType === MessageType.POST) {
    return !!data.postId; // 商品消息必须有商品ID
  }
  return false;
}, {
  message: "Either content or postId must be provided based on message type",
  path: ["content", "postId"],
});

export const getChatRoomsSchema = z.object({
  userId: z.string().uuid(),
});

export const getMessagesSchema = z.object({
  chatRoomId: z.string().uuid(),
  limit: z.number().min(1).max(50).optional().default(20),
  cursor: z.string().optional(),
});

export const markMessageReadSchema = z.object({
  messageId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type CreateChatRoomInput = z.infer<typeof createChatRoomSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type GetChatRoomsInput = z.infer<typeof getChatRoomsSchema>;
export type GetMessagesInput = z.infer<typeof getMessagesSchema>;
export type MarkMessageReadInput = z.infer<typeof markMessageReadSchema>; 