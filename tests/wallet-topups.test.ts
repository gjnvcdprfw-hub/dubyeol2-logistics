import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../src/lib/db";
import { registerSeller } from "../src/lib/auth";
import {
  approveWalletTopUpRequest,
  createWalletTopUpRequest,
  listAdminWalletTopUps,
  listSellerWalletTopUps,
  rejectWalletTopUpRequest,
} from "../src/lib/wallet-topups";
import { getWalletSummary } from "../src/lib/wallet";

let sellerA: { id: string };
let sellerB: { id: string };
let admin: { id: string };

beforeEach(async () => {
  await prisma.shipmentPackageItem.deleteMany();
  await prisma.shipmentPackage.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.walletTopUpRequest.deleteMany();
  await prisma.inboundPhoto.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
  sellerA = await registerSeller({ email: "topup-a@test.local", password: "password1", contactName: "A" });
  sellerB = await registerSeller({ email: "topup-b@test.local", password: "password1", contactName: "B" });
  admin = await prisma.user.create({
    data: { email: "topup-admin@test.local", passwordHash: "x", contactName: "Admin", role: "ADMIN" },
  });
});

describe("wallet top-up requests", () => {
  it("셀러가 충전 요청을 만들면 잔액은 아직 늘지 않는다", async () => {
    const request = await createWalletTopUpRequest(sellerA.id, {
      amountKrw: 100000,
      depositorName: "맹기범",
      memo: "출고 전 충전",
    });

    const summary = await getWalletSummary(sellerA.id);
    expect(request.status).toBe("PENDING");
    expect(request.amountKrw).toBe(100000);
    expect(summary.balanceKrw).toBe(0);
  });

  it("운영자가 승인하면 잔액과 원장이 한 번 증가하고 요청에 연결된다", async () => {
    const request = await createWalletTopUpRequest(sellerA.id, { amountKrw: 100000, depositorName: "A" });

    const approved = await approveWalletTopUpRequest(admin.id, request.id, "입금 확인");

    const summary = await getWalletSummary(sellerA.id);
    expect(approved.status).toBe("APPROVED");
    expect(approved.processedById).toBe(admin.id);
    expect(approved.walletTransactionId).toBeTruthy();
    expect(summary.balanceKrw).toBe(100000);
    expect(summary.transactions).toHaveLength(1);
    expect(summary.transactions[0].type).toBe("TOPUP_CREDIT");
    expect(summary.transactions[0].amountKrw).toBe(100000);
    expect(summary.transactions[0].balanceAfterKrw).toBe(100000);
  });

  it("이미 승인된 요청은 다시 승인되어도 두 번째 원장을 만들지 않는다", async () => {
    const request = await createWalletTopUpRequest(sellerA.id, { amountKrw: 100000, depositorName: "A" });
    await approveWalletTopUpRequest(admin.id, request.id, "입금 확인");

    await expect(approveWalletTopUpRequest(admin.id, request.id, "재승인")).rejects.toThrow("이미 처리");

    const summary = await getWalletSummary(sellerA.id);
    expect(summary.balanceKrw).toBe(100000);
    expect(summary.transactions).toHaveLength(1);
  });

  it("같은 셀러의 서로 다른 pending 충전 2건을 동시에 승인해도 balanceAfterKrw는 누적 잔액을 반영한다", async () => {
    const first = await createWalletTopUpRequest(sellerA.id, { amountKrw: 100000, depositorName: "A-1" });
    const second = await createWalletTopUpRequest(sellerA.id, { amountKrw: 250000, depositorName: "A-2" });
    const initialSnapshot = await prisma.walletTransaction.findMany({ where: { sellerId: sellerA.id } });
    let waitingReaders = 0;
    let releaseReaders: (() => void) | null = null;
    const readersReady = new Promise<void>((resolve) => {
      releaseReaders = resolve;
    });

    const transactionSpy = vi.spyOn(prisma, "$transaction").mockImplementation(async (callback: never) => {
      const tx = {
        user: {
          findUnique: prisma.user.findUnique.bind(prisma.user),
          update: prisma.user.update.bind(prisma.user),
        },
        walletTopUpRequest: {
          findUnique: prisma.walletTopUpRequest.findUnique.bind(prisma.walletTopUpRequest),
          updateMany: prisma.walletTopUpRequest.updateMany.bind(prisma.walletTopUpRequest),
          update: prisma.walletTopUpRequest.update.bind(prisma.walletTopUpRequest),
        },
        walletTransaction: {
          findMany: vi.fn(async () => {
            waitingReaders += 1;
            if (waitingReaders === 2) {
              releaseReaders?.();
            }
            await readersReady;
            return initialSnapshot;
          }),
          create: prisma.walletTransaction.create.bind(prisma.walletTransaction),
        },
      };

      return callback(tx as never);
    });

    await Promise.all([
      approveWalletTopUpRequest(admin.id, first.id, "첫 입금 확인"),
      approveWalletTopUpRequest(admin.id, second.id, "둘째 입금 확인"),
    ]);

    transactionSpy.mockRestore();

    const summary = await getWalletSummary(sellerA.id);
    const balances = summary.transactions
      .filter((tx) => tx.type === "TOPUP_CREDIT")
      .map((tx) => tx.balanceAfterKrw);

    expect(summary.balanceKrw).toBe(350000);
    expect(balances).toHaveLength(2);
    expect(Math.max(...balances)).toBe(350000);
  });

  it("거절하면 잔액과 원장은 늘지 않고 사유가 남는다", async () => {
    const request = await createWalletTopUpRequest(sellerA.id, { amountKrw: 100000, depositorName: "A" });

    const rejected = await rejectWalletTopUpRequest(admin.id, request.id, "입금자명 불일치");

    const summary = await getWalletSummary(sellerA.id);
    expect(rejected.status).toBe("REJECTED");
    expect(rejected.adminMemo).toContain("입금자명");
    expect(summary.balanceKrw).toBe(0);
    expect(summary.transactions).toHaveLength(0);
  });

  it("운영자 권한이 없으면 승인과 거절이 모두 거부된다", async () => {
    const request = await createWalletTopUpRequest(sellerA.id, { amountKrw: 100000, depositorName: "A" });

    await expect(approveWalletTopUpRequest(sellerA.id, request.id, "셀러 승인 시도")).rejects.toThrow("권한");
    await expect(rejectWalletTopUpRequest(sellerA.id, request.id, "셀러 거절 시도")).rejects.toThrow("권한");
    await expect(approveWalletTopUpRequest("missing-admin-id", request.id, "없는 사용자")).rejects.toThrow("권한");
    await expect(rejectWalletTopUpRequest("missing-admin-id", request.id, "없는 사용자")).rejects.toThrow("권한");

    const summary = await getWalletSummary(sellerA.id);
    const freshRequest = await prisma.walletTopUpRequest.findUniqueOrThrow({ where: { id: request.id } });
    expect(freshRequest.status).toBe("PENDING");
    expect(freshRequest.processedById).toBeNull();
    expect(summary.balanceKrw).toBe(0);
    expect(summary.transactions).toHaveLength(0);
  });

  it("셀러는 자기 충전 요청만 본다", async () => {
    await createWalletTopUpRequest(sellerA.id, { amountKrw: 100000, depositorName: "A" });
    await createWalletTopUpRequest(sellerB.id, { amountKrw: 900000, depositorName: "B" });

    const list = await listSellerWalletTopUps(sellerA.id);

    expect(list).toHaveLength(1);
    expect(list[0].sellerId).toBe(sellerA.id);
    expect(list[0].amountKrw).toBe(100000);
  });

  it("관리자 목록은 pending 우선 최신순으로 판매자 식별 정보와 함께 반환한다", async () => {
    const olderPending = await createWalletTopUpRequest(sellerA.id, { amountKrw: 100000, depositorName: "A" });
    await prisma.walletTopUpRequest.update({
      where: { id: olderPending.id },
      data: { createdAt: new Date("2026-07-05T10:00:00.000Z") },
    });

    const rejected = await createWalletTopUpRequest(sellerB.id, { amountKrw: 200000, depositorName: "B" });
    await prisma.walletTopUpRequest.update({
      where: { id: rejected.id },
      data: { createdAt: new Date("2026-07-05T11:00:00.000Z") },
    });
    await rejectWalletTopUpRequest(admin.id, rejected.id, "입금자명 불일치");

    const newerPending = await createWalletTopUpRequest(sellerA.id, { amountKrw: 300000, depositorName: "A2" });
    await prisma.walletTopUpRequest.update({
      where: { id: newerPending.id },
      data: { createdAt: new Date("2026-07-05T12:00:00.000Z") },
    });

    const list = await listAdminWalletTopUps();

    expect(list).toHaveLength(3);
    expect(list.map((item) => item.id)).toEqual([newerPending.id, olderPending.id, rejected.id]);
    expect(list[0].seller).toMatchObject({
      email: "topup-a@test.local",
      contactName: "A",
      companyName: null,
    });
    expect(list[2].seller).toMatchObject({
      email: "topup-b@test.local",
      contactName: "B",
      companyName: null,
    });
  });

  it("충전 금액과 입금자명은 필수다", async () => {
    await expect(createWalletTopUpRequest(sellerA.id, { amountKrw: 0, depositorName: "A" })).rejects.toThrow("충전 금액");
    await expect(createWalletTopUpRequest(sellerA.id, { amountKrw: 1000, depositorName: " " })).rejects.toThrow("입금자명");
  });
});

