import Image from "next/image";
import { trpc } from "@/lib/trpc/client";
import { useEffect, useRef } from "react";

export default function Header(props: {
  handleLogin: () => void;
  handleRegister: () => void;
  handleLogout: () => void;
}) {
  const { data } = trpc.auth.getUser.useQuery();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
        detailsRef.current.open = false;
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

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
        <ul className="menu menu-horizontal px-1">
          <li className="z-50">
            <details ref={detailsRef}>
              <summary>Options</summary>
              <ul className="bg-base-100 rounded-t-none p-2 z-50">
                {data?.user ? (
                  <>
                    <li>
                      <a onClick={props.handleLogout}>Logout</a>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <a onClick={props.handleLogin}>Login</a>
                    </li>
                    <li>
                      <a onClick={props.handleRegister}>Register</a>
                    </li>
                  </>
                )}
              </ul>
            </details>
          </li>
        </ul>
      </div>
    </header>
  );
}
