import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session.userId) redirect("/auth/login");
  return (
    <div className="min-h-screen flex bg-bg">
      <aside className="w-[221px] shrink-0 bg-surface border-r border-black/5 p-4 space-y-6">
        <Link href="/" className="block font-bold text-brand text-lg">물류</Link>
        <nav className="space-y-4 text-[15px]">
          <div>
            <p className="text-[12px] font-bold uppercase text-muted mb-2">🏠 마이페이지</p>
            <Link href="/dashboard" className="block py-1.5 text-body">마이페이지</Link>
          </div>
          <div>
            <p className="text-[12px] font-bold uppercase text-muted mb-2">🛒 주문</p>
            <Link href="/dashboard/orders/new" className="block py-1.5 text-body">주문 접수</Link>
            <Link href="/dashboard/orders" className="block py-1.5 text-body">내 주문</Link>
          </div>
          <div>
            <p className="text-[12px] font-bold uppercase text-muted mb-2">📦 배송대행</p>
            <Link href="/dashboard/warehouse-address" className="block py-1.5 text-body">창고 주소</Link>
            <span className="block py-1.5 text-muted/50">입고 관리 (준비 중)</span>
            <span className="block py-1.5 text-muted/50">견적 (준비 중)</span>
          </div>
        </nav>
        <form action="/api/auth/logout" method="post"><button className="text-sm text-muted">로그아웃</button></form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
