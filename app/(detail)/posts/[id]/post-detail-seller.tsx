'use client';
import { SerializedPost } from "@/lib/types/post";
import Verified from "@/components/icons/verified";
import { Avatar, Rate } from "antd-mobile";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import MessageModal from "@/components/modals/message-modal";
import { useRef } from "react";

export default function PostDetailMainSeller({
  post,
}: {
  post: SerializedPost | null;
}) {
  const router = useRouter();
  const { loginUser } = useAuthStore();
  const utils = trpc.useUtils();
  const dialogRef = useRef<HTMLDialogElement>(null)
  // 创建聊天室的 mutation
  const createChatRoomMutation = trpc.chat.createChatRoom.useMutation({
    onSuccess: (chatRoom) => {
      // 聊天室创建成功后，导航到聊天页面
      utils.chat.getChatRooms.invalidate();
      router.push(`/chat/${chatRoom.id}`);
    },
    onError: (error) => {
      console.error("Failed to create chat room:", error);
      console.log("Failed to create chat");
    },
  });

  const handleChatClick = async () => {
    if (!loginUser || !post?.poster?.id) {
      console.log("Please login first");
      return;
    }

    // 如果当前用户是商品的发布者，不允许与自己聊天
    if (loginUser.id === post.poster.id) {
      console.log("You cannot chat with yourself");
      return;
    }

    try {
      // 创建聊天室并发送商品消息
      await createChatRoomMutation.mutateAsync({
        participantIds: [post.poster.id],
        postId: post.id,
      });
    } catch (error) {
      console.error("Error in handleChatClick:", error);
    }
  };

  return (
    <><MessageModal 
    title="Please login first"
    content="You need to login to buy the product"
    dialogRef={dialogRef}
    redirectUrl="/login"
  />
    <div className="mt-4 flex gap-4 shadow-sm p-2">
      <Avatar src={post?.poster?.avatar || '1'} style={{ '--size': '64px' }}  />
      <div className="flex-1 flex flex-col">
        <div className="flex gap-2 items-center">
          <span className="text-lg font-bold">{post?.poster?.firstName}</span>
          <span className="text-sm text-gray-500"> </span>
          <span className="text-lg font-bold">{post?.poster?.lastName}</span>
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
          <button
            className="w-20 h-5 bg-yellow-900 rounded-3xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loginUser?.id === post?.poster?.id || createChatRoomMutation.isLoading}
            onClick={() => {
              if (!loginUser?.id) {
                dialogRef.current?.showModal()
                return;
              }
              void handleChatClick()
            }}
          >
            {createChatRoomMutation.isLoading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <span className="text-center text-white text-xs font-bold font-['Poppins'] uppercase tracking-wide">chat</span>
            )}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
