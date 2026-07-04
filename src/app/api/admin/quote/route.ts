import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { ValidationError } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computeQuote } from "@/lib/quote";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN")
    return NextResponse.json({ ok: false, error: "권한이 없습니다" }, { status: 403 });
  try {
    const form = await req.formData();
    const orderId = String(form.get("orderId") ?? "");
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new ValidationError("주문을 찾을 수 없습니다");
    if (order.status !== "RECEIVED") throw new ValidationError("입고 완료된 주문만 견적을 입력할 수 있습니다");

    const toFen = (v: FormDataEntryValue | null, field: string) => {
      const n = Math.round(Number(v) * 100);
      if (!Number.isFinite(n) || n < 0) throw new ValidationError(`${field} 값이 올바르지 않습니다`);
      return n;
    };
    const unitPriceFen = toFen(form.get("unitPriceYuan"), "상품 단가");
    const cnShippingFen = toFen(form.get("cnShippingYuan"), "중국 내 배송비");
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
    return NextResponse.redirect(new URL("/admin/orders?quoted=1", req.url), 303);
  } catch (e) {
    if (e instanceof ValidationError)
      return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    console.error("quote error:", e);
    return NextResponse.json({ ok: false, error: "견적 처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}
