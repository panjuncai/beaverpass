import { trpc } from "@/lib/trpc/client";
import { useEffect, useRef } from "react";

export default function NavRight(props: {
    handleLogout: () => void;
    handleLogin: () => void;
    handleRegister: () => void;
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
        <>
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
        </>
    )
}