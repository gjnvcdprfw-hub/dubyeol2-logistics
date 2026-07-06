import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ authenticated: false });
  return NextResponse.json({ authenticated: true, role: user.role });
}
