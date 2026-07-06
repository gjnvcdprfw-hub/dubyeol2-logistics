import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../src/lib/db";
import { registerSeller } from "../src/lib/auth";
import { createOrder } from "../src/lib/orders";
import { recordInbound } from "../src/lib/inbound";
import {
  getWalletSummary,
  getWalletTransactionLabel,
  recordWalletCredit,
  requestShipmentWithWallet,
} from "../src/lib/wallet";

const execFileAsync = promisify(execFile);

let sellerA: { id: string };
let sellerB: { id: string };

async function createQuotedOrder(sellerId: string, productName = "견적품") {
  const order = await createOrder(sellerId, {
    productUrl: "https://detail.1688.com/offer/777.html",
    productName,
    quantity: 10,
    serviceType: "PURCHASE",
    inspectionRequested: false,
  });
  await recordInbound(order.id, { photoPaths: ["/uploads/a.jpg"], outerIssue: false });
  return prisma.order.update({
    where: { id: order.id },
    data: {
      quoteUnitPriceFen: 2000,
      quoteCnShippingFen: 3000,
      quoteWeightGrams: 12000,
      quoteVolumeCm3: 80000,
      quoteExchangeRateX100: 19000,
      quoteShippingMethod: "SEA",
      quotedAt: new Date(),
    },
  });
}

beforeEach(async () => {
  vi.restoreAllMocks();
  await prisma.walletTransaction.deleteMany();
  await prisma.inboundPhoto.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
  sellerA = await registerSeller({ email: "wallet-a@test.local", password: "password1", contactName: "A" });
  sellerB = await registerSeller({ email: "wallet-b@test.local", password: "password1", contactName: "B" });
});

