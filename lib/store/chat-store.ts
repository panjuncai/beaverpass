// /lib/store/chat-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatRoomOutput, GetOtherParticipantOutput } from '@/lib/trpc/client';
import { GetChatRoomParticipantsOutput } from '@/lib/trpc/client';


// 定义店铺中使用的简化聊天室接口
export interface StoredChatRoom {
  id: string;
  participants: GetChatRoomParticipantsOutput;
  lastMessage?: {
    id: string;
    content?: string;
    createdAt: Date;
    messageType: string;
  };
}

// 定义store状态接口
interface ChatState {
  chatRooms: Record<string, StoredChatRoom>; // 键为chatRoomId，值为StoredChatRoom对象
  activeChatRoomId: string | null;
  
  // 操作方法
  setChatRoom: (chatRoom: ChatRoomOutput) => void;
  setActiveChatRoomId: (chatRoomId: string | null) => void;
  getChatRoomParticipants: (chatRoomId: string) => GetChatRoomParticipantsOutput | undefined;
  getOtherParticipant: (chatRoomId: string, loginUserId: string) => GetOtherParticipantOutput | undefined;
  clearChatRooms: () => void;
}

// 创建store
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chatRooms: {},
      activeChatRoomId: null,
      
      // 保存聊天室信息 - 现在接收 ChatRoomOutput 并转换为 StoredChatRoom
      setChatRoom: (chatRoom: ChatRoomOutput) => {
        // 转换 ChatRoomOutput 为 StoredChatRoom
        const storedRoom: StoredChatRoom = {
          id: chatRoom.id,
          participants: chatRoom.participants,
          lastMessage: chatRoom.messages && chatRoom.messages.length > 0 ? {
            id: chatRoom.messages[0].id,
            content: chatRoom.messages[0].content || undefined,
            createdAt: chatRoom.messages[0].createdAt!,
            messageType: chatRoom.messages[0].messageType!
          } : undefined,
        };

        set((state) => ({
          chatRooms: {
            ...state.chatRooms,
            [chatRoom.id]: storedRoom,
          },
        }));
      },
      
      // 设置当前活跃的聊天室ID
      setActiveChatRoomId: (chatRoomId: string | null) => {
        set({ activeChatRoomId: chatRoomId });
      },
      
      // 获取聊天室参与者
      getChatRoomParticipants: (chatRoomId: string) => {
        const chatRoom = get().chatRooms[chatRoomId];
        return chatRoom?.participants;
      },

      // 获取其他参与者
      getOtherParticipant: (chatRoomId: string, loginUserId: string) => {
        const participants = get().getChatRoomParticipants(chatRoomId);
        return participants?.find(p => p.userId !== loginUserId);
      },
      
      // 清除所有聊天室数据
      clearChatRooms: () => {
        set({ chatRooms: {}, activeChatRoomId: null });
      },
    }),
    {
      name: 'chat-storage', // 本地存储的键名
      partialize: (state) => ({ 
        chatRooms: state.chatRooms,
        // 不持久化activeChatRoomId
      }),
    }
  )
);