describe("seller wallet top-up route", () => {
  async function importSellerTopUpRoute(sellerId: string) {
    vi.resetModules();
    vi.doMock("@/lib/session", () => ({
      getSession: vi.fn(async () => ({ userId: sellerId })),
    }));
    return import("../src/app/api/wallet/topups/route");
  }

  it("JSON 충전 요청은 로그인 셀러로 PENDING 요청을 만든다", async () => {
    const { POST } = await importSellerTopUpRoute(sellerA.id);

    const response = await POST(new Request("http://localhost/api/wallet/topups", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ amountKrw: 100000, depositorName: "맹기범", memo: "출고 전 충전" }),
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.request.status).toBe("PENDING");
    expect(body.request.sellerId).toBe(sellerA.id);
  });

  it("form 충전 요청은 예치금 화면으로 redirect 한다", async () => {
    const { POST } = await importSellerTopUpRoute(sellerA.id);
    const form = new FormData();
    form.set("amountKrw", "100000");
    form.set("depositorName", "맹기범");

    const response = await POST(new Request("http://localhost/api/wallet/topups", {
      method: "POST",
      body: form,
    }));

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("http://localhost/dashboard/wallet?topup=requested");
  });

  it("셀러 충전 요청 폼은 1000원 단위 금액을 브라우저 기본 유효성에서 허용한다", () => {
    const source = readFileSync("src/app/dashboard/wallet/page.tsx", "utf8");

    expect(source).toContain('min="1000"');
    expect(source).toContain('step="1000"');
    expect(source).not.toContain('min="1"');
  });
});

