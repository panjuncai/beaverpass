'use client'
import { TabBar } from 'antd-mobile';
import { SearchOutline, CameraOutline, ReceivePaymentOutline, MessageOutline, } from 'antd-mobile-icons'
import { usePathname, useRouter } from 'next/navigation'
// import Recycle from '../icons/recycle';

export default function Footer() {
  const pathname = usePathname()
  const router = useRouter()
  const tabs = [
    { key: '/search', title: 'Search', icon: <SearchOutline /> },
    { key: '/post', title: 'Post', icon: <CameraOutline /> },
    {key:'/inbox', title:'Inbox', icon:<MessageOutline />},
    { key: '/deals', title: 'Deals', icon: <ReceivePaymentOutline /> },
    // {
    //   key: '/recycle',
    //   title: 'Donate',
    //   icon: <Recycle color={pathname === '/recycle' ? 'var(--adm-color-primary)' : undefined} />
    // }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
      <TabBar activeKey={pathname} className="pb-safe">
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
  )
}