import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "../src/lib/db";
import { registerSeller, verifyLogin } from "../src/lib/auth";

beforeEach(async () => {
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
});

describe("registerSeller", () => {
  it("이메일·비밀번호·담당자명으로 가입하고 비밀번호는 해시로 저장한다", async () => {
    const user = await registerSeller({ email: "a@b.com", password: "secret123", contactName: "셀러A" });
    expect(user.email).toBe("a@b.com");
    const row = await prisma.user.findUnique({ where: { email: "a@b.com" } });
    expect(row!.passwordHash).not.toContain("secret123");
  });
  it("중복 이메일은 거부한다", async () => {
    await registerSeller({ email: "a@b.com", password: "secret123", contactName: "셀러A" });
    await expect(registerSeller({ email: "a@b.com", password: "x1234567", contactName: "B" }))
      .rejects.toThrow("이미 가입된 이메일");
  });
  it("8자 미만 비밀번호는 거부한다", async () => {
    await expect(registerSeller({ email: "c@d.com", password: "short", contactName: "C" }))
      .rejects.toThrow("비밀번호는 8자 이상");
  });
});

describe("verifyLogin", () => {
  it("올바른 자격이면 사용자를 반환한다", async () => {
    await registerSeller({ email: "a@b.com", password: "secret123", contactName: "셀러A" });
    const u = await verifyLogin("a@b.com", "secret123");
    expect(u?.email).toBe("a@b.com");
  });
  it("틀린 비밀번호면 null", async () => {
    await registerSeller({ email: "a@b.com", password: "secret123", contactName: "셀러A" });
    expect(await verifyLogin("a@b.com", "wrongpass")).toBeNull();
  });
});
