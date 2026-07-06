import Link from "next/link";
import { redirect } from "next/navigation";
import { listAdminShipmentOrders } from "@/lib/shipment-packages";
import { getSessionUser } from "@/lib/session";

function sellerName(seller: { companyName: string | null; contactName: string; email: string }) {
  return seller.companyName || seller.contactName || seller.email;
}

export default async function AdminShipmentsPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  const orders = await listAdminShipmentOrders();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-heading">출고 처리</h1>
        <p className="text-sm text-secondary">출고 요청된 주문에 포장단위 마커와 패킹 기초 정보를 기록합니다.</p>
      </div>
      <table className="w-full bg-surface rounded-[16px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] text-sm">
        <thead>
          <tr className="text-left text-muted">
            <th className="p-3">셀러</th>
            <th className="p-3">주문</th>
            <th className="p-3">요청일</th>
            <th className="p-3">포장단위</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t border-black/5">
              <td className="p-3 text-secondary">{sellerName(order.seller)}</td>
              <td className="p-3">
                <p className="font-medium text-body">{order.productName}</p>
                <p className="text-secondary">{order.quantity}개</p>
              </td>
              <td className="p-3 text-secondary">{order.shipmentRequestedAt?.toLocaleDateString("ko-KR") ?? "-"}</td>
              <td className="p-3">{order.shipmentPackages.length}개</td>
              <td className="p-3">
                <Link href={`/admin/shipments/${order.id}`} className="text-brand font-medium">포장 입력</Link>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={5} className="p-8 text-center text-muted">출고 요청된 주문이 없습니다</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
