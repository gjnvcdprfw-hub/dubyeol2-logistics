import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { computeQuote } from "../src/lib/quote";
import { computeSkuSettlement } from "../src/lib/sku-quote";
import { RATES } from "../src/lib/rates";
import { prisma } from "../src/lib/db";
import { registerSeller } from "../src/lib/auth";
import { createOrder } from "../src/lib/orders";
import { recordInbound } from "../src/lib/inbound";

const base = {
  quantity: 100, serviceType: "PURCHASE" as const, inspectionRequested: true,
  unitPriceFen: 2000, cnShippingFen: 3000, weightGrams: 12000, volumeCm3: 80000,
  exchangeRateX100: 19000, shippingMethod: "SEA" as const,
};

let seller: { id: string };
let otherSeller: { id: string };

beforeEach(async () => {
  vi.restoreAllMocks();
  await prisma.walletTransaction.deleteMany();
  await prisma.inboundPhoto.deleteMany();
  await prisma.orderSkuLine.deleteMany();
  await prisma.orderProductLine.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
  seller = await registerSeller({ email: "quote-a@test.local", password: "password1", contactName: "Quote A" });
  otherSeller = await registerSeller({ email: "quote-b@test.local", password: "password1", contactName: "Quote B" });
});

afterEach(() => {
  vi.doUnmock("@/lib/session");
  vi.resetModules();
  vi.restoreAllMocks();
});

async function importAdminQuoteRoute() {
  vi.resetModules();
  vi.doMock("@/lib/session", () => ({
    getSessionUser: vi.fn(async () => ({ id: "admin-1", role: "ADMIN" })),
  }));
  return import("../src/app/api/admin/quote/route");
}

async function createReceivedSkuOrder(ownerId: string) {
  const order = await createOrder(ownerId, {
    serviceType: "PURCHASE",
    inspectionRequested: false,
    items: [
      {
        productUrl: "https://quote-route.test/item-1",
        productName: "SKU 주문",
        skus: [
          { optionText: "빨강", quantity: 2 },
          { optionText: "파랑", quantity: 3 },
        ],
      },
    ],
  });
  await recordInbound(order.id, { photoPaths: ["/uploads/a.jpg"], outerIssue: false });
  return prisma.order.findUniqueOrThrow({
    where: { id: order.id },
    include: { productLines: { include: { skuLines: true }, orderBy: { sortOrder: "asc" } } },
  });
}

function createBaseQuoteForm(orderId: string) {
  const form = new FormData();
  form.set("orderId", orderId);
  form.set("weightKg", "12");
  form.set("volumeCbm", "0.08");
  form.set("exchangeRate", "190");
  form.set("shippingMethod", "SEA");
  return form;
}

