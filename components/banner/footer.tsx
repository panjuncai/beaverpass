'use client'
import { TabBar } from 'antd-mobile';
import { SearchOutline, CameraOutline, ReceivePaymentOutline, MessageOutline, } from 'antd-mobile-icons'
import { usePathname, useRouter } from 'next/navigation'
// import Recycle from '../icons/recycle';

export default function Footer() {
  const pathname = usePathname()
  const router = useRouter()
  
  // 如果是聊天详情页面，不显示底部导航栏
  if (pathname.startsWith('/chat/')) {
    return null;
  }
  
  const tabs = [
    { key: '/search', title: 'Search', icon: <SearchOutline /> },
    { key: '/post', title: 'Post', icon: <CameraOutline /> },
    { key: '/inbox', title:'Inbox', icon:<MessageOutline />},
    { key: '/deals', title: 'Deals', icon: <ReceivePaymentOutline /> },
    // {
    //   key: '/recycle',
    //   title: 'Donate',
    //   icon: <Recycle color={pathname === '/recycle' ? 'var(--adm-color-primary)' : undefined} />
    // }
  ]

  return (
    <div className="pb-safe fixed bottom-0 left-0 right-0 bg-[#FFFFFF] shadow-[0px_2px_48px_0px_rgba(0,0,0,0.12)] h-[3.6rem] flex justify-center">
      <div className="w-full max-w-screen-md mx-auto h-[3.6rem] bg-[#FFFFFF] flex items-center justify-center">
        <TabBar activeKey={pathname} className="w-full">
          {tabs.map(item => (
            <TabBar.Item
              key={item.key}
              icon={item.icon}
              title={item.title}
              onClick={() => router.push(item.key)}
            />
          ))}
        </TabBar>
      </div>
    </div>
  )
}