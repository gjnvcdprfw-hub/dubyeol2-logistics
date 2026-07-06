import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/db";
import { registerSeller } from "../src/lib/auth";
import {
  approveWalletTopUpRequest,
  createWalletTopUpRequest,
  listSellerWalletTopUps,
  rejectWalletTopUpRequest,
} from "../src/lib/wallet-topups";
import { getWalletSummary } from "../src/lib/wallet";

let sellerA: { id: string };
let sellerB: { id: string };
let admin: { id: string };

beforeEach(async () => {
  await prisma.walletTransaction.deleteMany();
  await prisma.walletTopUpRequest.deleteMany();
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

  it("거절하면 잔액과 원장은 늘지 않고 사유가 남는다", async () => {
    const request = await createWalletTopUpRequest(sellerA.id, { amountKrw: 100000, depositorName: "A" });

    const rejected = await rejectWalletTopUpRequest(admin.id, request.id, "입금자명 불일치");

    const summary = await getWalletSummary(sellerA.id);
    expect(rejected.status).toBe("REJECTED");
    expect(rejected.adminMemo).toContain("입금자명");
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

  it("충전 금액과 입금자명은 필수다", async () => {
    await expect(createWalletTopUpRequest(sellerA.id, { amountKrw: 0, depositorName: "A" })).rejects.toThrow("충전 금액");
    await expect(createWalletTopUpRequest(sellerA.id, { amountKrw: 1000, depositorName: " " })).rejects.toThrow("입금자명");
  });
});
