import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { prisma } from "./db";

export type SessionData = { userId?: string };

function getSessionOptions(): SessionOptions {
  const sessionSecret =
    process.env.SESSION_SECRET ??
    (process.env.NODE_ENV === "production"
      ? undefined
      : "dev-only-secret-change-me-32chars!!");
  if (!sessionSecret) {
    throw new Error("SESSION_SECRET 환경변수가 설정되어야 합니다 (production)");
  }
  return {
    password: sessionSecret,
    cookieName: "mulryu_session",
    cookieOptions: { secure: process.env.NODE_ENV === "production" },
  };
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), getSessionOptions());
}

export async function getSessionUser() {
  const session = await getSession();
  if (!session.userId) return null;
  return prisma.user.findUnique({ where: { id: session.userId } });
}
