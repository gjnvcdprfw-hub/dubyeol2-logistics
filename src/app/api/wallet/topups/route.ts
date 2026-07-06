import { NextResponse } from "next/server";
import { ValidationError } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { createWalletTopUpRequest } from "@/lib/wallet-topups";

function wantsJson(req: Request) {
  return (req.headers.get("accept") ?? "").includes("application/json")
    || (req.headers.get("content-type") ?? "").includes("application/json");
}

async function readInput(req: Request) {
  if ((req.headers.get("content-type") ?? "").includes("application/json")) {
    return req.json();
  }

  const form = await req.formData();
  return {
    amountKrw: Number(form.get("amountKrw")),
    depositorName: String(form.get("depositorName") ?? ""),
    memo: String(form.get("memo") ?? ""),
  };
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    if (wantsJson(req)) {
      return NextResponse.json({ ok: false, error: "로그인이 필요합니다" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/auth/login", req.url), 303);
  }

  try {
    const request = await createWalletTopUpRequest(session.userId, await readInput(req));
    if (wantsJson(req)) {
      return NextResponse.json({ ok: true, request });
    }
    return NextResponse.redirect(new URL("/dashboard/wallet?topup=requested", req.url), 303);
  } catch (e) {
    const message = e instanceof ValidationError ? e.message : "충전 요청 처리 중 오류가 발생했습니다";
    if (wantsJson(req)) {
      return NextResponse.json({ ok: false, error: message }, { status: e instanceof ValidationError ? 400 : 500 });
    }
    return NextResponse.redirect(
      new URL(`/dashboard/wallet?topupError=${encodeURIComponent(message)}`, req.url),
      303,
    );
  }
}
