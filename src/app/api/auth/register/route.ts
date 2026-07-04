import { NextResponse } from "next/server";
import { registerSeller, ValidationError } from "@/lib/auth";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  const body = await req.json();
  try {
    const user = await registerSeller(body);
    const session = await getSession();
    session.userId = user.id;
    await session.save();
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof ValidationError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    }
    console.error("register error:", e);
    return NextResponse.json({ ok: false, error: "가입 처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}
