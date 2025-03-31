import { ChatRoomOutput, trpc } from '@/lib/trpc/client';
import { Empty, List, Avatar, Badge } from 'antd-mobile';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { MessageType } from '@/lib/types/enum';
import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from 'next/navigation';
export default function InboxList() {
    const { loginUser } = useAuthStore();
    const router = useRouter();
    // 获取聊天室列表
  const { data: chatRooms, isLoading } = trpc.chat.getChatRooms.useQuery(
    { userId: loginUser?.id || '' },
    { enabled: !!loginUser?.id }
  );
  
  // 如果没有数据，显示空状态
  if (!isLoading && (!chatRooms || chatRooms.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <Empty
          imageStyle={{ width: 128 }}
          description="No chat history"
        />
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-lime-600 text-white rounded-full"
            onClick={() => router.push('/search')}
          >
            Go shopping
          </button>
        </div>
      </div>
    );
  }
  
  // 格式化最后消息时间
  const formatLastMessageTime = (date: Date | null) => {
    if (!date) return '';
    
    const now = new Date();
    const messageDate = new Date(date);
    
    // 如果是今天的消息，显示时间
    if (messageDate.toDateString() === now.toDateString()) {
      return format(messageDate, 'HH:mm', { locale: zhCN });
    }
    
    // 如果是昨天的消息，显示"昨天"
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // 如果是今年的消息，显示月日
    if (messageDate.getFullYear() === now.getFullYear()) {
      return format(messageDate, 'MM-dd', { locale: zhCN });
    }
    
    // 否则显示年月日
    return format(messageDate, 'yyyy-MM-dd', { locale: zhCN });
  };
  
  // 获取聊天对象名称
  const getOtherParticipantName = (chatRoom:ChatRoomOutput) => {
    const otherParticipant = chatRoom.participants.find(
      (p) => p.userId !== loginUser?.id
    );
    
    if (!otherParticipant || !otherParticipant.user) return 'Unknown user';
    
    const firstName = otherParticipant.user.firstName || '';
    const lastName = otherParticipant.user.lastName || '';
    
    return firstName || lastName 
      ? `${firstName} ${lastName}`.trim()
      : otherParticipant.user.email;
  };
  
  // 获取最后一条消息的预览
  const getLastMessagePreview = (chatRoom: ChatRoomOutput) => {
    if (!chatRoom.messages || chatRoom.messages.length === 0) {
      return 'No messages';
    }
    
    const lastMessage = chatRoom.messages[0];
    
    if (lastMessage.messageType === MessageType.TEXT) {
      return lastMessage.content || '';
    } else if (lastMessage.messageType === MessageType.POST) {
      return '[Post message]';
    } else {
      return 'Unknown message type';
    }
  };
  
  // 检查是否有未读消息
  // const hasUnreadMessages = (chatRoom: ChatRoomOutput) => {
  //   if (!chatRoom.messages || chatRoom.messages.length === 0) {
  //     return false;
  //   }
    
  //   const lastMessage = chatRoom.messages[0];
    
  //   // 如果最后一条消息是自己发的，则没有未读消息
  //   if (lastMessage.senderId === loginUser?.id) {
  //     return false;
  //   }
    
  //   // 检查是否已读
  //   const readBy = lastMessage.readBy || [];
  //   return !readBy.some((read: any) => read.userId === loginUser?.id);
  // };
  return (
<div className="pb-safe">
      <List>
        {chatRooms?.map(chatRoom => (
          <List.Item
            key={chatRoom.id}
            prefix={
              <Badge
                style={{ 
                  '--right': '0px', 
                  '--top': '0px',
                  // display: hasUnreadMessages(chatRoom) ? 'block' : 'none'
                }}
                content={Badge.dot}
              >
                <Avatar
                  src={chatRoom.participants.find((p) => p.userId !== loginUser?.id)?.user?.avatar || '1'}
                  style={{ '--size': '48px' }}
                />
              </Badge>
            }
            description={getLastMessagePreview(chatRoom)}
            extra={
              <div className="text-xs text-gray-500">
                {chatRoom.messages && chatRoom.messages.length > 0
                  ? formatLastMessageTime(chatRoom.messages[0].createdAt)
                  : ''}
              </div>
            }
            arrow={false}
            onClick={() => router.push(`/chat/${chatRoom.id}`)}
          >
            {getOtherParticipantName(chatRoom)}
          </List.Item>
        ))}
      </List>
    </div>
  )
}