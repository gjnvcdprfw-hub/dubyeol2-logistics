import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listOrdersBySeller } from "@/lib/orders";
import StatusTile, { type StatusTone } from "@/components/dashboard/status-tile";
import { getShipmentPackageStatusLabel } from "@/lib/shipment-packages";

const TILES: {
  label: string;
  tone: StatusTone;
  count: (orders: Awaited<ReturnType<typeof listOrdersBySeller>>) => number;
}[] = [
  { label: "출고 요청", tone: "warning", count: (orders) => orders.filter((o) => o.status === "SHIPMENT_REQUESTED").length },
  { label: "출고 준비", tone: "info", count: () => 0 },
  { label: "발송대기", tone: "info", count: () => 0 },
  { label: "발송예정", tone: "info", count: () => 0 },
  { label: "발송완료", tone: "success", count: () => 0 },
];

function krw(value: number | null) {
  return `₩${(value ?? 0).toLocaleString("ko-KR")}`;
}

function formatWeight(weightGrams: number) {
  return `${(weightGrams / 1000).toLocaleString("ko-KR", { maximumFractionDigits: 2 })}kg`;
}

function formatVolume(volumeCm3: number) {
  return `${(volumeCm3 / 1_000_000).toLocaleString("ko-KR", { maximumFractionDigits: 4 })}CBM`;
}

export default async function ShipmentPage() {
  const session = await getSession();
  if (!session.userId) redirect("/auth/login");
  const orders = await listOrdersBySeller(session.userId);
  const shipmentOrders = orders.filter((o) => o.status === "SHIPMENT_REQUESTED");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-heading">출고 관리</h1>
      <div className="bg-surface rounded-[27px] shadow-card p-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {TILES.map((t) => (
            <StatusTile key={t.label} label={t.label} count={t.count(orders)} tone={t.tone} />
          ))}
        </div>
      </div>
      <section className="bg-surface rounded-[27px] shadow-card p-6">
        <h2 className="text-[14px] font-semibold text-heading">출고 요청 내역</h2>
        {shipmentOrders.length === 0 ? (
          <p className="mt-6 text-center text-muted">출고 요청된 주문이 아직 없습니다</p>
        ) : (
          <div className="mt-4 divide-y divide-black/5">
            {shipmentOrders.map((order) => (
              <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="block py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-heading">{order.productName} × {order.quantity}</p>
                    <p className="mt-1 text-sm text-secondary">
                      출고 요청 · {order.shipmentRequestedAt?.toLocaleDateString("ko-KR") ?? "요청일 확인 중"}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-brand">{krw(order.shipmentRequestedAmountKrw)}</p>
                </div>
                <div className="mt-3 rounded-[16px] bg-surface-alt px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-body">포장단위 {order.shipmentPackages.length}개</p>
                    {order.shipmentPackages.length > 0 && (
                      <span className="text-xs text-muted">박스별 중량과 CBM 기준</span>
                    )}
                  </div>
                  {order.shipmentPackages.length === 0 ? (
                    <p className="mt-2 text-muted">포장단위가 아직 배정되지 않았습니다</p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {order.shipmentPackages.map((pkg) => (
                        <li key={pkg.id} className="rounded-[12px] bg-white px-3 py-2 text-secondary">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-medium text-body">{pkg.marker}</span>
                            <span>{getShipmentPackageStatusLabel(pkg.status)}</span>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                            <span>무게 {formatWeight(pkg.weightGrams)}</span>
                            <span>부피 {formatVolume(pkg.volumeCm3)}</span>
                            <span>SKU {pkg.items.length}종</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
