import { NextResponse } from "next/server";
import { ValidationError } from "@/lib/auth";
import { getSessionUser } from "@/lib/session";
import { saveShipmentPackage, type ShipmentPackageInput } from "@/lib/shipment-packages";

function wantsJson(req: Request) {
  return (req.headers.get("content-type") ?? "").includes("application/json");
}

function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return NaN;
}

function collectItemIndexes(keys: Iterable<string>) {
  return Array.from(new Set(
    Array.from(keys)
      .map((key) => key.match(/^sku\[(\d+)\]\[id\]$/)?.[1])
      .filter((value): value is string => Boolean(value)),
  )).sort((a, b) => Number(a) - Number(b));
}

async function readPayload(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    const items: unknown[] = Array.isArray(body?.items) ? body.items : [];
    return {
      orderId: typeof body?.orderId === "string" ? body.orderId : "",
      input: {
        marker: typeof body?.marker === "string" ? body.marker : "",
        status: typeof body?.status === "string" ? body.status : undefined,
        weightKg: toNumber(body?.weightKg),
        volumeCbm: toNumber(body?.volumeCbm),
        memo: typeof body?.memo === "string" ? body.memo : undefined,
        items: items.map((item) => {
          const row = item && typeof item === "object" ? item as Record<string, unknown> : {};
          return {
            skuLineId: typeof row.skuLineId === "string" ? row.skuLineId : "",
            quantity: toNumber(row.quantity),
          };
        }),
      } satisfies ShipmentPackageInput,
    };
  }

  const form = await req.formData();
  const indexes = collectItemIndexes(form.keys());
  const items = indexes
    .map((index) => ({
      skuLineId: String(form.get(`sku[${index}][id]`) ?? ""),
      quantity: toNumber(form.get(`sku[${index}][quantity]`)),
    }))
    .filter((item) => item.quantity > 0);
  return {
    orderId: String(form.get("orderId") ?? ""),
    input: {
      marker: String(form.get("marker") ?? ""),
      status: String(form.get("status") ?? ""),
      weightKg: toNumber(form.get("weightKg")),
      volumeCbm: toNumber(form.get("volumeCbm")),
      memo: String(form.get("memo") ?? ""),
      items,
    } satisfies ShipmentPackageInput,
  };
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "운영자 권한이 필요합니다" }, { status: 403 });
  }

  let orderId = "";

  try {
    const payload = await readPayload(req);
    orderId = payload.orderId;
    const { input } = payload;
    const result = await saveShipmentPackage(orderId, input);
    if (wantsJson(req)) {
      return NextResponse.json({ ok: true, result });
    }
    return NextResponse.redirect(new URL(`/admin/shipments/${orderId}?packed=1`, req.url), 303);
  } catch (error) {
    const message = error instanceof ValidationError ? error.message : "포장단위 저장 중 오류가 발생했습니다";
    if (wantsJson(req)) {
      return NextResponse.json({ ok: false, error: message }, { status: error instanceof ValidationError ? 400 : 500 });
    }
    return NextResponse.redirect(
      new URL(`/admin/shipments/${orderId}?error=${encodeURIComponent(message)}`, req.url),
      303,
    );
  }
}
