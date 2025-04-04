import { MessageStatus, MessageType } from "@/lib/types/enum";
import { useCallback, useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useLocalStorage } from "./useLocalStorage";
import { v4 as uuidv4 } from "uuid";
import { trpc } from "../trpc/client";
// 定义消息接口
// interface ChatMessage {
//   id: string;
//   chatRoomId: string;
//   senderId: string;
//   content?: string;
//   postId?: string;
//   messageType: keyof typeof MessageType;
//   createdAt: Date;
//   status: MessageStatus;
//   isTemporary?: boolean;
//   retryCount?: number;
//   errorMessage?: string;
// }

// 数据库消息结构
interface DatabaseMessage {
  id: string;
  chat_room_id: string;
  sender_id?: string;
  content?: string;
  post_id?: string;
  message_type: string;
  status?: string;
  created_at?: string;
  temporary_id?: string;
}

export function useSupabaseChat(userId: string, chatRoomId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pendingMessages, setPendingMessages, clearPendingMessages] =
    useLocalStorage<DatabaseMessage[]>(`pending_messages_${userId}`, []);

  // 占个坑后续改
  useEffect(() => {
    setIsReconnecting(false);
  }, []);

  useEffect(() => {
    return () => {
      clearAllPendingMessages();
    };
  }, []); // 空依赖项数组

  // 清理所有本地消息的方法
  const clearAllPendingMessages = useCallback(() => {
    clearPendingMessages();
    console.log("🧹🧹🧹 清理所有本地消息");
  }, [clearPendingMessages]);

  // Supabase客户端
  const supabase = createClientComponentClient();

  // 获取TRPC mutation
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();

  // 初始化状态
  useEffect(() => {
    if (!userId || !chatRoomId || !supabase) return;

    setIsConnected(true);
    setError(null);
  }, [userId, chatRoomId, supabase]);

  // 离开聊天室时清理本地消息
  //   useEffect(() => {
  //     // 组件卸载时清理
  //     return () => {
  //       // 仅清理 sent 或 delivered 状态的消息，保留 failed 和 sending 状态的消息，以便重新进入时可以重试
  //       setPendingMessages(prev =>
  //         prev.filter(msg =>
  //           msg.status === MessageStatus.FAILED ||
  //           msg.status === MessageStatus.SENDING
  //         )
  //       );
  //       console.log("🧹🧹🧹 清理已发送的本地消息");
  //     };
  //   }, [setPendingMessages]);

  // 订阅聊天室变更
  useEffect(() => {
    if (!userId || !chatRoomId || !supabase || !isConnected) return;

    try {
      // 创建聊天室频道
      const channel = supabase
        .channel(`chat-${chatRoomId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `chat_room_id=eq.${chatRoomId}`,
          },
          (payload) => {
            if (payload.new) {
              // 如果有临时ID，移除本地待确认消息
              const newMsg = payload.new as DatabaseMessage;
              if (newMsg.temporary_id) {
                // 找出并更新相同temporary_id的本地消息
                setPendingMessages((prevMessages) => {
                  // 查找是否存在匹配的临时消息
                  const msgIndex = prevMessages.findIndex(
                    (msg) => msg.temporary_id === newMsg.temporary_id
                  );

                  if (msgIndex !== -1) {
                    // 如果找到匹配的消息，用新消息替换它
                    const updatedMessages = [...prevMessages];
                    updatedMessages[msgIndex] = {
                      ...newMsg,
                    };
                    console.log("🔄🔄🔄 更新本地消息:", newMsg.temporary_id);
                    return updatedMessages;
                  } else {
                    // 如果没有找到匹配的消息,直接丢弃此记录
                    return prevMessages;
                  }
                });
              }
            }
            console.log("🔔🔔🔔 REALTIME MESSAGE RECEIVED:", payload);
            console.log("🚀🚀🚀 NEW MESSAGE:", payload.new);
          }
        )
        .subscribe((status) => {
          console.log("😁😁😁 Supabase channel status:", status);
          if (status === "SUBSCRIBED") {
            setIsConnected(true);
          } else if (status === "CHANNEL_ERROR") {
            console.error(
              "🚨🚨🚨 Error connecting to chat room channel:",
              chatRoomId
            );
            setError(new Error("Failed to connect to chat room"));
            setIsConnected(false);
          }
        });
      return () => {
        channel.unsubscribe();
      };
    } catch (error) {
      console.error("🚨🚨🚨 Error subscribing to chat room:", error);
      setError(error as Error);
      setIsConnected(false);
    }
  }, [userId, chatRoomId, supabase, isConnected, setPendingMessages]);

  // 发送消息
  const sendMessage = useCallback(
    (params: {
      chatRoomId: string;
      content?: string;
      postId?: string;
      messageType: keyof typeof MessageType;
    }) => {
      if (!userId) return { success: false, error: "User not logged in" };
      const { chatRoomId, content, postId, messageType } = params;
      const temporaryId = uuidv4();
      const now = new Date();

      // 创建新消息对象
      const newMessage: Omit<DatabaseMessage, "id"> = {
        chat_room_id: chatRoomId,
        sender_id: userId,
        content,
        post_id: postId,
        message_type: messageType,
        status: MessageStatus.SENDING,
        created_at: now.toISOString(),
        temporary_id: temporaryId,
      };

      // 添加到本地待处理消息列表(乐观更新)
      setPendingMessages((prev) => [...prev, newMessage as DatabaseMessage]);

      // 通过trpc发送消息
      sendMessageMutation.mutate(
        {
          temporaryId,
          chatRoomId,
          content,
          postId,
          messageType,
        },
        {
          onError: (error) => {
            console.error("🚨🚨🚨 Failed to send message:", error);
            // 更新消息状态为失败
            setPendingMessages((prev) =>
              prev.map((msg) =>
                msg.temporary_id === temporaryId
                  ? { ...msg, status: MessageStatus.FAILED }
                  : msg
              )
            );
          },
        }
      );

      // 返回临时ID供调用者使用
      return { success: true, message: newMessage };
    },
    [userId, setPendingMessages, sendMessageMutation]
  );
  return {
    isConnected,
    isReconnecting,
    error,
    pendingMessages,
    sendMessage,
    // clearAllPendingMessages,
  };
}