describe("computeQuote — 00-customer-outcome QA 예시", () => {
  it("항목별 금액이 요율표와 일치한다 (보온병 ×100, 12kg/0.08CBM, 해운)", () => {
    const q = computeQuote(base);
    expect(q.items.find(i => i.key === "product")!.amountFen).toBe(200000);      // ¥2,000
    expect(q.items.find(i => i.key === "cnShipping")!.amountFen).toBe(3000);     // ¥30
    expect(q.items.find(i => i.key === "commission")!.amountFen).toBe(10000);    // ¥100
    expect(q.items.find(i => i.key === "commissionVat")!.amountFen).toBe(1000);  // ¥10
    expect(q.items.find(i => i.key === "inspection")!.amountFen).toBe(10000);    // ¥100
    expect(q.chargeableWeightKg).toBe(14);                                        // max(12, 13.33) 올림
    expect(q.items.find(i => i.key === "intlShipping")!.amountFen).toBe(9000);   // ¥25+13×¥5=¥90
    expect(q.totalFen).toBe(233000);                                              // ¥2,330... 검증: 200000+3000+10000+1000+10000+9000=233000
  });
  it("합계는 항목 합과 항상 일치한다", () => {
    const q = computeQuote(base);
    expect(q.totalFen).toBe(q.items.reduce((s, i) => s + i.amountFen, 0));
  });
  it("검수 미신청 건은 검수비 항목 자체가 없다", () => {
    const q = computeQuote({ ...base, inspectionRequested: false });
    expect(q.items.find(i => i.key === "inspection")).toBeUndefined();
  });
  it("배송대행 건(SHIPPING)은 상품가·수수료 항목이 없다 (수수료 0% 정책)", () => {
    const q = computeQuote({ ...base, serviceType: "SHIPPING", unitPriceFen: 0 });
    expect(q.items.find(i => i.key === "product")).toBeUndefined();
    expect(q.items.find(i => i.key === "commission")).toBeUndefined();
    expect(q.items.find(i => i.key === "commissionVat")).toBeUndefined();
  });
  it("항공 운임: 서류비 + 100g 단위 올림", () => {
    const q = computeQuote({ ...base, shippingMethod: "AIR", weightGrams: 1250, volumeCm3: 0 });
    // 1250g → 13×100g 올림 → 3250 + 13×180 = 5590펀 (¥55.9)
    expect(q.items.find(i => i.key === "intlShipping")!.amountFen).toBe(5590);
  });
  it("항공: 정확히 100g 배수 무게에서 과청구하지 않는다 (16100g → 161단위)", () => {
    const q = computeQuote({ ...base, shippingMethod: "AIR", weightGrams: 16100, volumeCm3: 0 });
    // 161단위 × 180 + 3250 = 32230펀
    expect(q.items.find(i => i.key === "intlShipping")!.amountFen).toBe(32230);
  });
  it("원화 환산은 환율×100 정수 연산으로 원 단위 반올림", () => {
    const q = computeQuote(base);
    // ¥2,330 = 233000펀 × 19000 / 100 / 100 = ₩442,700
    expect(q.totalKrw).toBe(442700);
  });
  it("SKU 합계 상품가가 총수량으로 나누어떨어지지 않아도 정확한 상품가 합계로 수수료를 계산한다", () => {
    const q = computeQuote({
      ...base,
      quantity: 5,
      unitPriceFen: 10002,
      cnShippingFen: 350,
      productTotalFen: 50008,
      inspectionRequested: false,
      weightGrams: 1000,
      volumeCm3: 0,
    });

    expect(q.items.find(i => i.key === "product")!.amountFen).toBe(50008);
    expect(q.items.find(i => i.key === "commission")!.amountFen).toBe(Math.round(50008 * RATES.commissionRate));
    expect(q.totalFen).toBe(q.items.reduce((s, i) => s + i.amountFen, 0));
  });
  it("항목 라벨의 요율 숫자는 RATES에서 파생된다", () => {
    const q = computeQuote(base);
    expect(q.items.find(i => i.key === "commission")!.label).toBe(`구매대행 수수료 (${RATES.commissionRate * 100}%)`);
    expect(q.items.find(i => i.key === "commissionVat")!.label).toBe(`수수료 부가세 (${RATES.commissionVatRate * 100}%)`);
    expect(q.items.find(i => i.key === "inspection")!.label).toBe(`유료 검수비 (¥${RATES.inspectionFeeFenPerUnit / 100}/개)`);
  });
  it("무게·부피·환율이 0 이하면 거부", () => {
    expect(() => computeQuote({ ...base, weightGrams: 0 })).toThrow("무게");
    expect(() => computeQuote({ ...base, exchangeRateX100: 0 })).toThrow("환율");
  });
  it("NaN·비정수 quantity 입력을 거부한다", () => {
    expect(() => computeQuote({ ...base, weightGrams: NaN })).toThrow();
    expect(() => computeQuote({ ...base, exchangeRateX100: NaN })).toThrow();
    expect(() => computeQuote({ ...base, quantity: 0 })).toThrow("수량");
    expect(() => computeQuote({ ...base, quantity: 1.5 })).toThrow("수량");
  });
});

describe("computeSkuSettlement", () => {
  it("SKU별 상품가·검수비·중국배송비와 주문 묶음 합계를 계산한다", () => {
    const result = computeSkuSettlement({
      inspectionRequested: true,
      exchangeRateX100: 19000,
      skus: [
        { label: "상품 A / 빨강", quantity: 50, unitPriceFen: 1000, cnShippingFen: 2000 },
        { label: "상품 A / 파랑", quantity: 45, unitPriceFen: 1200, cnShippingFen: 3000 },
      ],
    });

    expect(result.lines).toHaveLength(2);
    expect(result.lines[0].productFen).toBe(50000);
    expect(result.lines[1].productFen).toBe(54000);
    expect(result.totalFen).toBeGreaterThan(104000);
    expect(result.totalKrw).toBe(Math.round((result.totalFen * 19000) / 10000));
  });
});

