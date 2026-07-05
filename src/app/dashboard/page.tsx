import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listOrdersBySeller } from "@/lib/orders";
import StatusTile, { type StatusTone } from "@/components/dashboard/status-tile";

// 마이페이지 홈 — 두리무역 벤치(benchmark-duly.md §2.1) 카드 순서.
// 집계는 listOrdersBySeller(where: { sellerId }) 스코프 쿼리에서만 파생한다.

function SectionCard({
  title, count, href, prep, children,
}: { title: string; count: number; href: string; prep?: boolean; children: React.ReactNode }) {
  return (
    <section className="bg-surface rounded-[27px] shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[14px] font-semibold text-heading">
          {title} <span className="ml-1 rounded-full bg-warning-tint text-brand text-xs px-2 py-0.5">{count}건</span>
          {prep && <span className="ml-2 rounded-full bg-surface-alt text-muted text-xs px-2 py-0.5">준비 중</span>}
        </h2>
        <Link href={href} className="text-brand text-sm font-medium">전체보기</Link>
      </div>
      <div className="flex flex-wrap gap-3">{children}</div>
    </section>
  );
}

export default async function DashboardHome() {
  const session = await getSession();
  if (!session.userId) redirect("/auth/login");
  const orders = await listOrdersBySeller(session.userId);
  const requested = orders.filter((o) => o.status === "REQUESTED").length;
  const received = orders.filter((o) => o.status === "RECEIVED").length;
  const quoted = orders.filter((o) => o.quotedAt !== null).length;

  const shipmentTiles: { label: string; tone: StatusTone }[] = [
    { label: "포장중", tone: "muted" }, { label: "발송대기", tone: "muted" }, { label: "발송완료", tone: "muted" },
  ];
  const returnTiles: { label: string; tone: StatusTone }[] = [
    { label: "처리대기", tone: "muted" }, { label: "완료", tone: "muted" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-heading">마이페이지</h1>

      <section className="rounded-[27px] bg-gradient-to-br from-brand to-[#8b0000] text-white p-6 shadow-card">
        <p className="text-sm text-white/80">예치금 현황</p>
        <p className="mt-1 text-2xl font-bold">사용 가능 잔액 ₩0</p>
        <div className="mt-4 flex gap-3">
          <Link href="/dashboard/wallet" className="rounded-[18px] bg-white text-brand text-sm font-semibold px-4 py-2">충전하기</Link>
          <Link href="/dashboard/wallet" className="rounded-[18px] bg-white text-brand text-sm font-semibold px-4 py-2">내역보기</Link>
        </div>
      </section>

      <SectionCard title="구매대행 진행 현황" count={orders.length} href="/dashboard/orders">
        <StatusTile label="접수됨" count={requested} tone="warning" />
        <StatusTile label="견적완료" count={quoted} tone="info" />
        <StatusTile label="입고완료" count={received} tone="success" />
      </SectionCard>

      <SectionCard title="입고 관리 현황" count={requested + received} href="/dashboard/inbound">
        <StatusTile label="입고대기" count={requested} tone="warning" />
        <StatusTile label="입고완료" count={received} tone="success" />
      </SectionCard>

      <SectionCard title="출고 관리 현황" count={0} href="/dashboard/shipment" prep>
        {shipmentTiles.map((t) => <StatusTile key={t.label} label={t.label} count={0} tone={t.tone} />)}
      </SectionCard>

      <SectionCard title="반품 관리 현황" count={0} href="/dashboard/returns" prep>
        {returnTiles.map((t) => <StatusTile key={t.label} label={t.label} count={0} tone={t.tone} />)}
      </SectionCard>

      <SectionCard title="스마트오더" count={0} href="/dashboard/smart-order" prep>
        <StatusTile label="등록 상품" count={0} tone="muted" />
      </SectionCard>
    </div>
  );
}
