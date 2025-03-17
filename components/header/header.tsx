import Image from "next/image";
export default function Header(props: { handleLogout: () => void }) {
  return (
    <header className="navbar shadow-sm">
      <div className="navbar-start">
        {/* <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              />{" "}
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            <li>
              <a>Homepage</a>
            </li>
            <li>
              <a>Portfolio</a>
            </li>
            <li>
              <a>About</a>
            </li>
          </ul>
        </div> */}
      </div>
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
                <li>
                  <a onClick={props.handleLogout}>Logout</a>
                </li>
                <li>
                  <a>Profile</a>
                </li>
              </ul>
            </details>
          </li>
        </ul>
      </div>
    </header>
  );
}
