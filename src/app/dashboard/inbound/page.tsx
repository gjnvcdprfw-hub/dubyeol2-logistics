import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

// 입고 관리 (benchmark §2.5). 입고대기/입고완료는 실데이터, 나머지 탭은 준비 중.
const ACTIVE_TABS = [
  { key: "waiting", label: "입고대기", status: "REQUESTED" },
  { key: "received", label: "입고완료", status: "RECEIVED" },
] as const;
const PREP_TABS = ["발송완료", "에러제품", "반송대기"];

export default async function InboundPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await getSession();
  if (!session.userId) redirect("/auth/login");
  const { tab } = await searchParams;
  const activeTab = ACTIVE_TABS.find((t) => t.key === tab) ?? ACTIVE_TABS[0];
  // 반드시 sellerId 스코프 — 다른 셀러 주문이 보이면 안 된다.
  const orders = await prisma.order.findMany({
    where: { sellerId: session.userId, status: activeTab.status },
    include: { photos: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-heading">입고 관리</h1>
      <div className="flex flex-wrap gap-2">
        {ACTIVE_TABS.map((t) => (
          <Link
            key={t.key}
            href={`/dashboard/inbound?tab=${t.key}`}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              t.key === activeTab.key ? "bg-accent text-white" : "bg-surface-alt text-secondary"
            }`}
          >
            {t.label}
          </Link>
        ))}
        {PREP_TABS.map((label) => (
          <span key={label} className="rounded-full px-4 py-2 text-sm bg-surface-alt text-muted">
            {label} <span className="text-xs">(준비 중)</span>
          </span>
        ))}
      </div>
      {orders.length === 0 ? (
        <div className="bg-surface rounded-[27px] shadow-card p-12 text-center text-muted">
          해당 상태의 상품이 없습니다
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="bg-surface rounded-[16px] shadow-card p-4 flex items-center justify-between gap-4">
              <Link href={`/dashboard/orders/${o.id}`} className="block min-w-0">
                <p className="font-medium text-body truncate">
                  {o.productName} <span className="text-muted">× {o.quantity}</span>
                </p>
                <p className="text-sm text-muted">
                  {new Date(o.createdAt).toLocaleDateString("ko-KR")} · 입고 사진 {o.photos.length}장
                </p>
              </Link>
              <div className="flex items-center gap-2 text-xs shrink-0">
                {o.outerIssue === true && (
                  <span className="rounded-full bg-warning-tint text-accent px-2 py-1">외포장 이상</span>
                )}
                {o.outerIssue === false && (
                  <span className="rounded-full bg-success-tint text-success px-2 py-1">외포장 정상</span>
                )}
                <span
                  className={`rounded-full px-2 py-1 ${
                    o.status === "RECEIVED" ? "bg-success-tint text-success" : "bg-warning-tint text-accent"
                  }`}
                >
                  {o.status === "RECEIVED" ? "입고완료" : "입고대기"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
