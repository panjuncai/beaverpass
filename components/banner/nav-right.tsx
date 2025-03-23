"use client";
import { useRouter } from "next/navigation";
import { UserOutline } from "antd-mobile-icons";
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
        <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
          <div className="w-10 rounded-full">
            <UserOutline fontSize={36} />
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
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
              <li className="w-full">
                <button
                  className="w-full px-4 py-2 text-left text-stone-600 hover:bg-stone-100 rounded-lg"
                  onClick={() => router.push("/profile")}
                >
                  Profile
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
