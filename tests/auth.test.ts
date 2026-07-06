import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "../src/lib/db";
import { registerSeller, verifyLogin, ValidationError } from "../src/lib/auth";

beforeEach(async () => {
  await prisma.shipmentPackageItem.deleteMany();
  await prisma.shipmentPackage.deleteMany();
  await prisma.inboundPhoto.deleteMany();
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
  it("password가 없으면 한국어 검증 오류를 던진다", async () => {
    await expect(registerSeller({ email: "e@e.com", contactName: "E" } as never))
      .rejects.toThrow("입력값이 올바르지 않습니다");
  });
  it("검증 오류는 ValidationError 타입이다", async () => {
    await expect(registerSeller({ email: "f@f.com", password: "short", contactName: "F" }))
      .rejects.toBeInstanceOf(ValidationError);
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

describe("logout route", () => {
  it("세션을 지우고 로그인 화면으로 보낸다", async () => {
    vi.resetModules();
    const destroy = vi.fn();
    vi.doMock("@/lib/session", () => ({
      getSession: vi.fn(async () => ({ destroy })),
    }));

    const { POST } = await import("../src/app/api/auth/logout/route");
    const response = await POST(new Request("http://localhost/api/auth/logout", { method: "POST" }));

    expect(destroy).toHaveBeenCalledOnce();
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/auth/login");

    vi.doUnmock("@/lib/session");
    vi.resetModules();
  });
});

describe("auth status route", () => {
  it("로그인한 사용자의 역할만 공개 상태로 돌려준다", async () => {
    vi.resetModules();
    vi.doMock("@/lib/session", () => ({
      getSessionUser: vi.fn(async () => ({ role: "SELLER" })),
    }));

    const { GET } = await import("../src/app/api/auth/me/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ authenticated: true, role: "SELLER" });

    vi.doUnmock("@/lib/session");
    vi.resetModules();
  });

  it("로그인하지 않은 사용자는 비로그인 상태만 돌려준다", async () => {
    vi.resetModules();
    vi.doMock("@/lib/session", () => ({
      getSessionUser: vi.fn(async () => null),
    }));

    const { GET } = await import("../src/app/api/auth/me/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ authenticated: false });

    vi.doUnmock("@/lib/session");
    vi.resetModules();
  });
});
