import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { computeSkuSettlement } from "@/lib/sku-quote";
import { getQuotedOrderQuote, getQuotedOrderTotalKrw, getWalletSummary } from "@/lib/wallet";

const STATUS_LABEL: Record<string, string> = {
  REQUESTED: "접수됨",
  RECEIVED: "입고완료",
  SHIPMENT_REQUESTED: "출고 요청",
};

function krw(value: number) {
  return `₩${value.toLocaleString("ko-KR")}`;
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  if (!session.userId) redirect("/auth/login");
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const order = await prisma.order.findFirst({
    where: { id, sellerId: session.userId },  // 격리: sellerId 스코프 필수
    include: {
      photos: true,
      productLines: {
        include: { skuLines: { orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  if (!order) notFound();
  const wallet = await getWalletSummary(session.userId);
  const shipmentError = typeof query.shipmentError === "string" ? query.shipmentError : "";
  const shipmentRequested = query.shipment === "requested";
  const quoteTotalKrw = order.quotedAt && order.quoteShippingMethod ? getQuotedOrderTotalKrw(order) : null;
  const canRequestShipment = order.status === "RECEIVED" && quoteTotalKrw !== null && wallet.balanceKrw >= quoteTotalKrw;
  const hasInboundEvidence = order.status === "RECEIVED" || order.status === "SHIPMENT_REQUESTED";
  const quotedSkuRows = order.productLines.flatMap((line) =>
    line.skuLines.map((sku) => ({
      key: sku.id || `${line.id}:${sku.optionText}`,
      label: `${line.productName} / ${sku.optionText}`,
      quantity: sku.quantity,
      unitPriceFen: sku.quoteUnitPriceFen,
      cnShippingFen: sku.quoteCnShippingFen,
    })),
  );
  const skuSettlement =
    order.quotedAt &&
    order.quoteExchangeRateX100 &&
    quotedSkuRows.length > 0 &&
    quotedSkuRows.every((sku) => sku.unitPriceFen !== null && sku.cnShippingFen !== null)
      ? computeSkuSettlement({
          inspectionRequested: order.inspectionRequested,
          exchangeRateX100: order.quoteExchangeRateX100,
          skus: quotedSkuRows.map((sku) => ({
            label: sku.label,
            quantity: sku.quantity,
            unitPriceFen: sku.unitPriceFen ?? 0,
            cnShippingFen: sku.cnShippingFen ?? 0,
          })),
        })
      : null;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-heading">{order.productName} × {order.quantity}</h1>
      <p className="text-sm text-muted">{order.serviceType === "PURCHASE" ? "구매대행" : "배송대행"} · 상태: {STATUS_LABEL[order.status] ?? order.status}</p>
      {hasInboundEvidence ? (
        <section className="bg-surface rounded-[27px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-6 space-y-4">
          <h2 className="text-[14px] font-semibold text-heading">입고 증거</h2>
          <div className="flex gap-3">
            {order.photos.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.id} src={p.path} alt="입고 사진" className="w-40 h-40 object-cover rounded-[12px] border border-black/5" />
            ))}
          </div>
          <p className="text-sm text-body">외포장: {order.outerIssue ? <span className="text-danger">이상 있음{order.outerNote ? ` — ${order.outerNote}` : ""}</span> : "정상"}</p>
          {order.inspectionRequested ? (
            order.inspCountActual !== null ? (
              <div className="rounded-lg bg-success-tint p-4 text-sm space-y-1">
                <p className="font-medium text-success">유료 검수 결과</p>
                <p className="text-body">실입고 수량: {order.inspCountActual}/{order.quantity}</p>
                <p className="text-body">외관: {order.inspAppearanceOk ? "정상" : "이상"} · 하자: {order.inspDefectCount ?? 0}건</p>
                {order.inspNote && <p className="text-secondary">{order.inspNote}</p>}
              </div>
            ) : (
              <div className="rounded-lg bg-surface-alt p-4 text-sm text-muted">
                유료 검수 신청 건 — 검수 결과가 아직 기록되지 않았습니다. 기록되면 여기에 표시됩니다.
              </div>
            )
          ) : (
            <div className="rounded-lg bg-surface-alt p-4 text-sm text-muted">
              수량 미확인 — 유료 검수를 신청하지 않은 건입니다. 기본 제공은 입고 사진과 외포장 이상 안내입니다.
            </div>
          )}
        </section>
      ) : (
        <div className="bg-surface rounded-[27px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-8 text-muted text-sm">
          아직 중국 창고에 입고되지 않았습니다. 입고되면 사진과 함께 표시됩니다.
        </div>
      )}
      {order.productLines.length > 0 && (
        <section className="bg-surface rounded-[27px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-[14px] font-semibold text-heading">SKU별 작업 현황</h2>
            <p className="text-xs text-muted">포장단위는 출고요청 때 배정됩니다.</p>
          </div>
          <div className="space-y-4">
            {order.productLines.map((line) => (
              <section key={line.id} className="rounded-lg border border-black/5 bg-surface-alt p-4 space-y-3">
                <h3 className="text-sm font-semibold text-body">{line.productName}</h3>
                <div className="space-y-2">
                  {line.skuLines.map((sku) => (
                    <div key={sku.id} className="rounded-lg bg-white px-4 py-3 text-sm">
                      <p className="font-medium text-body">{sku.optionText}</p>
                      <div className="mt-1 grid gap-1 text-secondary sm:grid-cols-2">
                        <span>주문 {sku.quantity}개</span>
                        <span>입고 {sku.inboundQuantity ?? "-"}개</span>
                        <span>부족 {sku.missingQuantity ?? 0}개</span>
                        <span>하자 {sku.defectCount ?? 0}개</span>
                        <span>검수 {sku.inspectionPassed === null ? "-" : sku.inspectionPassed ? "합격" : "보류"}</span>
                        {sku.inspectionNote && <span className="sm:col-span-2">검수 메모 {sku.inspectionNote}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      )}
      {order.quotedAt && order.quoteShippingMethod && (
        <section className="bg-surface rounded-[27px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-6 space-y-3">
          <h2 className="text-[14px] font-semibold text-heading">항목별 견적</h2>
          {(() => {
            const q = getQuotedOrderQuote(order);
            const yuan = (fen: number) => `¥${(fen / 100).toLocaleString("ko-KR", { minimumFractionDigits: 2 })}`;
            const krw = (w: number) => `₩${w.toLocaleString("ko-KR")}`;
            return (
              <>
                {skuSettlement && (
                  <div className="rounded-lg border border-black/5 bg-surface-alt p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-body">SKU별 견적 근거</p>
                      <span className="text-xs text-muted">상품가 + 중국배송비 + 검수비</span>
                    </div>
                    <div className="space-y-3">
                      {skuSettlement.lines.map((line, index) => (
                        <div key={quotedSkuRows[index]?.key ?? `${line.label}-${index}`} className="rounded-lg bg-white px-4 py-3 text-sm space-y-1.5">
                          <div className="flex justify-between gap-3">
                            <span className="font-medium text-body">{line.label}</span>
                            <span className="text-body">{yuan(line.totalFen)} <span className="text-muted">({krw(line.totalKrw)})</span></span>
                          </div>
                          <div className="grid gap-1 text-secondary sm:grid-cols-2">
                            <span>상품가 {yuan(line.productFen)}</span>
                            <span>중국배송비 {yuan(line.cnShippingFen)}</span>
                            <span>검수비 {yuan(line.inspectionFen)}</span>
                            <span>주문 {line.quantity}개</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-heading">SKU 근거 합계</span>
                      <span className="text-heading">{yuan(skuSettlement.totalFen)} <span className="text-brand">({krw(skuSettlement.totalKrw)})</span></span>
                    </div>
                  </div>
                )}
                <ul className="text-sm space-y-1.5">
                  {q.itemsKrw.map((i) => (
                    <li key={i.key} className="flex justify-between">
                      <span className="text-secondary">{i.label}</span>
                      <span className="text-body">{yuan(i.amountFen)} <span className="text-muted">({krw(i.amountKrw)})</span></span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-black/5 pt-2 flex justify-between text-sm font-semibold">
                  <span className="text-heading">합계</span>
                  <span className="text-heading">{yuan(q.totalFen)} <span className="text-brand">({krw(q.totalKrw)})</span></span>
                </div>
                <p className="text-xs text-muted">청구중량 {q.chargeableWeightKg}kg 기준 · 적용 환율 ₩{(order.quoteExchangeRateX100! / 100).toFixed(2)}/¥ · 국제운임은 예상 금액이며 관세·부가세는 통관 시 별도입니다. 표시 금액은 참고용 안내입니다.</p>
              </>
            );
          })()}
        </section>
      )}
      {quoteTotalKrw !== null && (
        <section className="bg-surface rounded-[27px] shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[14px] font-semibold text-heading">출고 요청</h2>
              <p className="mt-1 text-sm text-secondary">
                예치금으로 견적 금액을 차감하고 출고 요청 상태로 넘깁니다.
              </p>
            </div>
            <span className="rounded-full bg-surface-alt text-muted text-xs px-3 py-1">로컬 테스트 원장</span>
          </div>
          {shipmentRequested && <p className="rounded-lg bg-success-tint text-success p-3 text-sm">출고 요청이 접수되었습니다.</p>}
          {shipmentError && <p className="rounded-lg bg-danger/10 text-danger p-3 text-sm">{shipmentError}</p>}
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-surface-alt p-4">
              <p className="text-muted">차감 예정 금액</p>
              <p className="mt-1 font-semibold text-heading">{krw(quoteTotalKrw)}</p>
            </div>
            <div className="rounded-lg bg-surface-alt p-4">
              <p className="text-muted">사용 가능 예치금</p>
              <p className="mt-1 font-semibold text-heading">{krw(wallet.balanceKrw)}</p>
            </div>
          </div>
          {order.status === "SHIPMENT_REQUESTED" ? (
            <p className="rounded-lg bg-info/10 text-info p-3 text-sm">이미 출고 요청된 주문입니다. 출고관리에서 상태를 확인하세요.</p>
          ) : (
            <form action="/api/shipments/request" method="post" className="flex flex-wrap items-center gap-3">
              <input type="hidden" name="orderId" value={order.id} />
              <button
                type="submit"
                disabled={!canRequestShipment}
                className="rounded-[18px] bg-brand text-white text-sm font-semibold px-4 py-2 disabled:bg-surface-alt disabled:text-muted"
              >
                출고 요청하고 예치금 차감
              </button>
              {!canRequestShipment && (
                <span className="text-sm text-danger">예치금 잔액이 부족하거나 견적 완료 상태가 아닙니다.</span>
              )}
            </form>
          )}
        </section>
      )}
      {order.status === "RECEIVED" && !order.quotedAt && (
        <div className="bg-surface rounded-[27px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-6 text-sm text-muted">
          견적 산정 중입니다. 완료되면 항목별로 표시됩니다.
        </div>
      )}
    </div>
  );
}
