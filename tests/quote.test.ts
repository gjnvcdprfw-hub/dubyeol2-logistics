import { describe, it, expect } from "vitest";
import { computeQuote } from "../src/lib/quote";

const base = {
  quantity: 100, serviceType: "PURCHASE" as const, inspectionRequested: true,
  unitPriceFen: 2000, cnShippingFen: 3000, weightGrams: 12000, volumeCm3: 80000,
  exchangeRateX100: 19000, shippingMethod: "SEA" as const,
};

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
  it("무게·부피·환율이 0 이하면 거부", () => {
    expect(() => computeQuote({ ...base, weightGrams: 0 })).toThrow("무게");
    expect(() => computeQuote({ ...base, exchangeRateX100: 0 })).toThrow("환율");
  });
});
