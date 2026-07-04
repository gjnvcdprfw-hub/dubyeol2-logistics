import { NextResponse } from "next/server";
import { verifyLogin } from "@/lib/auth";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const user = await verifyLogin(email, password);
    if (!user) return NextResponse.json({ ok: false, error: "이메일 또는 비밀번호가 올바르지 않습니다" }, { status: 401 });
    const session = await getSession();
    session.userId = user.id;
    await session.save();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("login error:", e);
    return NextResponse.json({ ok: false, error: "로그인 처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}
