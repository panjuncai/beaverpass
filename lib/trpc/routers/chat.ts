import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "..";
import {
  createChatRoomSchema,
  getChatRoomsSchema,
  getMessagesSchema,
  markMessageReadSchema,
  sendMessageSchema,
  getChatRoomByIdSchema,
  joinChatRoomSchema,
  leaveChatRoomSchema,
  setTypingStatusSchema,
  getMessagesByTemporaryIdSchema,
} from "@/lib/validations/chat";
import { MessageStatus, MessageType } from "@/lib/types/enum";
import {createClient} from '@/utils/supabase/server'
interface MessageData {
  chat_room_id: string;
  sender_id: string;
  message_type: keyof typeof MessageType;
  temporary_id: string;
  content?: string;
  post_id?: string;
  status?: MessageStatus;
  created_at?: string;
  updated_at?: string;
}
export const chatRouter = router({
  // 创建聊天室
  createChatRoom: protectedProcedure
    .input(createChatRoomSchema)
    .mutation(async ({ input, ctx }) => {
      const { participantIds, postId } = input;
      const supabase = await createClient();
      
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
          // 使用supabase插入消息,触发realtime事件
          await supabase.from('messages').insert({
            chatRoomId: chatRoom.id,
            senderId: ctx.loginUser.id,
            postId: postId,
            messageType: MessageType.POST,
          });
          // const message = await ctx.prisma.message.create({
          //   data: {
          //     chatRoomId: chatRoom.id,
          //     senderId: ctx.loginUser.id,
          //     postId: postId,
          //     messageType: MessageType.POST,
          //   },
          //   include: {
          //     sender: true,
          //     post: {
          //       include: {
          //         images: true,
          //       },
          //     },
          //   },
          // });
        // supabase 触发事件
        // await supabase.from('chat_room_participants').update({
        //   is_typing: false,
        //   is_online: true,
        //   last_active_at: new Date()
        // }).eq('chat_room_id', chatRoom.id).eq('user_id', ctx.loginUser.id); 
       
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

  // 获取单个聊天室
  getChatRoomById: protectedProcedure
    .input(getChatRoomByIdSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { chatRoomId } = input;
        
        // 检查聊天室是否存在
        const chatRoom = await ctx.prisma.chatRoom.findUnique({
          where: { id: chatRoomId },
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
                readBy: true,
              },
            },
          },
        });

        if (!chatRoom) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Chat room not found",
          });
        }

        // 检查用户是否是聊天室成员
        const isMember = chatRoom.participants.some(
          (participant) => participant.userId === ctx.loginUser.id
        );

        if (!isMember) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not a member of this chat room",
          });
        }

        // 添加当前用户ID，方便前端识别
        return {
          ...chatRoom,
          currentUserId: ctx.loginUser.id,
        };
      } catch (error) {
        console.error("Failed to get chat room:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get chat room",
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
            createdAt: "asc",
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

  // 根据临时ID获取消息
  getMessagesByTemporaryId: protectedProcedure
    .input(getMessagesByTemporaryIdSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { temporaryId } = input;
        const message = await ctx.prisma.message.findFirst({
          where: {
            temporaryId,
          },
        });
        return message;
      } catch (error) {
        console.error("Failed to get messages by temporary id:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get messages by temporary id",
        });
      }
    }),

  // 发送消息
  sendMessage: protectedProcedure
    .input(sendMessageSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = await createClient();
        const { temporaryId, chatRoomId, content, postId, messageType = MessageType.TEXT } = input;

        // 检查聊天室是否存在
        const chatRoom = await ctx.prisma.chatRoom.findUnique({
          where: { id: chatRoomId },
          include: {
            participants: true,
          },
        });

        if (!chatRoom) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Chat room not found",
          });
        }

        // 检查用户是否是聊天室成员
        const isMember = chatRoom.participants.some(
          (participant) => participant.userId === ctx.loginUser.id
        );

        if (!isMember) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not a member of this chat room",
          });
        }

        // 准备消息数据
        const messageData:MessageData = {
          chat_room_id: chatRoomId,
          sender_id: ctx.loginUser.id,
          message_type: messageType,
          temporary_id: temporaryId ?? '',
          status:MessageStatus.STORED
        };

        // 根据消息类型设置不同字段
        if (messageType === MessageType.TEXT) {
          if (!content) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Content is required for text messages",
            });
          }
          messageData.content = content;
        } else if (messageType === MessageType.POST) {
          if (!postId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Post ID is required for post messages",
            });
          }

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

          messageData.post_id = postId ?? null;
        }
        console.log("🐱🐱🐱messageData:", messageData);
        // 使用supabase插入消息,触发realtime事件
        const message = await supabase.from('messages').insert(messageData).select().single();
        // const message = await ctx.prisma.message.create({
        //   data: messageData,
        //   include: {
        //     sender: true,
        //     post: {
        //       include: {
        //         images: true,
        //       },
        //     },
        //   },
        // });
        console.log("🐱🐱🐱db response message:", message);

        // 更新聊天室最后活动时间
        await ctx.prisma.chatRoom.update({
          where: { id: chatRoomId },
          data: { updatedAt: new Date() },
        });
        
        // 更新发送者状态（取消正在输入状态）
        await supabase.from('chat_room_participants').update({
          is_typing: false,
          last_active_at: new Date()
        }).eq('chat_room_id', chatRoomId).eq('user_id', ctx.loginUser.id);

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
        const supabase = await createClient();

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

        // 使用Supabase Realtime自动通知其他用户
        // message_read_by表的更改会被自动广播到订阅者
        const readBy = await supabase.from('message_read_by').upsert({
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
    
  // 加入聊天室（更新用户在线状态）
  joinChatRoom: protectedProcedure
    .input(joinChatRoomSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { chatRoomId, userId } = input;
        const supabase = await createClient();
        
        // 验证用户是否属于该聊天室
        const participant = await ctx.prisma.chatRoomParticipant.findFirst({
          where: {
            chatRoomId,
            userId,
          },
        });
        
        if (!participant) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "User is not a participant of the chat room",
          });
        }
        
        // 使用supabase触发用户上线通知,可以触发realtime事件
        await supabase.from('chat_room_participants').update({
          is_online: true,
          last_active_at: new Date(),
        }).eq('chat_room_id', chatRoomId).eq('user_id', userId);
        
        return { success: true };
      } catch (error) {
        console.error("Failed to join chat room:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to join chat room",
        });
      }
    }),
    
  // 离开聊天室（更新用户离线状态）
  leaveChatRoom: protectedProcedure
    .input(leaveChatRoomSchema)
    .mutation(async ({ input }) => {
      try {
        const { chatRoomId, userId } = input;
        const supabase = await createClient();
        
        
        // 使用supabase触发用户离线通知,可以触发realtime事件
        await supabase.from('chat_room_participants').update({
          is_online: false,
          last_active_at: new Date(),
        }).eq('chat_room_id', chatRoomId).eq('user_id', userId);
        
        return { success: true };
      } catch (error) {
        console.error("Failed to leave chat room:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to leave chat room",
        });
      }
    }),
    
  // 设置正在输入状态
  setTypingStatus: protectedProcedure
    .input(setTypingStatusSchema)
    .mutation(async ({ input }) => {
      try {
        const { chatRoomId, userId, isTyping } = input;
        const supabase = await createClient();
        
        // 使用supabase触发正在输入状态通知,可以触发realtime事件
        await supabase.from('chat_room_participants').update({
          is_typing: isTyping,
          last_active_at: new Date(),
        }).eq('chat_room_id', chatRoomId).eq('user_id', userId);
        
        return { success: true };
      } catch (error) {
        console.error("Failed to update typing status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update typing status",
        });
      }
    }),
}); 