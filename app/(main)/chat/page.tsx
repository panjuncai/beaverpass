"use client";

import { useAuthStore } from "@/lib/store/auth-store";
import { trpc } from "@/lib/trpc/client";
// import { MessageType } from "@/lib/types/enum";
// import Link from "next/link";
import { useEffect, useState } from "react";
import NoLogin from "@/components/utils/no-login";
// import { ChatRoomWithParticipants } from "@/lib/types/chat";

export default function ChatPage() {
  const { loginUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  const chatRoomsQuery = trpc.chat.getChatRooms.useQuery(
    { userId: loginUser?.id || "" },
    {
      enabled: !!loginUser,
      onSuccess: () => setLoading(false),
      onError: () => setLoading(false),
    }
  );

  useEffect(() => {
    // 设置一个超时，如果加载时间太长，停止显示加载状态
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!loginUser) {
    return (
      <div className="flex flex-col h-full justify-center">
        <NoLogin />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      )}

      {!loading && chatRoomsQuery.isError && (
        <div className="text-center text-error py-10">
          Error loading messages. Please try again.
        </div>
      )}

      {!loading && chatRoomsQuery.data?.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No messages yet.</p>
        </div>
      )}

      <div className="space-y-4">
        {/* {chatRoomsQuery.data?.map((chatRoom: ChatRoomWithParticipants) => {
          // 找到对方用户（非当前用户）
          const otherParticipant = chatRoom.participants.find(
            (p) => p.userId !== loginUser.id
          );
          
          // 最后一条消息
          const lastMessage = chatRoom.messages && chatRoom.messages[0];
          
          // 消息预览文本
          let messagePreview = "No messages yet";
          if (lastMessage) {
            if (lastMessage.messageType === MessageType.TEXT) {
              messagePreview = lastMessage.content || "";
            } else if (lastMessage.messageType === MessageType.POST) {
              messagePreview = "Shared a product";
            }
          }
          
          return (
            <Link
              key={chatRoom.id}
              href={`/chat/${chatRoom.id}`}
              className="block"
            >
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-12 h-12 rounded-full">
                      <img
                        src={otherParticipant?.user.avatar || "/default-avatar.png"}
                        alt={`${otherParticipant?.user.firstName}'s avatar`}
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium truncate">
                        {otherParticipant?.user.firstName} {otherParticipant?.user.lastName}
                      </h3>
                      {lastMessage && (
                        <span className="text-xs text-gray-500">
                          {new Date(lastMessage.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{messagePreview}</p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })} */}
      </div>
    </div>
  );
}
