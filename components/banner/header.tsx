import Image from "next/image";
import NavRight from "./nav-right";
import { useRouter, usePathname } from "next/navigation";
import { LeftOutline } from "antd-mobile-icons";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  
  // 根据路径渲染标题或Logo
  const renderMiddleContent = () => {
    // 路径对应的标题映射
    const pathTitles: Record<string, string> = {
      '/inbox': 'Inbox',
      '/chat': 'Chat',
      '/deals': 'Deals',
      '/post':'Post'
    };
    
    // 检查当前路径是否需要显示标题
    // 需要处理子路径，例如 /chat/123 应该显示 Chat
    const currentPathKey = Object.keys(pathTitles).find(path => 
      pathname === path || pathname?.startsWith(`${path}/`)
    );
    
    if (currentPathKey) {
      // 显示路径对应的标题
      return (
        <div className="page-title">{pathTitles[currentPathKey]}</div>
      );
    } else {
      // 显示默认的Logo
      return (
        <div className="relative w-[180px] h-[48px] hover:cursor-pointer" onClick={()=>{
          router.push('/');
        }}>
          <Image
            src="/logo_beta_removebg.png"
            alt="logo"
            fill
            priority
            className="object-contain"
            sizes="180px"
          />
        </div>
      );
    }
  };
  
  // 判断是否显示返回按钮
  const shouldShowBackButton = () => {
    // 在这些路径下显示返回按钮
    const pathsWithBackButton = ['/chat'];
    
    return pathsWithBackButton.some(path => 
      pathname === path || pathname?.startsWith(`${path}/`)
    );
  };
  
  return (
    <header className="sticky top-0 z-10 pt-safe navbar shadow-sm border-b border-gray-200">
      <div className="flex-none w-[24px]">
        {shouldShowBackButton() && (
          <LeftOutline 
            className="cursor-pointer" 
            fontSize={20} 
            onClick={() => router.back()} 
          />
        )}
      </div>
      <div className="flex-1 flex items-center justify-center">
        {renderMiddleContent()}
      </div>
      <NavRight />
    </header>
  );
}
