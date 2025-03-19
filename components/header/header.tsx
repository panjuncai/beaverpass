import Image from "next/image";
import { trpc } from "@/lib/trpc/client";
export default function Header(props: {
  handleLogin: () => void;
  handleRegister: () => void;
  handleLogout: () => void;
}) {
  const { data: user } = trpc.auth.getUser.useQuery();
  console.log('右上角图标....user....', user);
  return (
    <header className="navbar shadow-sm">
      <div className="navbar-start"></div>
      <div className="navbar-center w-1/2">
        <Image
          className="w-full"
          src="/logo_beta_removebg.png"
          alt="logo"
          width={80}
          height={300}
        />
      </div>
      <div className="navbar-end">
        <ul className="menu menu-horizontal px-1">
          <li>
            <details>
              <summary>Options</summary>
              <ul className="bg-base-100 rounded-t-none p-2">
                {user ? (
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
