'use client'
import { TabBar } from 'antd-mobile';
import { SearchOutline, CameraOutline, } from 'antd-mobile-icons'
import { usePathname, useRouter } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()
  const router = useRouter()
  const tabs = [
    { key: '/search', title: 'Search', icon: <SearchOutline /> },
    { key: '/post', title: 'Post', icon: <CameraOutline /> },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200">
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