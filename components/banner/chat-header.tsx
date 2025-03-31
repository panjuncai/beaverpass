'use client';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { LeftOutline } from 'antd-mobile-icons';
import { trpc } from '@/lib/trpc/client';
import NavRight from './nav-right';

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
      if (otherParticipant.firstName && otherParticipant.lastName) {
        return otherParticipant.firstName + ' ' + otherParticipant.lastName;
      } else {
        return otherParticipant.email;
      }
    }
    return '';
  };

  return (
    <header className="sticky top-0 z-10 pt-safe navbar shadow-sm border-b border-gray-200 bg-white">
      <div className="flex-none w-[24px]">
        {/* <LeftOutline 
          className="cursor-pointer" 
          fontSize={20} 
          onClick={() => pathname === '/chat' ? router.push('/search') : router.back()} 
        /> */}
        <button 
            className="btn btn-ghost btn-circle"
            onClick={() => router.back()}
          >
            <LeftOutline fontSize={24} />
          </button>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-center justify-start text-zinc-600 text-base font-semibold font-['Poppins'] tracking-wide">{getPageTitle()}</h1>
      </div>
        {/* 预留右侧按钮空间，保持对称 */}
        <NavRight />
    </header>
  );
} 