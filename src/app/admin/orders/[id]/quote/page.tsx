import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export default async function AdminQuotePage({ params }: { params: Promise<{ id: string }> }) {
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
  if (!order || order.status !== "RECEIVED") notFound();

  const isShipping = order.serviceType === "SHIPPING";
  const skuLines = order.productLines.flatMap((line) =>
    line.skuLines.map((sku) => ({ ...sku, productName: line.productName })),
  );
  const hasSkuLines = skuLines.length > 0;
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-heading">견적 입력 — {order.productName} × {order.quantity}</h1>
      <p className="text-sm text-secondary">
        셀러: {order.seller.email} · {isShipping ? "배송대행 건" : "구매대행 건"} · {order.inspectionRequested ? "유료 검수 신청 건" : "검수 미신청 건"}
      </p>
      <form action="/api/admin/quote" method="post"
        className="bg-surface rounded-[16px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-6 space-y-4">
        <input type="hidden" name="orderId" value={order.id} />
        {hasSkuLines ? (
          <fieldset className="rounded-lg bg-surface-alt p-4 space-y-4 text-sm">
            <p className="font-medium text-body">SKU별 견적 근거</p>
            <div className="space-y-4">
              {skuLines.map((sku, index) => (
                <div key={sku.id} className="rounded-lg border border-black/10 bg-white p-4 space-y-3">
                  <input type="hidden" name={`sku[${index}][id]`} value={sku.id} />
                  <div>
                    <p className="font-medium text-body">{sku.productName}</p>
                    <p className="text-secondary">{sku.optionText} · 주문 {sku.quantity}개</p>
                  </div>
                  <label className="block text-secondary">SKU 상품 단가 (¥)
                    <input
                      type="number"
                      name={`sku[${index}][unitPriceYuan]`}
                      min={0}
                      step={0.01}
                      required
                      defaultValue={sku.quoteUnitPriceFen !== null ? (sku.quoteUnitPriceFen / 100).toFixed(2) : isShipping ? 0 : undefined}
                      className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2"
                    />
                  </label>
                  <label className="block text-secondary">SKU 중국 내 배송비 (¥)
                    <input
                      type="number"
                      name={`sku[${index}][cnShippingYuan]`}
                      min={0}
                      step={0.01}
                      required
                      defaultValue={sku.quoteCnShippingFen !== null ? (sku.quoteCnShippingFen / 100).toFixed(2) : undefined}
                      className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2"
                    />
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        ) : (
          <>
            <label className="block text-sm text-secondary">상품 단가 (¥)
              {isShipping && <span className="block text-xs text-muted">배송대행 건은 상품가 없음</span>}
              <input type="number" name="unitPriceYuan" min={0} step={0.01} required
                defaultValue={isShipping ? 0 : undefined}
                className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
            </label>
            <label className="block text-sm text-secondary">중국 내 배송비 (¥)
              <input type="number" name="cnShippingYuan" min={0} step={0.01} required
                className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
            </label>
          </>
        )}
        <label className="block text-sm text-secondary">실측 무게 (kg)
          <input type="number" name="weightKg" min={0} step={0.01} required
            className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
        </label>
        <label className="block text-sm text-secondary">부피 (CBM)
          <input type="number" name="volumeCbm" min={0} step={0.0001} required
            className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
        </label>
        <label className="block text-sm text-secondary">적용 환율 (₩/¥)
          <input type="number" name="exchangeRate" min={0} step={0.01} required
            className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
        </label>
        <fieldset className="text-sm text-secondary space-y-1">
          <legend className="text-sm text-secondary">배송 방식</legend>
          <label className="block text-body">
            <input type="radio" name="shippingMethod" value="SEA" required /> 해운
          </label>
          <label className="block text-body">
            <input type="radio" name="shippingMethod" value="AIR" /> 항공
          </label>
        </fieldset>
        <button type="submit" className="bg-brand text-white font-semibold rounded-[12px] px-6 py-3">견적 저장</button>
      </form>
    </div>
  );
}
