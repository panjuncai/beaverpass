import { ChatRoomOutput, trpc } from '@/lib/trpc/client';
import { Empty, List, Avatar, Badge, Skeleton } from 'antd-mobile';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { MessageType } from '@/lib/types/enum';
import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/lib/store/chat-store';
import { useEffect, useState } from 'react';

export default function InboxList() {
    const { loginUser } = useAuthStore();
    const router = useRouter();
    const { chatRooms: storedChatRooms, setChatRoom, setActiveChatRoomId, getOtherParticipant } = useChatStore();
    // 使用本地状态保存转换后的聊天室列表
    const [localChatRooms, setLocalChatRooms] = useState<ChatRoomOutput[]>([]);
    const [isLocalDataLoaded, setIsLocalDataLoaded] = useState(false);
    
    // 获取服务器聊天室列表
    const { isLoading } = trpc.chat.getChatRooms.useQuery(
      { userId: loginUser?.id || '' },
      { 
        enabled: !!loginUser?.id,
        onSuccess: (data) => {
          // 当服务器数据加载成功，更新本地状态并保存到store
          if (data && data.length > 0) {
            setLocalChatRooms(data);
            
            // 保存每个聊天室到store - 现在直接传入ChatRoomOutput
            data.forEach(chatRoom => {
              setChatRoom(chatRoom);
            });
          }
        }
      }
    );
    
    // 初始化时从本地存储加载聊天室数据
    useEffect(() => {
      if (!loginUser?.id || isLocalDataLoaded) return;
      
      // 将存储的聊天室对象转换为ChatRoomOutput格式
      const convertedRooms = Object.values(storedChatRooms).map(room => {
        return {
          id: room.id,
          participants: room.participants,
          messages: room.lastMessage ? [{
            id: room.lastMessage.id,
            content: room.lastMessage.content || '',
            createdAt: room.lastMessage.createdAt,
            messageType: room.lastMessage.messageType
          }] : [],
          createdAt: null,
          updatedAt: null
        } as unknown as ChatRoomOutput;
      });
      
      if (convertedRooms.length > 0) {
        setLocalChatRooms(convertedRooms);
      }
      
      setIsLocalDataLoaded(true);
    }, [loginUser?.id, storedChatRooms, isLocalDataLoaded]);
  
    // 处理点击聊天室 - 直接使用ChatRoomOutput
    const handleChatRoomClick = (chatRoom: ChatRoomOutput) => {
      // 保存到store
      setChatRoom(chatRoom);
      
      // 设置当前聊天室
      setActiveChatRoomId(chatRoom.id);
      
      // 导航到聊天页面
      router.push(`/chat/${chatRoom.id}`);
    };
  
    // 如果没有数据，显示空状态
    if (isLocalDataLoaded && !isLoading && localChatRooms.length === 0) {
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
      // const otherParticipant = chatRoom.participants.find(
      //   (p) => p.userId !== loginUser?.id
      // );
      const otherParticipant = getOtherParticipant(chatRoom.id, loginUser?.id || '');
      
      if (!otherParticipant || !otherParticipant) return 'Unknown user';
      
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
  
    // 渲染骨架屏
    const renderSkeleton = () => {
      return (
        <div className="pb-safe">
          <List>
            {[1, 2, 3, 4].map((index) => (
              <List.Item
                key={index}
                prefix={
                  <Skeleton
                    animated
                    style={{
                      '--width': '48px',
                      '--height': '48px',
                      '--border-radius': '20%',
                    }}
                    className='mb-2 mt-2'
                  />
                }
                description={
                  <Skeleton
                    animated
                    style={{
                      '--width': '60%',
                      '--height': '16px',
                    }}
                  />
                }
                extra={
                  <Skeleton
                    animated
                    style={{
                      '--width': '60px',
                      '--height': '16px',
                    }}
                  />
                }
              >
                {/* <Skeleton
                  animated
                  style={{
                    '--width': '120px',
                    '--height': '20px',
                  }}
                /> */}
              </List.Item>
            ))}
          </List>
        </div>
      );
    };
  
    // 如果正在加载，但没有本地数据，显示骨架屏
    if (isLoading && localChatRooms.length === 0 && !isLocalDataLoaded) {
      return renderSkeleton();
    }
  
    // 显示聊天室列表（优先显示本地数据，然后在服务器数据更新时更新视图）
    return (
      <div className="pb-safe">
        <List>
          {localChatRooms.map(chatRoom => (
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
              onClick={() => handleChatRoomClick(chatRoom)}
            >
              {getOtherParticipantName(chatRoom)}
            </List.Item>
          ))}
        </List>
      </div>
    );
}