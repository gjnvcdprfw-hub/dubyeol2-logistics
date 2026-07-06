import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { ValidationError } from "@/lib/auth";
import { saveInboundPhoto } from "@/lib/uploads";
import { recordInbound } from "@/lib/inbound";
import { orderWithLinesInclude } from "@/lib/order-lines";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN")
    return NextResponse.json({ ok: false, error: "권한이 없습니다" }, { status: 403 });
  try {
    const form = await req.formData();
    const orderId = String(form.get("orderId") ?? "");
    const skuIndexes = Array.from(new Set(
      Array.from(form.keys())
        .map((key) => key.match(/^sku\[(\d+)\]\[id\]$/)?.[1])
        .filter((value): value is string => Boolean(value)),
    )).sort((a, b) => Number(a) - Number(b));
    const skuResults = skuIndexes.map((index) => {
      const inboundQuantityKey = `sku[${index}][inboundQuantity]`;
      const defectCountKey = `sku[${index}][defectCount]`;
      if (!form.has(inboundQuantityKey))
        throw new ValidationError("SKU 입고 수량이 올바르지 않습니다");
      if (!form.has(defectCountKey))
        throw new ValidationError("SKU 하자 수량이 올바르지 않습니다");
      return {
        skuLineId: String(form.get(`sku[${index}][id]`) ?? ""),
        inboundQuantity: Number(form.get(inboundQuantityKey)),
        defectCount: Number(form.get(defectCountKey)),
        inspectionPassed: form.get(`sku[${index}][inspectionPassed]`) === "on",
        inspectionNote: String(form.get(`sku[${index}][inspectionNote]`) ?? "") || undefined,
      };
    });
    const files = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length < 1 || files.length > 2) throw new ValidationError("입고 사진은 1~2장이어야 합니다");
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: orderWithLinesInclude });
    if (!order) throw new ValidationError("주문을 찾을 수 없습니다");
    if (order.status !== "REQUESTED") throw new ValidationError("이미 입고 처리된 주문입니다");
    const hasInsp = order.inspectionRequested;
    const skuLines = order.productLines.flatMap((line) => line.skuLines);
    const hasSkuLines = skuLines.length > 0;
    const hasSkuResults = skuResults.length > 0;
    if (hasSkuResults && !hasInsp) {
      throw new ValidationError("검수를 신청하지 않은 주문에는 검수 결과를 기록할 수 없습니다");
    }
    if (hasInsp && hasSkuLines && !hasSkuResults) {
      throw new ValidationError("유료 검수 신청 건은 모든 SKU의 검수 결과를 함께 기록해야 합니다");
    }
    if (hasSkuResults) {
      const skuById = new Map(skuLines.map((sku) => [sku.id, sku]));
      const submittedSkuIds = skuResults.map((result) => result.skuLineId);
      const submittedSkuIdSet = new Set(submittedSkuIds);
      if (submittedSkuIdSet.size !== submittedSkuIds.length) {
        throw new ValidationError("유료 검수 신청 건은 모든 SKU의 검수 결과를 함께 기록해야 합니다");
      }
      for (const result of skuResults) {
        const sku = skuById.get(result.skuLineId);
        if (!sku) throw new ValidationError("SKU 정보를 찾을 수 없습니다");
        if (
          !Number.isInteger(result.inboundQuantity) ||
          result.inboundQuantity < 0 ||
          result.inboundQuantity > sku.quantity
        ) {
          throw new ValidationError("SKU 입고 수량이 올바르지 않습니다");
        }
        if (
          !Number.isInteger(result.defectCount) ||
          result.defectCount < 0 ||
          result.defectCount > result.inboundQuantity
        ) {
          throw new ValidationError("SKU 하자 수량이 올바르지 않습니다");
        }
      }
      if (
        hasInsp &&
        (skuResults.length !== skuLines.length || skuLines.some((sku) => !submittedSkuIdSet.has(sku.id)))
      ) {
        throw new ValidationError("유료 검수 신청 건은 모든 SKU의 검수 결과를 함께 기록해야 합니다");
      }
    }
    const countActual = Number(form.get("countActual"));
    const defectCount = Number(form.get("defectCount") ?? 0);
    if (hasInsp && !hasSkuLines) {
      const validCount = (x: number) => Number.isInteger(x) && x >= 0;
      if (!form.has("countActual") || !form.has("defectCount"))
        throw new ValidationError("검수 수치가 올바르지 않습니다");
      if (!validCount(countActual) || !validCount(defectCount))
        throw new ValidationError("검수 수치가 올바르지 않습니다");
    }
    const photoPaths: string[] = [];
    for (const f of files) photoPaths.push(await saveInboundPhoto(f));
    await recordInbound(orderId, {
      photoPaths,
      outerIssue: form.get("outerIssue") === "on",
      outerNote: String(form.get("outerNote") ?? "") || undefined,
      skuResults: skuResults.length ? skuResults : undefined,
      inspection: hasInsp ? {
        countActual,
        appearanceOk: form.get("appearanceOk") === "on",
        defectCount,
        note: String(form.get("inspNote") ?? "") || undefined,
      } : undefined,
    });
    return NextResponse.redirect(new URL("/admin/orders?done=1", req.url), 303);
  } catch (e) {
    if (e instanceof ValidationError)
      return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    console.error("inbound error:", e);
    return NextResponse.json({ ok: false, error: "입고 처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}
