import bcrypt from "bcryptjs";
import { prisma } from "./db";

export class ValidationError extends Error {}

export async function registerSeller(input: { email: string; password: string; contactName: string; companyName?: string; phone?: string; }) {
  if (typeof input?.email !== "string" || !input.email.trim() ||
      typeof input?.password !== "string" ||
      typeof input?.contactName !== "string" || !input.contactName.trim()) {
    throw new ValidationError("입력값이 올바르지 않습니다");
  }
  if (input.password.length < 8) throw new ValidationError("비밀번호는 8자 이상이어야 합니다");
  const exists = await prisma.user.findUnique({ where: { email: input.email } });
  if (exists) throw new ValidationError("이미 가입된 이메일입니다");
  const passwordHash = await bcrypt.hash(input.password, 10);
  try {
    return await prisma.user.create({
      data: { email: input.email, passwordHash, contactName: input.contactName, companyName: input.companyName, phone: input.phone },
    });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") throw new ValidationError("이미 가입된 이메일입니다");
    throw e;
  }
}

export async function verifyLogin(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}
