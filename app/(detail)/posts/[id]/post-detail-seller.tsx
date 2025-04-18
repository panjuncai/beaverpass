"use client";
import { SerializedPost } from "@/lib/types/post";
import Verified from "@/components/icons/verified";
import { Avatar, Rate, Button, ImageViewer } from "antd-mobile";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import MessageModal from "@/components/modals/message-modal";
import { useRef, useState } from "react";
import isEduEmail from "@/utils/tools/isEduEmail";

export default function PostDetailMainSeller({
  post,
}: {
  post: SerializedPost | null;
}) {
  const router = useRouter();
  const { loginUser } = useAuthStore();
  const utils = trpc.useUtils();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [visible, setVisible] = useState(false);
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

  const fullAvatar = (
    <ImageViewer
      image={post?.poster?.avatar || "1"}
      visible={visible}
      onClose={() => {
        setVisible(false);
      }}
    />
  );

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
    <>
      <MessageModal
        title="Please login first"
        content="You need to login to buy the product"
        dialogRef={dialogRef}
        redirectUrl="/login"
      />
      <div className="mt-4 flex gap-4 shadow-sm p-2">
        <Avatar
          src={post?.poster?.avatar || "1"}
          style={{ "--size": "64px" }}
          onClick={() => {
            setVisible(true);
          }}
        />
        <div className="flex-1 flex flex-col">
          <div className="flex gap-2 items-center">
            <span className="text-lg font-bold">{post?.poster?.firstName}</span>
            <span className="text-sm text-gray-500"> </span>
            <span className="text-lg font-bold">{post?.poster?.lastName}</span>
            {post?.poster?.email &&
            (isEduEmail(post?.poster?.email) ||
              post?.poster?.schoolEmailVerified) ? (
              <span className="flex items-center">
                <Verified verified={true} />
                <span className="text-sm text-green-600">Verified</span>
              </span>
            ) : null}
          </div>
          <div className="text-sx text-gray-700"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Rate allowHalf readOnly defaultValue={4} />
              <span className="text-lg">4.0</span>
            </div>
            <Button
              color="primary"
              size="mini"
              shape="rounded"
              loading={createChatRoomMutation.isLoading}
              disabled={
                loginUser?.id === post?.poster?.id ||
                createChatRoomMutation.isLoading
              }
              onClick={() => {
                if (!loginUser?.id) {
                  dialogRef.current?.showModal();
                  return;
                }
                void handleChatClick();
              }}
            >
              Chat
            </Button>
          </div>
        </div>
      </div>
      {fullAvatar}
    </>
  );
}
