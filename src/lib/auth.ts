import bcrypt from "bcryptjs";
import { prisma } from "./db";

export async function registerSeller(input: { email: string; password: string; contactName: string; companyName?: string; phone?: string; }) {
  if (input.password.length < 8) throw new Error("비밀번호는 8자 이상이어야 합니다");
  const exists = await prisma.user.findUnique({ where: { email: input.email } });
  if (exists) throw new Error("이미 가입된 이메일입니다");
  const passwordHash = await bcrypt.hash(input.password, 10);
  return prisma.user.create({
    data: { email: input.email, passwordHash, contactName: input.contactName, companyName: input.companyName, phone: input.phone },
  });
}

export async function verifyLogin(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}
