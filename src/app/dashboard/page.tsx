import Link from "next/link";
import { getSession } from "@/lib/session";
import { listOrdersBySeller } from "@/lib/orders";

export default async function DashboardHome() {
  const session = await getSession();
  const orders = await listOrdersBySeller(session.userId!);
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-heading">마이페이지</h1>
      <section className="bg-surface rounded-[27px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[14px] font-semibold text-heading">주문 진행 현황 <span className="ml-1 rounded-full bg-warning-tint text-brand text-xs px-2 py-0.5">{orders.length}건</span></h2>
          <Link href="/dashboard/orders" className="text-brand text-sm font-medium">전체보기</Link>
        </div>
        <div className="flex gap-3">
          <div className="rounded-[22.5px] bg-warning-tint/60 px-6 py-4 text-center">
            <p className="text-[12.8px] text-muted">접수됨</p>
            <p className="text-lg font-semibold text-accent">{orders.filter(o => o.status === "REQUESTED").length}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
