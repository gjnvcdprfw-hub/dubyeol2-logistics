import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionData = { userId?: string };

export const sessionOptions: SessionOptions = {
  // 로컬 개발 전용 시크릿. 배포 전 환경변수로 교체(금지선: secret 커밋 금지 — 이 값은 dev placeholder)
  password: process.env.SESSION_SECRET ?? "dev-only-secret-change-me-32chars!!",
  cookieName: "mulryu_session",
  cookieOptions: { secure: process.env.NODE_ENV === "production" },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}
