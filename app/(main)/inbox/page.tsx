"use client";

import React, {useEffect } from "react";
// import {Avatar, Badge } from "antd-mobile";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
// import { trpc } from "@/lib/trpc/client";
import NoLogin from "@/components/utils/no-login";
// import formatTime from "@/utils/tools/format-time";

export default function InboxPage() {
  const router = useRouter();
  const { loginUser } = useAuthStore();
  // const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    // 将inbox页面重定向到chat页面
    router.replace('/chat');
  }, [router]);

  // 获取聊天室列表
  // const chatRoomsQuery = trpc.chat.getChatRooms.useQuery(
  //   { userId: loginUser?.id || "" },
  //   {
  //     enabled: !!loginUser,
  //     refetchInterval: 10000, // 每10秒刷新一次
  //   }
  // );

  if (!loginUser) {
    return (
      <div className="flex flex-col h-full justify-center">
        <NoLogin />
      </div>
    );
  }
  
  // 根据不同类型筛选聊天室
  // const filterChatRooms = (type: string) => {
  //   if (!chatRoomsQuery.data) return [];
    
  //   switch (type) {
  //     case "buying":
  //       // 筛选买家聊天室的逻辑
  //       return chatRoomsQuery.data.filter(room => 
  //         room.messages?.[0]?.post?.posterId !== loginUser.id
  //       );
  //     case "selling":
  //       // 筛选卖家聊天室的逻辑
  //       return chatRoomsQuery.data.filter(room => 
  //         room.messages?.[0]?.post?.posterId === loginUser.id
  //       );
  //     default:
  //       return chatRoomsQuery.data;
  //   }
  // };

  // const renderChatList = (type: string) => {
  //   const filteredRooms = filterChatRooms(type);
    
  //   if (chatRoomsQuery.isLoading) {
  //     return (
  //       <div className="flex justify-center items-center h-64">
  //         <div className="loading loading-spinner loading-lg"></div>
  //       </div>
  //     );
  //   }

  //   if (filteredRooms.length === 0) {
  //     return (
  //       <div className="flex justify-center items-center h-64 text-gray-500">
  //         No messages found
  //       </div>
  //     );
  //   }

  //   return (
  //     <div className="divide-y divide-gray-200">
  //       {filteredRooms.map((room) => {
  //         // 找到对方用户
  //         const otherParticipant = room.participants.find(
  //           (p) => p.userId !== loginUser?.id
  //         );
          
  //         // 最后一条消息
  //         const lastMessage = room.messages?.[0];
  //         const postTitle = lastMessage?.post?.title || "";
          
  //         // 消息预览
  //         let messagePreview = "";
  //         if (lastMessage?.content) {
  //           messagePreview = lastMessage.content;
  //         } else if (lastMessage?.post) {
  //           messagePreview = lastMessage.post.description;
  //         }
          
  //         // 未读数量 (这个功能需要后端支持)
  //         const unreadCount = 1; // 示例值，实际应从API获取
          
  //         return (
  //           <div
  //             key={room.id}
  //             className="flex items-center py-3 px-4 cursor-pointer hover:bg-gray-50"
  //             onClick={() => router.push(`/chat/${room.id}`)}
  //           >
  //             <div className="relative mr-3">
  //               <Avatar
  //                 src={otherParticipant?.user?.avatar || "/default-avatar.png"}
  //                 style={{ "--size": "48px", borderRadius: "50%" }}
  //               />
  //               {unreadCount > 0 && (
  //                 <Badge
  //                   content={unreadCount}
  //                   color="red"
  //                   style={{ 
  //                     position: "absolute", 
  //                     top: "-3px", 
  //                     right: "-3px"
  //                   }}
  //                 />
  //               )}
  //             </div>
              
  //             <div className="flex-1 min-w-0">
  //               <div className="flex justify-between items-start">
  //                 <div className="font-medium text-base truncate max-w-[70%] text-black">
  //                   {postTitle || "Conversation"}
  //                 </div>
  //                 <div className="text-xs text-gray-500">
  //                   {formatTime(lastMessage?.createdAt as Date)}
  //                 </div>
  //               </div>
  //               <div className="flex items-center mt-1">
  //                 <Avatar
  //                   src={otherParticipant?.user?.avatar || "/default-avatar.png"}
  //                   style={{ "--size": "16px", borderRadius: "50%" }}
  //                 />
  //                 <span className="ml-1 text-sm text-gray-600 truncate">
  //                   {messagePreview}
  //                 </span>
  //               </div>
  //             </div>
  //           </div>
  //         );
  //       })}
  //     </div>
  //   );
  // };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin w-8 h-8 border-t-2 border-lime-600 rounded-full"></div>
    </div>
  );
}