import { NextResponse } from "next/server";
import { ValidationError } from "@/lib/auth";
import { getSessionUser } from "@/lib/session";
import { approveWalletTopUpRequest } from "@/lib/wallet-topups";

type RouteContext = { params: Promise<{ id: string }> };

function wantsJson(req: Request) {
  return (req.headers.get("accept") ?? "").includes("application/json")
    || (req.headers.get("content-type") ?? "").includes("application/json");
}

async function readMemo(req: Request) {
  if ((req.headers.get("content-type") ?? "").includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    return String(body.memo ?? "");
  }

  const form = await req.formData();
  return String(form.get("memo") ?? "");
}

export async function POST(req: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    if (wantsJson(req)) {
      return NextResponse.json({ ok: false, error: "운영자 권한이 필요합니다" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/dashboard", req.url), 303);
  }

  const { id } = await context.params;

  try {
    const request = await approveWalletTopUpRequest(user.id, id, await readMemo(req));
    if (wantsJson(req)) {
      return NextResponse.json({ ok: true, request });
    }
    return NextResponse.redirect(new URL("/admin/wallet-topups?done=1", req.url), 303);
  } catch (error) {
    const message = error instanceof ValidationError ? error.message : "충전 요청 승인 중 오류가 발생했습니다";
    if (wantsJson(req)) {
      return NextResponse.json({ ok: false, error: message }, { status: error instanceof ValidationError ? 400 : 500 });
    }
    return NextResponse.redirect(
      new URL(`/admin/wallet-topups?error=${encodeURIComponent(message)}`, req.url),
      303,
    );
  }
}
