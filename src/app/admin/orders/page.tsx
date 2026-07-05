import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

const STATUS_LABEL: Record<string, string> = { REQUESTED: "접수됨", RECEIVED: "입고완료" };

export default async function AdminOrdersPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { seller: { select: { email: true } } },
  });
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-heading">주문·입고 관리</h1>
      <table className="w-full bg-surface rounded-[16px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] text-sm">
        <thead><tr className="text-left text-muted">
          <th className="p-3">셀러</th><th className="p-3">상품</th><th className="p-3">수량</th><th className="p-3">검수</th><th className="p-3">상태</th><th className="p-3"></th>
        </tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t border-black/5">
              <td className="p-3 text-secondary">{o.seller.email}</td>
              <td className="p-3 text-body">{o.productName}</td>
              <td className="p-3">{o.quantity}</td>
              <td className="p-3">{o.inspectionRequested ? "유료 검수" : "-"}</td>
              <td className="p-3">{STATUS_LABEL[o.status] ?? o.status}</td>
              <td className="p-3">
                {o.status === "REQUESTED" && (
                  <Link href={`/admin/orders/${o.id}`} className="text-brand font-medium">입고 기록</Link>
                )}
                {o.status === "RECEIVED" && (o.quotedAt ? (
                  <span className="text-muted">견적 완료</span>
                ) : (
                  <Link href={`/admin/orders/${o.id}/quote`} className="text-brand font-medium">견적 입력</Link>
                ))}
              </td>
            </tr>
          ))}
          {orders.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted">주문이 없습니다</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
