import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
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
    const files = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length < 1 || files.length > 2) throw new ValidationError("입고 사진은 1~2장이어야 합니다");
    const photoPaths: string[] = [];
    for (const f of files) photoPaths.push(await saveInboundPhoto(f));
    const hasInsp = form.get("hasInspection") === "on";
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
