import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export default async function AdminInboundPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      seller: { select: { email: true } },
      productLines: {
        include: { skuLines: { orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  if (!order || order.status !== "REQUESTED") notFound();
  const skuLines = order.productLines.flatMap((line) =>
    line.skuLines.map((sku) => ({ ...sku, productName: line.productName })),
  );
  const hasSkuLines = skuLines.length > 0;
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-heading">입고 기록 — {order.productName} × {order.quantity}</h1>
      <p className="text-sm text-secondary">셀러: {order.seller.email} · {order.inspectionRequested ? "유료 검수 신청 건" : "검수 미신청 건 (검수 결과 기록 불가)"}</p>
      <form action="/api/admin/inbound" method="post" encType="multipart/form-data"
        className="bg-surface rounded-[16px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-6 space-y-4">
        <input type="hidden" name="orderId" value={order.id} />
        <label className="block text-sm text-secondary">입고 사진 (1~2장, JPG/PNG/WebP)
          <input type="file" name="photos" accept="image/jpeg,image/png,image/webp" multiple required className="mt-1 block" />
        </label>
        <label className="block text-sm text-body">
          <input type="checkbox" name="outerIssue" /> 외포장 이상 있음
        </label>
        <label className="block text-sm text-secondary">외포장 메모
          <input name="outerNote" className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
        </label>
        {hasSkuLines && order.inspectionRequested ? (
          <fieldset className="rounded-lg bg-surface-alt p-4 space-y-4 text-sm">
            <p className="font-medium text-body">SKU별 입고·검수 결과</p>
            <div className="space-y-4">
              {skuLines.map((sku, index) => (
                <div key={sku.id} className="rounded-lg border border-black/10 bg-white p-4 space-y-3">
                  <input type="hidden" name={`sku[${index}][id]`} value={sku.id} />
                  <div>
                    <p className="font-medium text-body">{sku.productName}</p>
                    <p className="text-secondary">{sku.optionText} · 주문 {sku.quantity}개</p>
                  </div>
                  <label className="block text-secondary">입고 수량
                    <input
                      type="number"
                      name={`sku[${index}][inboundQuantity]`}
                      min={0}
                      max={sku.quantity}
                      defaultValue={sku.quantity}
                      className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2"
                    />
                  </label>
                  <label className="block text-secondary">하자 수량
                    <input
                      type="number"
                      name={`sku[${index}][defectCount]`}
                      min={0}
                      defaultValue={0}
                      className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2"
                    />
                  </label>
                  <label className="block text-body">
                    <input type="checkbox" name={`sku[${index}][inspectionPassed]`} defaultChecked /> 검수 통과
                  </label>
                  <label className="block text-secondary">SKU별 검수 메모
                    <input
                      name={`sku[${index}][inspectionNote]`}
                      placeholder="SKU별 검수 메모"
                      className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2"
                    />
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        ) : order.inspectionRequested ? (
          <fieldset className="rounded-lg bg-surface-alt p-4 space-y-3 text-sm">
            <p className="font-medium text-body">검수 결과 기록 (유료 검수 신청 건 — 필수)</p>
            <label className="block text-secondary">실입고 수량
              <input type="number" name="countActual" min={0} required className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
            </label>
            <label className="block text-body"><input type="checkbox" name="appearanceOk" defaultChecked /> 외관 정상</label>
            <label className="block text-secondary">하자 수량
              <input type="number" name="defectCount" min={0} defaultValue={0} className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
            </label>
            <label className="block text-secondary">검수 메모
              <input name="inspNote" className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
            </label>
          </fieldset>
        ) : (
          <div className="rounded-lg border border-black/10 bg-surface-alt p-4 text-sm text-secondary">
            유료 검수를 신청하지 않은 주문이라 사진과 외포장 상태만 기록합니다.
          </div>
        )}
        <button type="submit" className="bg-brand text-white font-semibold rounded-[12px] px-6 py-3">입고 완료 처리</button>
      </form>
    </div>
  );
}
