import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listOrdersBySeller } from "@/lib/orders";

const STATUS_LABEL: Record<string, string> = { REQUESTED: "접수됨", RECEIVED: "입고완료" };

function getOrderSummary(order: Awaited<ReturnType<typeof listOrdersBySeller>>[number]) {
  const skuCount = order.productLines.reduce((sum, line) => sum + line.skuLines.length, 0);
  return skuCount > 0 ? `${order.quantity}개 / ${skuCount} SKU` : `× ${order.quantity}`;
}

export default async function OrdersPage() {
  const session = await getSession();
  if (!session.userId) redirect("/auth/login");
  const orders = await listOrdersBySeller(session.userId);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-heading">구매대행 관리</h1>
        <Link href="/dashboard/orders/new" className="bg-accent text-white text-sm font-semibold rounded-[12px] px-4 py-2">주문 접수</Link>
      </div>
      {orders.length === 0 ? (
        <div className="bg-surface rounded-[27px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-12 text-center text-muted">
          접수된 주문이 아직 없습니다. <Link href="/dashboard/orders/new" className="text-accent font-medium">첫 주문을 접수해 보세요</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="bg-surface rounded-[16px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-4 flex items-start justify-between gap-4">
              <Link href={`/dashboard/orders/${o.id}`} className="block min-w-0 flex-1">
                <p className="font-medium text-body break-words">
                  {o.productName} <span className="text-muted">· {getOrderSummary(o)}</span>
                </p>
                <p className="text-sm text-muted">{o.serviceType === "PURCHASE" ? "구매대행" : "배송대행"} · {new Date(o.createdAt).toLocaleDateString("ko-KR")}</p>
              </Link>
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 text-xs">
                {o.inspectionRequested
                  ? <span className="rounded-full bg-success-tint text-success px-2 py-1">유료 검수 신청됨</span>
                  : <span className="rounded-full bg-surface-alt text-muted px-2 py-1">수량 미확인 (검수 미신청)</span>}
                {o.quotedAt && <span className="rounded-full bg-info/10 text-info px-2 py-1">견적 완료</span>}
                <span className="rounded-full bg-warning-tint text-accent px-2 py-1">{STATUS_LABEL[o.status] ?? o.status}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