describe("admin quote route", () => {
  it("SKU 행이 있는 주문에서 일부 SKU 견적이 빠지면 400으로 거부한다", async () => {
    const order = await createReceivedSkuOrder(seller.id);
    const [firstSku] = order.productLines[0].skuLines;
    const form = createBaseQuoteForm(order.id);
    form.set("sku[0][id]", firstSku.id);
    form.set("sku[0][unitPriceYuan]", "10");
    form.set("sku[0][cnShippingYuan]", "2");

    const { POST } = await importAdminQuoteRoute();
    const response = await POST(
      new Request("http://localhost/api/admin/quote", {
        method: "POST",
        body: form,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("모든 SKU의 견적을 함께 입력해 주세요");
  });

  it("다른 주문의 SKU id를 끼워 넣으면 400으로 거부한다", async () => {
    const order = await createReceivedSkuOrder(seller.id);
    const otherOrder = await createReceivedSkuOrder(otherSeller.id);
    const [orderSku] = order.productLines[0].skuLines;
    const [wrongSku] = otherOrder.productLines[0].skuLines;
    const form = createBaseQuoteForm(order.id);
    form.set("sku[0][id]", orderSku.id);
    form.set("sku[0][unitPriceYuan]", "10");
    form.set("sku[0][cnShippingYuan]", "2");
    form.set("sku[1][id]", wrongSku.id);
    form.set("sku[1][unitPriceYuan]", "11");
    form.set("sku[1][cnShippingYuan]", "3");

    const { POST } = await importAdminQuoteRoute();
    const response = await POST(
      new Request("http://localhost/api/admin/quote", {
        method: "POST",
        body: form,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("주문에 속한 SKU만 견적을 입력할 수 있습니다");
  });

  it.each([
    ["unitPriceYuan 누락", "unit", null],
    ["unitPriceYuan 공백", "unit", ""],
    ["cnShippingYuan 누락", "shipping", null],
    ["cnShippingYuan 공백", "shipping", ""],
  ])("SKU %s이면 400으로 거부한다", async (_label, missingField, value) => {
    const order = await createReceivedSkuOrder(seller.id);
    const [firstSku, secondSku] = order.productLines[0].skuLines;
    const form = createBaseQuoteForm(order.id);
    form.set("sku[0][id]", firstSku.id);
    form.set("sku[1][id]", secondSku.id);
    form.set("sku[0][unitPriceYuan]", "10");
    form.set("sku[0][cnShippingYuan]", "2");
    form.set("sku[1][unitPriceYuan]", "11");
    form.set("sku[1][cnShippingYuan]", "3");
    const target = missingField === "unit" ? "sku[1][unitPriceYuan]" : "sku[1][cnShippingYuan]";
    if (value === null) form.delete(target);
    else form.set(target, value);

    const { POST } = await importAdminQuoteRoute();
    const response = await POST(
      new Request("http://localhost/api/admin/quote", {
        method: "POST",
        body: form,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toMatch(/SKU .*값이 올바르지 않습니다/);
  });

  it("주문 견적과 SKU 견적 저장을 같은 prisma.$transaction 경계에서 처리한다", async () => {
    const order = await createReceivedSkuOrder(seller.id);
    const [firstSku, secondSku] = order.productLines[0].skuLines;
    const form = createBaseQuoteForm(order.id);
    form.set("sku[0][id]", firstSku.id);
    form.set("sku[0][unitPriceYuan]", "10");
    form.set("sku[0][cnShippingYuan]", "2");
    form.set("sku[1][id]", secondSku.id);
    form.set("sku[1][unitPriceYuan]", "11");
    form.set("sku[1][cnShippingYuan]", "3");

    const tx = {
      order: {
        update: vi.fn(async () => order),
      },
      orderSkuLine: {
        update: vi.fn()
          .mockRejectedValueOnce(new Error("sku update failed")),
      },
    };
    const transactionSpy = vi.spyOn(prisma, "$transaction").mockImplementation(
      async (callback: Parameters<typeof prisma.$transaction>[0]) =>
        (callback as (client: typeof tx) => Promise<unknown>)(tx),
    );

    const { POST } = await importAdminQuoteRoute();
    const response = await POST(
      new Request("http://localhost/api/admin/quote", {
        method: "POST",
        body: form,
      }),
    );

    expect(response.status).toBe(500);
    expect(transactionSpy).toHaveBeenCalledTimes(1);
    expect(tx.order.update).toHaveBeenCalledTimes(1);
    expect(tx.orderSkuLine.update).toHaveBeenCalledTimes(1);
  });
});
