import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getAdminShipmentOrder, getShipmentPackageStatusLabel } from "@/lib/shipment-packages";

function sellerName(seller: { companyName: string | null; contactName: string; email: string }) {
  return seller.companyName || seller.contactName || seller.email;
}

function formatWeight(weightGrams: number) {
  return `${(weightGrams / 1000).toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}kg`;
}

function formatVolume(volumeCm3: number) {
  return `${(volumeCm3 / 1_000_000).toLocaleString("ko-KR", { minimumFractionDigits: 4, maximumFractionDigits: 4 })}CBM`;
}

export default async function AdminShipmentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const order = await getAdminShipmentOrder(id);
  if (!order || order.status !== "SHIPMENT_REQUESTED") notFound();

  const skuLines = order.productLines.flatMap((line) =>
    line.skuLines.map((sku) => ({
      ...sku,
      productName: line.productName,
    })),
  );
  const packed = query.packed === "1";
  const error = typeof query.error === "string" ? query.error : "";

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-heading">출고 포장 입력</h1>
        <p className="text-sm text-secondary">
          셀러: {sellerName(order.seller)} · {order.productName} × {order.quantity}
        </p>
      </div>

      {packed && <p className="rounded-lg bg-success-tint p-3 text-sm text-success">포장단위가 저장되었습니다.</p>}
      {error && <p className="rounded-lg bg-danger/10 p-3 text-sm text-danger">{error}</p>}

      <section className="bg-surface rounded-[16px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-6 space-y-4">
        <h2 className="text-[14px] font-semibold text-heading">SKU 출고 가능 수량</h2>
        <div className="space-y-3">
          {skuLines.map((sku) => {
            const shippable = Math.max(0, (sku.inboundQuantity ?? sku.quantity) - (sku.defectCount ?? 0));
            return (
              <div key={sku.id} className="rounded-lg border border-black/5 bg-surface-alt px-4 py-3 text-sm">
                <p className="font-medium text-body">{sku.productName} / {sku.optionText}</p>
                <div className="mt-1 grid gap-1 text-secondary sm:grid-cols-2">
                  <span>주문 {sku.quantity}개</span>
                  <span>입고 {sku.inboundQuantity ?? "-"}개</span>
                  <span>하자 {sku.defectCount ?? 0}개</span>
                  <span>출고 가능 {shippable}개</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-surface rounded-[16px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-6 space-y-4">
        <h2 className="text-[14px] font-semibold text-heading">기존 포장단위</h2>
        {order.shipmentPackages.length === 0 ? (
          <p className="text-sm text-muted">아직 저장된 포장단위가 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {order.shipmentPackages.map((pkg) => (
              <div key={pkg.id} className="rounded-lg border border-black/5 bg-surface-alt p-4 text-sm space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-medium text-body">{pkg.marker}</p>
                  <span className="text-secondary">{getShipmentPackageStatusLabel(pkg.status)}</span>
                </div>
                <div className="grid gap-1 text-secondary sm:grid-cols-2">
                  <span>무게 {formatWeight(pkg.weightGrams)}</span>
                  <span>부피 {formatVolume(pkg.volumeCm3)}</span>
                  {pkg.memo && <span className="sm:col-span-2">메모 {pkg.memo}</span>}
                </div>
                <ul className="space-y-1 text-secondary">
                  {pkg.items.map((item) => (
                    <li key={item.id}>
                      {item.skuLine.optionText} · {item.quantity}개
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <form
        action="/api/admin/shipments/packages"
        method="post"
        className="bg-surface rounded-[16px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-6 space-y-4"
      >
        <h2 className="text-[14px] font-semibold text-heading">포장단위 저장</h2>
        <input type="hidden" name="orderId" value={order.id} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-secondary">
            포장단위 마커
            <input
              name="marker"
              required
              placeholder="BOX-1"
              defaultValue={`BOX-${order.shipmentPackages.length + 1}`}
              className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2"
            />
          </label>
          <label className="block text-sm text-secondary">
            포장 상태
            <select name="status" defaultValue="PACKING" className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2">
              <option value="PACKING">포장중</option>
              <option value="PACKED">포장완료</option>
              <option value="READY">출고대기</option>
            </select>
          </label>
          <label className="block text-sm text-secondary">
            무게 (kg)
            <input type="number" name="weightKg" min="0.01" step="0.01" required className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
          </label>
          <label className="block text-sm text-secondary">
            부피 (CBM)
            <input type="number" name="volumeCbm" min="0.0001" step="0.0001" required className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
          </label>
        </div>
        <label className="block text-sm text-secondary">
          메모
          <input name="memo" className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
        </label>
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-body">박스에 담을 SKU 수량</legend>
          {skuLines.map((sku, index) => {
            const shippable = Math.max(0, (sku.inboundQuantity ?? sku.quantity) - (sku.defectCount ?? 0));
            return (
              <div key={sku.id} className="rounded-lg border border-black/5 bg-surface-alt p-4">
                <input type="hidden" name={`sku[${index}][id]`} value={sku.id} />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-body">{sku.productName} / {sku.optionText}</p>
                    <p className="text-sm text-secondary">출고 가능 {shippable}개</p>
                  </div>
                  <input
                    type="number"
                    name={`sku[${index}][quantity]`}
                    min="0"
                    max={shippable}
                    defaultValue={0}
                    className="w-28 border border-black/10 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            );
          })}
        </fieldset>
        <button type="submit" className="bg-brand text-white font-semibold rounded-[12px] px-6 py-3">포장단위 저장</button>
      </form>
    </div>
  );
}
