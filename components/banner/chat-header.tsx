'use client';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { LeftOutline } from 'antd-mobile-icons';
import { trpc } from '@/lib/trpc/client';

export default function ChatHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const chatRoomId = typeof params?.id === 'string' ? params.id : '';
  
  // 获取聊天室信息（如果在聊天详情页）
  const { data: chatRoom } = trpc.chat.getChatRoomById.useQuery(
    { chatRoomId },
    { enabled: !!chatRoomId && pathname.includes('/chat/') }
  );
  
  // 获取聊天对象信息
  const otherParticipant = chatRoom?.participants?.find(p => p.user.id !== chatRoom.currentUserId)?.user;
  
  // 标题显示逻辑
  const getPageTitle = () => {
    if (pathname === '/chat') {
      return 'Inbox';
    } else if (pathname.includes('/chat/') && otherParticipant) {
      return otherParticipant.firstName + ' ' + otherParticipant.lastName || 'Chat';
    }
    return 'Chat';
  };

  return (
    <header className="sticky top-0 z-10 navbar shadow-sm border-b border-gray-200 bg-white">
      <div className="flex-none w-[24px]">
        <LeftOutline 
          className="cursor-pointer" 
          fontSize={20} 
          onClick={() => pathname === '/chat' ? router.push('/search') : router.back()} 
        />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
      </div>
      <div className="flex-none w-[24px]">
        {/* 预留右侧按钮空间，保持对称 */}
      </div>
    </header>
  );
} 