import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST() {
  const session = await getSession();
  session.destroy();
  return new NextResponse(null, {
    status: 303,
    headers: { Location: "/auth/login" },
  });
}
