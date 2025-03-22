'use client'
import DetailHeader from "@/components/banner/detail-header";
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";

export default function DetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    // await supabase.auth.signOut();
    trpc.auth.logout.useMutation({
      onSuccess: () => {
        router.push('/login');
      },
      onError: (error) => {
        console.error(error);
      },
    });
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleRegister = () => {
    router.push('/register');
  };
  return (
    <div className="min-h-screen bg-base-200">
      <DetailHeader isShowBack={true} pageTitle="Post Detail" isShowRight={true} handleLogout={handleLogout} handleLogin={handleLogin} handleRegister={handleRegister} />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
} 