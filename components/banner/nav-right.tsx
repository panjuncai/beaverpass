"use client";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { trpc } from "@/lib/trpc/client";
export default function NavRight() {
  const router = useRouter();
  const { loginUser } = useAuthStore();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      router.push("/login");
    },
  });

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex-none">
      <div className="dropdown dropdown-end">
        <label tabIndex={0} className="px-2 py-1 hover:bg-stone-100 rounded-md transition-colors duration-200 cursor-pointer flex items-center justify-center">
          <div className="w-8 h-8 relative">
            <div className="absolute left-[7px] top-[4px]">
              <svg width="10" height="11" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.95394 9.43224C7.28244 9.43224 9.17006 7.54462 9.17006 5.21612C9.17006 2.88762 7.28244 1 4.95394 1C2.62545 1 0.737823 2.88762 0.737823 5.21612C0.737823 7.54462 2.62545 9.43224 4.95394 9.43224Z" stroke="#331901" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="absolute left-[2px] top-[14px]">
              <svg width="20" height="10" viewBox="0 0 20 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.7018 8.97855C18.4946 8.97855 19.1072 8.2098 18.8549 7.44105C17.6418 3.68138 14.1223 0.954712 9.95425 0.954712C5.78617 0.954712 2.26673 3.68138 1.05355 7.44105C0.813311 8.19779 1.4139 8.97855 2.20667 8.97855H17.7018Z" stroke="#331901" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </label>
        <ul
          tabIndex={0}
          className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-36"
        >
          {loginUser ? (
            <>
              <li className="w-full">
                <button
                  className="w-full px-4 py-2 text-left text-stone-600 hover:bg-stone-100 rounded-lg"
                  onClick={() => router.push("/profile")}
                >
                  Profile
                </button>
              </li>
              <li className="w-full">
                <button
                  className="w-full px-4 py-2 text-left text-stone-600 hover:bg-stone-100 rounded-lg"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="w-full">
                <button
                  className="w-full px-4 py-2 text-left text-stone-600 hover:bg-stone-100 rounded-lg"
                  onClick={() => router.push("/login")}
                >
                  Login
                </button>
              </li>
              <li className="w-full">
                <button
                  className="w-full px-4 py-2 text-left text-stone-600 hover:bg-stone-100 rounded-lg"
                  onClick={() => router.push("/register")}
                >
                  Register
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
