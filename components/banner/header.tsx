import Image from "next/image";
import NavRight from "./nav-right";
export default function Header() {
  
  return (
    <header className="navbar shadow-sm">
      <div className="flex-none w-[24px]"></div>
      <div className="flex-1 flex items-center justify-center">
        <Image
          className="object-contain"
          src="/logo_beta_removebg.png"
          alt="logo"
          width={180}
          height={48}
          priority
        />
      </div>
        <NavRight />
    </header>
  );
}