afterEach(() => {
  vi.doUnmock("@/lib/session");
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("wallet shipment request", () => {
  it("거래 타입별 지갑 라벨을 돌려준다", () => {
    expect(getWalletTransactionLabel("TOPUP_CREDIT")).toBe("예치금 충전 승인");
    expect(getWalletTransactionLabel("TEST_CREDIT")).toBe("로컬 QA 예치금");
    expect(getWalletTransactionLabel("SHIPMENT_DEBIT")).toBe("출고 요청 차감");
    expect(getWalletTransactionLabel("UNKNOWN")).toBe("지갑 거래");
  });

  it("견적 완료 주문 출고 요청 시 예치금을 차감하고 주문 상태를 함께 바꾼다", async () => {
    const order = await createQuotedOrder(sellerA.id);
    await recordWalletCredit(sellerA.id, 300000, "QA 예치금");

    const result = await requestShipmentWithWallet(sellerA.id, order.id);

    expect(result.order.status).toBe("SHIPMENT_REQUESTED");
    expect(result.order.shipmentRequestedAmountKrw).toBe(result.transaction.amountKrw * -1);
    expect(result.transaction.type).toBe("SHIPMENT_DEBIT");
    expect(result.transaction.orderId).toBe(order.id);
    expect(result.transaction.amountKrw).toBeLessThan(0);
    expect(result.balanceKrw).toBe(300000 + result.transaction.amountKrw);
  });

  it("SKU 상품가 합계가 총수량으로 나누어떨어지지 않아도 SKU 근거 합계로 출고 차감한다", async () => {
    const order = await createOrder(sellerA.id, {
      serviceType: "PURCHASE",
      inspectionRequested: false,
      items: [
        {
          productUrl: "https://detail.1688.com/offer/sku-wallet.html",
          productName: "SKU 정산품",
          skus: [
            { optionText: "빨강", quantity: 2 },
            { optionText: "파랑", quantity: 3 },
          ],
        },
      ],
    });
    await recordInbound(order.id, { photoPaths: ["/uploads/a.jpg"], outerIssue: false });
    const saved = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { productLines: { include: { skuLines: true }, orderBy: { sortOrder: "asc" } } },
    });
    const [red, blue] = saved.productLines[0].skuLines;
    await prisma.order.update({
      where: { id: order.id },
      data: {
        quoteUnitPriceFen: 81,
        quoteCnShippingFen: 350,
        quoteWeightGrams: 1000,
        quoteVolumeCm3: 0,
        quoteExchangeRateX100: 19000,
        quoteShippingMethod: "SEA",
        quotedAt: new Date("2026-07-06T00:00:00.000Z"),
      },
    });
    await prisma.orderSkuLine.update({ where: { id: red.id }, data: { quoteUnitPriceFen: 101, quoteCnShippingFen: 100 } });
    await prisma.orderSkuLine.update({ where: { id: blue.id }, data: { quoteUnitPriceFen: 67, quoteCnShippingFen: 250 } });
    const exactSkuBasisKrw = 6223;
    await recordWalletCredit(sellerA.id, exactSkuBasisKrw, "정확한 SKU 근거 예치금");

    const result = await requestShipmentWithWallet(sellerA.id, order.id);

    expect(result.transaction.amountKrw).toBe(-exactSkuBasisKrw);
    expect(result.order.shipmentRequestedAmountKrw).toBe(exactSkuBasisKrw);
    expect(result.balanceKrw).toBe(0);
  });

  it("잔액 부족이면 돈도 상태도 바꾸지 않는다", async () => {
    const order = await createQuotedOrder(sellerA.id);
    await recordWalletCredit(sellerA.id, 1000, "부족한 예치금");

    await expect(requestShipmentWithWallet(sellerA.id, order.id)).rejects.toThrow("예치금");

    const after = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    const txs = await prisma.walletTransaction.findMany({ where: { sellerId: sellerA.id } });
    expect(after.status).toBe("RECEIVED");
    expect(txs).toHaveLength(1);
    expect(txs[0].type).toBe("TEST_CREDIT");
  });

  it("다른 셀러 주문은 출고 요청할 수 없다", async () => {
    const orderB = await createQuotedOrder(sellerB.id, "B상품");
    await recordWalletCredit(sellerA.id, 300000, "A 예치금");

    await expect(requestShipmentWithWallet(sellerA.id, orderB.id)).rejects.toThrow("주문을 찾을 수 없습니다");
  });

  it("이미 출고 요청된 주문은 중복 차감하지 않는다", async () => {
    const order = await createQuotedOrder(sellerA.id);
    await recordWalletCredit(sellerA.id, 300000, "QA 예치금");
    await requestShipmentWithWallet(sellerA.id, order.id);

    await expect(requestShipmentWithWallet(sellerA.id, order.id)).rejects.toThrow("이미 출고 요청");

    const txs = await prisma.walletTransaction.findMany({ where: { sellerId: sellerA.id, type: "SHIPMENT_DEBIT" } });
    expect(txs).toHaveLength(1);
  });

  it("상태 전환 경쟁에서 주문 update가 0건이면 원장을 만들지 않는다", async () => {
    const order = await createQuotedOrder(sellerA.id);
    const credit = await recordWalletCredit(sellerA.id, 300000, "QA 예치금");
    const createTransaction = vi.fn();
    const tx = {
      user: {
        findUnique: vi.fn().mockResolvedValue({ walletBalanceKrw: 300000 }),
        findUniqueOrThrow: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      order: {
        findFirst: vi.fn().mockResolvedValue(order),
        update: vi.fn().mockResolvedValue({ ...order, status: "SHIPMENT_REQUESTED" }),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        findFirstOrThrow: vi.fn(),
      },
      walletTransaction: {
        findMany: vi.fn().mockResolvedValue([credit]),
        create: createTransaction,
      },
    };
    vi.spyOn(prisma, "$transaction").mockImplementation(async (callback: never) =>
      (callback as (transactionClient: typeof tx) => Promise<unknown>)(tx),
    );

    await expect(requestShipmentWithWallet(sellerA.id, order.id)).rejects.toThrow("이미 출고 요청");

    expect(tx.order.updateMany).toHaveBeenCalledWith({
      where: { id: order.id, sellerId: sellerA.id, status: "RECEIVED" },
      data: expect.objectContaining({ status: "SHIPMENT_REQUESTED" }),
    });
    expect(tx.user.update).not.toHaveBeenCalled();
    expect(tx.user.updateMany).not.toHaveBeenCalled();
    expect(createTransaction).not.toHaveBeenCalled();
  });

  it("셀러별 예치금 요약은 자기 거래만 계산한다", async () => {
    await recordWalletCredit(sellerA.id, 300000, "A 예치금");
    await recordWalletCredit(sellerB.id, 900000, "B 예치금");

    const summaryA = await getWalletSummary(sellerA.id);
    expect(summaryA.balanceKrw).toBe(300000);
    expect(summaryA.transactions).toHaveLength(1);
    expect(summaryA.transactions[0].sellerId).toBe(sellerA.id);
  });
});

describe("shipment request endpoint and QA wallet seed", () => {
  async function importShipmentRouteForSeller(sellerId: string) {
    vi.resetModules();
    vi.doMock("@/lib/session", () => ({
      getSession: vi.fn(async () => ({ userId: sellerId })),
    }));
    return import("../src/app/api/shipments/request/route");
  }

  it("JSON 출고 요청은 로그인 셀러의 예치금을 차감하고 JSON으로 결과를 돌려준다", async () => {
    const order = await createQuotedOrder(sellerA.id);
    await recordWalletCredit(sellerA.id, 300000, "QA 예치금");
    const { POST } = await importShipmentRouteForSeller(sellerA.id);

    const response = await POST(
      new Request("http://localhost/api/shipments/request", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.result.order.status).toBe("SHIPMENT_REQUESTED");
    expect(body.result.transaction.type).toBe("SHIPMENT_DEBIT");
    expect(body.result.transaction.orderId).toBe(order.id);
  });

  it("form 출고 요청은 처리 후 주문 상세로 303 redirect 한다", async () => {
    const order = await createQuotedOrder(sellerA.id);
    await recordWalletCredit(sellerA.id, 300000, "QA 예치금");
    const form = new FormData();
    form.set("orderId", order.id);
    const { POST } = await importShipmentRouteForSeller(sellerA.id);

    const response = await POST(
      new Request("http://localhost/api/shipments/request", {
        method: "POST",
        body: form,
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      `http://localhost/dashboard/orders/${order.id}?shipment=requested`,
    );
  });

  it("seed-wallet 스크립트는 로컬 QA 예치금을 셀러 지갑에 기록한다", async () => {
    const email = "wallet-seed@test.local";
    const seller = await registerSeller({ email, password: "password1", contactName: "Seed" });

    const { stdout } = await execFileAsync(
      "npx",
      ["--no-install", "tsx", "scripts/seed-wallet.ts", email, "50000"],
      { cwd: process.cwd() },
    );

    const tx = await prisma.walletTransaction.findFirstOrThrow({
      where: { sellerId: seller.id, type: "TEST_CREDIT" },
    });
    expect(tx.amountKrw).toBe(50000);
    expect(tx.balanceAfterKrw).toBe(50000);
    expect(tx.memo).toBe("로컬 QA 예치금");
    expect(stdout).toContain("예치금 준비 완료");
  });
});
