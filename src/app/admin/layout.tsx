import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/dashboard");
  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-brand text-white px-6 h-14 flex items-center gap-6">
        <span className="font-bold">물류 운영자</span>
        <Link href="/admin/orders" className="text-sm">주문·입고</Link>
        <Link href="/admin/shipments" className="text-sm">출고 처리</Link>
        <Link href="/admin/wallet-topups" className="text-sm">예치금 확인</Link>
        <form action="/api/auth/logout" method="post" className="ml-auto">
          <button type="submit" className="text-sm text-white/80 hover:text-white">로그아웃</button>
        </form>
      </header>
      <main className="max-w-5xl mx-auto p-8">{children}</main>
    </div>
  );
}