describe("admin wallet top-up routes", () => {
  async function importAdminRoute(path: "approve" | "reject", userId: string) {
    vi.resetModules();
    vi.doMock("@/lib/session", () => ({
      getSessionUser: vi.fn(async () => ({ id: userId, role: userId === admin.id ? "ADMIN" : "SELLER" })),
    }));
    if (path === "approve") return import("../src/app/api/admin/wallet-topups/[id]/approve/route");
    return import("../src/app/api/admin/wallet-topups/[id]/reject/route");
  }

  it("운영자 승인 route는 충전 요청을 승인하고 JSON 결과를 돌려준다", async () => {
    const request = await createWalletTopUpRequest(sellerA.id, { amountKrw: 100000, depositorName: "A" });
    const { POST } = await importAdminRoute("approve", admin.id);

    const response = await POST(new Request(`http://localhost/api/admin/wallet-topups/${request.id}/approve`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ memo: "입금 확인" }),
    }), { params: Promise.resolve({ id: request.id }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.request.status).toBe("APPROVED");
  });

  it("운영자가 아닌 사용자는 승인할 수 없다", async () => {
    const request = await createWalletTopUpRequest(sellerA.id, { amountKrw: 100000, depositorName: "A" });
    const { POST } = await importAdminRoute("approve", sellerA.id);

    const response = await POST(new Request(`http://localhost/api/admin/wallet-topups/${request.id}/approve`, {
      method: "POST",
      headers: { accept: "application/json" },
    }), { params: Promise.resolve({ id: request.id }) });

    expect(response.status).toBe(403);
  });

  it("운영자 거절 route는 잔액을 바꾸지 않는다", async () => {
    const request = await createWalletTopUpRequest(sellerA.id, { amountKrw: 100000, depositorName: "A" });
    const { POST } = await importAdminRoute("reject", admin.id);

    const response = await POST(new Request(`http://localhost/api/admin/wallet-topups/${request.id}/reject`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ reason: "입금자명 불일치" }),
    }), { params: Promise.resolve({ id: request.id }) });
    const summary = await getWalletSummary(sellerA.id);

    expect(response.status).toBe(200);
    expect(summary.balanceKrw).toBe(0);
    expect(summary.transactions).toHaveLength(0);
  });
});
