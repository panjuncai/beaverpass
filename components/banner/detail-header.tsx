'use client';

import { useRouter } from "next/navigation";
import NavRight from "./nav-right";
import { LeftOutline } from "antd-mobile-icons";

export default function DetailHeader(props: {
  isShowBack: boolean;
  pageTitle: string;
  isShowRight: boolean;
  handleLogin: () => void;
  handleRegister: () => void;
  handleLogout: () => void;
}) {
  const router = useRouter();

  return (
    <header className="navbar shadow-sm fixed top-0 z-50">
      <div className="navbar-start">
        {props.isShowBack && (
          <button 
            className="btn btn-ghost btn-circle"
            onClick={() => router.back()}
          >
            <LeftOutline />
          </button>
        )}
      </div>
      <div className="navbar-center">
        <h1 className="text-xl font-semibold">{props.pageTitle}</h1>
      </div>
      <div className="navbar-end">
        {props.isShowRight && (
          <NavRight handleLogout={props.handleLogout} handleLogin={props.handleLogin} handleRegister={props.handleRegister} />
        )}
      </div>
    </header>
  );
} 