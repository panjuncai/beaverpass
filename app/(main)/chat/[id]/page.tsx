"use client";

import { useAuthStore } from "@/lib/store/auth-store";
import { trpc, MessageOutput } from "@/lib/trpc/client";
import { MessageType } from "@/lib/types/enum";
// import { MessageWithSender } from "@/lib/types/chat";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import NoLogin from "@/components/utils/no-login";
import ChatMessage from "@/app/(main)/chat/[id]/ChatMessage";
import { Avatar } from "antd-mobile";
import { Rate } from "antd-mobile";
import Verified from "@/components/icons/verified";
import { HeartOutline } from "antd-mobile-icons";

interface PageProps {
  params: Promise<{ id: string }> | undefined;
}
export default function ChatRoomPage({ params }: PageProps) {
  const { loginUser } = useAuthStore();
  // const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<MessageOutput[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 直接使用 params.id，保留兼容性
  // 注意: 未来版本的 Next.js 将要求使用 React.use() 解包 params
  // 例如: const unwrappedParams = React.use(params as any); const chatRoomId = unwrappedParams.id;
  // const chatRoomId = params.id;
  const unwrappedParams = React.use(params!);
  const chatRoomId = unwrappedParams.id;

  // 获取聊天室消息
  const messagesQuery = trpc.chat.getMessages.useQuery(
    { chatRoomId },
    {
      enabled: !!loginUser && !!chatRoomId,
      onSuccess: (data) => {
        setLoading(false);
        // 直接使用返回的数据，不需要类型断言
        setMessages(data.reverse());
      },
      onError: () => {
        setLoading(false);
      },
    }
  );

  // 获取聊天室信息（主要用于获取参与者信息）
  const chatRoomsQuery = trpc.chat.getChatRooms.useQuery(
    { userId: loginUser?.id || "" },
    {
      enabled: !!loginUser,
      select: (data) => data.find((room) => room.id === chatRoomId),
    }
  );

  // 发送消息 mutation
  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: (newMessage) => {
      // 使用推断的类型
      setMessages((prev) => [...prev, newMessage as MessageOutput]);
      setMessageText("");
    },
    onError: (error) => {
      console.error("发送消息失败:", error);
    }
  });

  // 滚动到最新消息
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 处理发送消息
  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !loginUser) return;

    try {
      sendMessageMutation.mutate({
        chatRoomId,
        content: messageText,
        messageType: MessageType.TEXT,
      });
    } catch (error) {
      console.error("发送消息出错:", error);
    }
  };

  if (!loginUser) {
    return (
      <div className="flex flex-col h-full justify-center">
        <NoLogin />
      </div>
    );
  }

  // 找到对方用户（非当前用户）
  const otherParticipant = chatRoomsQuery.data?.participants.find(
    (p) => p.userId !== loginUser.id
  );

  return (
    <div className="flex flex-col h-full">
      {/* 聊天室标题 */}
      <div className="flex gap-4 bg-base-100 p-4 border-b border-gray-200">
      <Avatar src={otherParticipant?.user?.avatar || '/default-avatar.png'} style={{ '--size': '64px' }}  />
      <div className="flex-1 flex flex-col">
        <div className="flex gap-2 items-center">
          <span className="text-lg font-bold">{otherParticipant?.user?.firstName}</span>
          <span className="text-sm text-gray-500"> </span>
          <span className="text-lg font-bold">{otherParticipant?.user?.lastName}</span>
          <span className="flex items-center">
            <Verified />
            <span className="text-sm text-green-600">Verified</span>
          </span>
        </div>
        <div className="text-sx text-gray-700">from Algonquin College</div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rate allowHalf readOnly defaultValue={4} />
            <span className="text-lg">4.0</span>
          </div>
          <HeartOutline fontSize={36} className="hover:cursor-pointer" />
        </div>
      </div>
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        )}

        {!loading && messagesQuery.isError && (
          <div className="text-center text-error py-10">
            Error loading messages. Please try again.
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">No messages yet. Start a conversation!</p>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isOwnMessage={message.senderId === loginUser.id}
          />
        ))}
        <div className="h-20"></div>
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="fixed bottom-0 left-0 right-0 bg-base-100 p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="input input-bordered flex-1"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!messageText.trim() || sendMessageMutation.isLoading}
          >
            {sendMessageMutation.isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 