import Image from "next/image";
import NavRight from "./nav-right";
import { useRouter } from "next/navigation";
export default function Header() {
  const router = useRouter();
  
  return (
    <header className="navbar shadow-sm">
      <div className="flex-none w-[24px]"></div>
      <div className="flex-1 flex items-center justify-center">
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
      </div>
        <NavRight />
    </header>
  );
}
