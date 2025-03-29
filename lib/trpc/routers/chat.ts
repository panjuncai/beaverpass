import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "..";
import {
  createChatRoomSchema,
  getChatRoomsSchema,
  getMessagesSchema,
  markMessageReadSchema,
  sendMessageSchema,
} from "@/lib/validations/chat";
import { MessageType } from "@/lib/types/enum";

export const chatRouter = router({
  // 创建聊天室
  createChatRoom: protectedProcedure
    .input(createChatRoomSchema)
    .mutation(async ({ input, ctx }) => {
      const { participantIds, postId } = input;
      
      // 确保当前用户是参与者之一
      if (!participantIds.includes(ctx.loginUser.id)) {
        participantIds.push(ctx.loginUser.id);
      }

      try {
        // 检查是否已存在包含相同参与者的聊天室
        const existingChatRooms = await ctx.prisma.chatRoom.findMany({
          where: {
            participants: {
              every: {
                userId: {
                  in: participantIds,
                },
              },
            },
            AND: {
              participants: {
                none: {
                  userId: {
                    notIn: participantIds,
                  },
                },
              },
            },
          },
          include: {
            participants: {
              include: {
                user: true,
              },
            },
          },
        });

        let chatRoom;
        
        // 如果聊天室已存在，直接使用
        if (existingChatRooms.length > 0) {
          chatRoom = existingChatRooms[0];
        } else {
          // 创建新聊天室
          chatRoom = await ctx.prisma.chatRoom.create({
            data: {
              participants: {
                createMany: {
                  data: participantIds.map(userId => ({
                    userId,
                  })),
                },
              },
            },
            include: {
              participants: {
                include: {
                  user: true,
                },
              },
            },
          });
        }

        // 如果提供了商品ID，自动发送商品消息
        if (postId) {
          const post = await ctx.prisma.post.findUnique({
            where: { id: postId },
          });

          if (!post) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Post not found",
            });
          }

          await ctx.prisma.message.create({
            data: {
              chatRoomId: chatRoom.id,
              senderId: ctx.loginUser.id,
              postId: postId,
              messageType: MessageType.POST,
            },
          });
        }

        return chatRoom;
      } catch (error) {
        console.error("Failed to create chat room:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create chat room",
        });
      }
    }),

  // 获取用户的聊天室
  getChatRooms: protectedProcedure
    .input(getChatRoomsSchema)
    .query(async ({ input, ctx }) => {
      try {
        const chatRooms = await ctx.prisma.chatRoom.findMany({
          where: {
            participants: {
              some: {
                userId: input.userId,
              },
            },
          },
          include: {
            participants: {
              include: {
                user: true,
              },
            },
            messages: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
              include: {
                sender: true,
                post: true,
              },
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        });

        return chatRooms;
      } catch (error) {
        console.error("Failed to get chat rooms:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get chat rooms",
        });
      }
    }),

  // 获取聊天室消息
  getMessages: protectedProcedure
    .input(getMessagesSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { chatRoomId, limit, cursor } = input;

        // 首先检查用户是否是聊天室成员
        const isMember = await ctx.prisma.chatRoomParticipant.findUnique({
          where: {
            chatRoomId_userId: {
              chatRoomId,
              userId: ctx.loginUser.id,
            },
          },
        });

        if (!isMember) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not a member of this chat room",
          });
        }

        // 获取消息
        const messages = await ctx.prisma.message.findMany({
          where: {
            chatRoomId,
          },
          take: limit,
          skip: cursor ? 1 : 0,
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            sender: true,
            post: {
              include: {
                images: true,
              },
            },
            readBy: true,
          },
        });

        return messages;
      } catch (error) {
        console.error("Failed to get messages:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get messages",
        });
      }
    }),

  // 发送消息
  sendMessage: protectedProcedure
    .input(sendMessageSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { chatRoomId, content, postId, messageType } = input;

        // 检查用户是否是聊天室成员
        const isMember = await ctx.prisma.chatRoomParticipant.findUnique({
          where: {
            chatRoomId_userId: {
              chatRoomId,
              userId: ctx.loginUser.id,
            },
          },
        });

        if (!isMember) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not a member of this chat room",
          });
        }

        // 根据消息类型创建消息
        const messageData: {
          chatRoomId: string;
          senderId: string;
          messageType: string;
          content: string | null;
          postId: string | null;
          createdAt: Date;
          updatedAt: Date;
        } = {
          chatRoomId,
          senderId: ctx.loginUser.id,
          messageType,
          content: null,
          postId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        if (messageType === MessageType.TEXT) {
          messageData.content = content ?? null;
        } else if (messageType === MessageType.POST) {
          // 检查商品是否存在
          const post = await ctx.prisma.post.findUnique({
            where: { id: postId },
          });

          if (!post) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Post not found",
            });
          }

          messageData.postId = postId ?? null;
        }

        console.log("messageData", messageData);

        const message = await ctx.prisma.message.create({
          data: messageData,
          include: {
            sender: true,
            post: {
              include: {
                images: true,
              },
            },
          },
        });

        // 更新聊天室最后活动时间
        await ctx.prisma.chatRoom.update({
          where: { id: chatRoomId },
          data: { updatedAt: new Date() },
        });

        return message;
      } catch (error) {
        console.error("Failed to send message:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send message",
        });
      }
    }),

  // 标记消息为已读
  markMessageRead: protectedProcedure
    .input(markMessageReadSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { messageId, userId } = input;

        // 检查消息是否存在
        const message = await ctx.prisma.message.findUnique({
          where: { id: messageId },
          include: {
            chatRoom: {
              include: {
                participants: true,
              },
            },
          },
        });

        if (!message) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Message not found",
          });
        }

        // 检查用户是否是聊天室成员
        const isMember = message.chatRoom.participants.some(
          (participant) => participant.userId === userId
        );

        if (!isMember) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not a member of this chat room",
          });
        }

        // 标记消息为已读
        const readBy = await ctx.prisma.messageReadBy.upsert({
          where: {
            messageId_userId: {
              messageId,
              userId,
            },
          },
          update: {
            readAt: new Date(),
          },
          create: {
            messageId,
            userId,
            readAt: new Date(),
          },
        });

        return readBy;
      } catch (error) {
        console.error("Failed to mark message as read:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark message as read",
        });
      }
    }),
}); 