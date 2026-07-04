import { NextResponse } from "next/server";
import { registerSeller } from "@/lib/auth";
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
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 400 });
  }
}
