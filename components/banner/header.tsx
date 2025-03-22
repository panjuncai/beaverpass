import Image from "next/image";
import NavRight from "./nav-right";
export default function Header(props: {
  handleLogin: () => void;
  handleRegister: () => void;
  handleLogout: () => void;
}) {
  
  return (
    <header className="navbar shadow-sm">
      <div className="navbar-start"></div>
      <div className="navbar-center w-1/2">
        <Image
          className="object-contain"
          src="/logo_beta_removebg.png"
          alt="logo"
          width={180}
          height={48}
          priority
        />
      </div>
      <div className="navbar-end">
        <NavRight handleLogout={props.handleLogout} handleLogin={props.handleLogin} handleRegister={props.handleRegister} />
      </div>
    </header>
  );
}
