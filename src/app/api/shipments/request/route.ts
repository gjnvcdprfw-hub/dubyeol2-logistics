import { NextResponse } from "next/server";
import { ValidationError } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { requestShipmentWithWallet } from "@/lib/wallet";

async function readOrderId(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await req.json();
    return typeof body?.orderId === "string" ? body.orderId : "";
  }

  const form = await req.formData();
  const value = form.get("orderId");
  return typeof value === "string" ? value : "";
}

function acceptsJson(req: Request) {
  return (req.headers.get("accept") ?? "").includes("application/json");
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ ok: false, error: "로그인이 필요합니다" }, { status: 401 });
  }

  const orderId = await readOrderId(req);
  try {
    const result = await requestShipmentWithWallet(session.userId, orderId);
    if (acceptsJson(req)) return NextResponse.json({ ok: true, result });
    return NextResponse.redirect(new URL(`/dashboard/orders/${orderId}?shipment=requested`, req.url), 303);
  } catch (e) {
    if (e instanceof ValidationError) {
      if (acceptsJson(req)) {
        return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
      }
      return NextResponse.redirect(
        new URL(`/dashboard/orders/${orderId}?shipmentError=${encodeURIComponent(e.message)}`, req.url),
        303,
      );
    }

    console.error("shipment request error:", e);
    return NextResponse.json({ ok: false, error: "출고 요청 중 오류가 발생했습니다" }, { status: 500 });
  }
}
