import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { ValidationError } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { orderWithLinesInclude } from "@/lib/order-lines";
import { computeQuote } from "@/lib/quote";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN")
    return NextResponse.json({ ok: false, error: "권한이 없습니다" }, { status: 403 });
  try {
    const form = await req.formData();
    const orderId = String(form.get("orderId") ?? "");
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: orderWithLinesInclude });
    if (!order) throw new ValidationError("주문을 찾을 수 없습니다");
    if (order.status !== "RECEIVED") throw new ValidationError("입고 완료된 주문만 견적을 입력할 수 있습니다");

    const toFen = (v: FormDataEntryValue | null, field: string) => {
      const n = Math.round(Number(v) * 100);
      if (!Number.isFinite(n) || n < 0) throw new ValidationError(`${field} 값이 올바르지 않습니다`);
      return n;
    };
    const submittedSkuKeys = Array.from(form.keys()).filter((key) => /^sku\[\d+\]\[id\]$/.test(key));
    const skuQuotes = submittedSkuKeys.map((key) => {
      const index = key.match(/^sku\[(\d+)\]\[id\]$/)?.[1];
      if (!index) throw new ValidationError("SKU 견적 형식이 올바르지 않습니다");

      return {
        id: String(form.get(`sku[${index}][id]`) ?? ""),
        unitPriceFen: toFen(form.get(`sku[${index}][unitPriceYuan]`), "SKU 상품 단가"),
        cnShippingFen: toFen(form.get(`sku[${index}][cnShippingYuan]`), "SKU 중국 내 배송비"),
      };
    });
    const orderSkuLines = order.productLines.flatMap((line) => line.skuLines);
    const useSkuQuotes = orderSkuLines.length > 0 || skuQuotes.length > 0;
    if (useSkuQuotes) {
      if (skuQuotes.length !== orderSkuLines.length) {
        throw new ValidationError("모든 SKU의 견적을 함께 입력해 주세요");
      }

      const orderSkuIdSet = new Set(orderSkuLines.map((sku) => sku.id));
      const submittedSkuIds = skuQuotes.map((sku) => sku.id);
      const submittedSkuIdSet = new Set(submittedSkuIds);
      if (submittedSkuIdSet.size !== submittedSkuIds.length) {
        throw new ValidationError("SKU 견적이 중복되었습니다");
      }
      if (
        orderSkuLines.some((sku) => !submittedSkuIdSet.has(sku.id)) ||
        submittedSkuIds.some((id) => !orderSkuIdSet.has(id))
      ) {
        throw new ValidationError("주문에 속한 SKU만 견적을 입력할 수 있습니다");
      }
    }

    const totalProductFen = skuQuotes.reduce((sum, sku) => {
      const source = orderSkuLines.find((row) => row.id === sku.id);
      return sum + sku.unitPriceFen * (source?.quantity ?? 0);
    }, 0);
    const totalCnShippingFen = skuQuotes.reduce((sum, sku) => sum + sku.cnShippingFen, 0);
    const unitPriceFen = useSkuQuotes
      ? (order.quantity > 0 ? Math.round(totalProductFen / order.quantity) : 0)
      : toFen(form.get("unitPriceYuan"), "상품 단가");
    const cnShippingFen = useSkuQuotes
      ? totalCnShippingFen
      : toFen(form.get("cnShippingYuan"), "중국 내 배송비");
    const weightGrams = Math.round(Number(form.get("weightKg")) * 1000);
    const volumeCm3 = Math.round(Number(form.get("volumeCbm")) * 1_000_000);
    const exchangeRateX100 = Math.round(Number(form.get("exchangeRate")) * 100);
    const shippingMethod = String(form.get("shippingMethod"));
    if (shippingMethod !== "SEA" && shippingMethod !== "AIR") throw new ValidationError("배송 방식이 올바르지 않습니다");

    // 저장 전 계산 검증 — computeQuote가 던지면 저장하지 않음
    computeQuote({
      quantity: order.quantity,
      serviceType: order.serviceType as "PURCHASE" | "SHIPPING",
      inspectionRequested: order.inspectionRequested,
      unitPriceFen, cnShippingFen, weightGrams, volumeCm3, exchangeRateX100, shippingMethod,
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { quoteUnitPriceFen: unitPriceFen, quoteCnShippingFen: cnShippingFen, quoteWeightGrams: weightGrams, quoteVolumeCm3: volumeCm3, quoteExchangeRateX100: exchangeRateX100, quoteShippingMethod: shippingMethod, quotedAt: new Date() },
    });
    for (const sku of skuQuotes) {
      await prisma.orderSkuLine.update({
        where: { id: sku.id },
        data: { quoteUnitPriceFen: sku.unitPriceFen, quoteCnShippingFen: sku.cnShippingFen },
      });
    }
    return NextResponse.redirect(new URL("/admin/orders?quoted=1", req.url), 303);
  } catch (e) {
    if (e instanceof ValidationError)
      return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    console.error("quote error:", e);
    return NextResponse.json({ ok: false, error: "견적 처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}
