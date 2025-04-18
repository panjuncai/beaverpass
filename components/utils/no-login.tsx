"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NoLogin() {
  const router = useRouter();
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col items-center justify-center">
            {/* 主按钮区域 */}
            <button
              className="w-1/2 h-12 relative bg-yellow-900 rounded-3xl text-center text-white text-base font-semibold font-['Poppins'] transition-all duration-300 hover:bg-yellow-800"
              onClick={() =>void router.push("/login")}
            >
              Log in
            </button>
            {/* 提示文字与链接 */}
            <div className="mt-4 text-center">
              <span className="text-gray-600 mr-1">Don&apos;t have an account?</span>
              <Link href="/register" className="text-green-600">
                Sign up
              </Link>
            </div>
          </div>
        </motion.div>
      );
}
