import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { ValidationError } from "@/lib/auth";
import { saveInboundPhoto } from "@/lib/uploads";
import { recordInbound } from "@/lib/inbound";

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
    const skuResults = skuIndexes.map((index) => ({
      skuLineId: String(form.get(`sku[${index}][id]`) ?? ""),
      inboundQuantity: Number(form.get(`sku[${index}][inboundQuantity]`)),
      defectCount: Number(form.get(`sku[${index}][defectCount]`) ?? 0),
      inspectionPassed: form.get(`sku[${index}][inspectionPassed]`) === "on",
      inspectionNote: String(form.get(`sku[${index}][inspectionNote]`) ?? "") || undefined,
    }));
    const files = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length < 1 || files.length > 2) throw new ValidationError("입고 사진은 1~2장이어야 합니다");
    const photoPaths: string[] = [];
    for (const f of files) photoPaths.push(await saveInboundPhoto(f));
    const order = await prisma.order.findUnique({ where: { id: orderId }, select: { inspectionRequested: true } });
    if (!order) throw new ValidationError("주문을 찾을 수 없습니다");
    const hasInsp = order.inspectionRequested;
    const countActual = Number(form.get("countActual"));
    const defectCount = Number(form.get("defectCount") ?? 0);
    if (hasInsp) {
      const validCount = (x: number) => Number.isInteger(x) && x >= 0;
      if (!validCount(countActual) || !validCount(defectCount))
        throw new ValidationError("검수 수치가 올바르지 않습니다");
    }
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
