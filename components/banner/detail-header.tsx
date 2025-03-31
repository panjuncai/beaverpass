'use client';

import { useRouter } from "next/navigation";
import NavRight from "./nav-right";
import { LeftOutline } from "antd-mobile-icons";

interface DetailHeaderProps {
  isShowBack: boolean;
  pageTitle?: string;
  isShowRight: boolean;
}

export default function DetailHeader({
  isShowBack,
  pageTitle = "",
  isShowRight,
}: DetailHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-10 pt-safe navbar shadow-sm">
      <div className="flex-none w-[24px]">
        {isShowBack && (
          <button 
            className="btn btn-ghost btn-circle"
            onClick={() => router.back()}
          >
            <LeftOutline fontSize={24} />
          </button>
        )}
      </div>
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-center justify-start text-zinc-600 text-base font-semibold font-['Poppins'] tracking-wide">{pageTitle}</h1>
      </div>
        {isShowRight && (
          <NavRight />
        )}
    </header>
  );
} 