import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { ValidationError } from "@/lib/auth";
import { createOrder, listOrdersBySeller } from "@/lib/orders";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ ok: false, error: "로그인이 필요합니다" }, { status: 401 });
  try {
    const order = await createOrder(session.userId, await req.json());
    return NextResponse.json({ ok: true, order });
  } catch (e) {
    if (e instanceof ValidationError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    }
    console.error("order create error:", e);
    return NextResponse.json({ ok: false, error: "주문 접수 중 오류가 발생했습니다" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ ok: false, error: "로그인이 필요합니다" }, { status: 401 });
  return NextResponse.json({ ok: true, orders: await listOrdersBySeller(session.userId) });
}
