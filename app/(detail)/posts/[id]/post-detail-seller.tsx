'use client';
import { SerializedPost } from "@/lib/types/post";
import Verified from "@/components/icons/verified";
import { Avatar, Rate } from "antd-mobile";
import { trpc } from "@/lib/trpc/client";
// import { useRouter } from "next/navigation";
export default function PostDetailMainSeller({
  post,
}: {
  post: SerializedPost | null;
}) {
  //   const router = useRouter();
  const { data: userData } = trpc.auth.getUser.useQuery();
  const currentUser = userData?.user;

  const handleChatClick = () => {
    // if (existingRoom) {
    //     // 先发送商品
    //     await sendMessage({
    //       roomId: existingRoom._id,
    //       postId: post?.id,
    //       messageType: 'post'
    //     }).unwrap();
    //     // 如果已有聊天室，直接跳转
    //     void navigate(`/chat/${existingRoom._id}`,{
    //       state:{
    //         chatRoom: existingRoom
    //       }
    //     });
    //   } else {
    //     // 创建新聊天室并发送商品消息
    //     const room = await createChatRoom({
    //       sellerId: sellerId
    //     }).unwrap();
    //     await sendMessage({
    //       roomId: room._id,
    //       postId: post?.id,
    //       messageType: 'post'
    //     }).unwrap();
    //     void navigate(`/chat/${room._id}`,{
    //       state:{
    //         chatRoom: room
    //       }
    //     });
    //   }
    // } catch (error) {
    //   console.log('error', error);
    //   Toast.show({
    //     content: 'Failed to create chat',
    //     icon: 'fail'
    //   });
    // }
  };
  return (
    <div className="mt-4 flex gap-4 shadow-sm p-2">
      <Avatar src={post?.poster?.avatar || '/default-avatar.png'} style={{ '--size': '64px' }}  />
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
            className="btn btn-sm btn-primary"
            disabled={currentUser?.id === post?.poster?.id}
            onClick={() => void handleChatClick()}
          >
            Chat
          </button>
        </div>
      </div>
    </div>
  );
}
