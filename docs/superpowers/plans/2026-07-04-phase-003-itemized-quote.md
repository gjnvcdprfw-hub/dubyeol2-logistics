# Phase 3: 항목별 견적 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 운영자가 견적 입력(단가·중국내배송·무게·부피·환율·배송방식)을 하면 두리무역 요율로 자동 계산된 **항목별 견적**이 셀러 주문 상세에 표시된다. Feature 1 완료 조각.

**Architecture:** 요율은 `src/lib/rates.ts` **단일 정의 파일**(대표님 컷팅 대비 — 하드코딩 산재 금지). 견적 계산은 `src/lib/quote.ts` 순수 함수 `computeQuote`(TDD) — **돈은 전부 정수 연산**(위안은 펀[分, 0.01¥] 정수, 원은 정수). DB에는 운영자 **입력값만** 저장하고 항목·합계는 렌더 시 계산(이중 소스 방지). 운영자 폼·셀러 카드 패턴은 Phase 2 확립분 재사용.

**Tech Stack:** 기존 그대로. 신규 의존성 없음.

**계약 문서:** `phase-packets/phase-003/00-customer-outcome.md` §3 (QA 예시 숫자 포함) / 요율 출처 `benchmark-duly.md` §3

**금지선:** push·원격·실DB·유료 API(환율 자동 연동 포함) 금지. `git add -A` 금지. 하네스 문서 수정 금지. TDD 순서 준수.

**고객 약속 하드라인:** ①합계=항목 합 ②계산이 요율표와 일치 ③검수 미신청 건에 검수비 항목 자체가 없음 ④"예상 운임·관세/부가세 별도" 면책 문구 ⑤타 셀러 견적 노출 금지

---

## File Structure

```
src/lib/rates.ts        # 요율 단일 정의 (두리무역 초기값 — 대표님 컷팅 대상)
src/lib/quote.ts        # computeQuote 순수 함수 (정수 연산)
tests/quote.test.ts
prisma/schema.prisma    # Order에 견적 입력 필드 추가
src/app/api/admin/quote/route.ts        # POST 견적 입력 (ADMIN)
src/app/admin/orders/[id]/quote/page.tsx # 운영자 견적 입력 폼
src/app/admin/orders/page.tsx            # RECEIVED 건에 [견적 입력] 링크 (수정)
src/app/dashboard/orders/[id]/page.tsx   # 셀러 견적 카드 (수정)
```

### Task 1: 요율 정의 + 견적 계산 (TDD) + 스키마

**Files:** Create `src/lib/rates.ts`, `src/lib/quote.ts`, `tests/quote.test.ts`; Modify `prisma/schema.prisma`

- [ ] **Step 1: 스키마 — Order에 견적 입력 필드** (입력값만 저장):
```prisma
  quoteUnitPriceFen     Int?      // 상품 단가 (펀=0.01¥). 배송대행 건은 0 허용
  quoteCnShippingFen    Int?      // 중국 내 배송비 (펀)
  quoteWeightGrams      Int?      // 실측 무게 (g)
  quoteVolumeCm3        Int?      // 부피 (cm³) — CBM×1,000,000
  quoteExchangeRateX100 Int?      // 적용 환율 ₩/¥ ×100 (예: 190.50 → 19050)
  quoteShippingMethod   String?   // "SEA" | "AIR"
  quotedAt              DateTime?
```
`npx prisma migrate dev --name quote`

- [ ] **Step 2: 요율 정의** `src/lib/rates.ts`:
```ts
// 요율 단일 정의 — 두리무역 공개 요율 초기값 (benchmark-duly.md §3).
// 대표님 컷팅(조정)은 이 파일만 수정하면 된다. 다른 파일에 요율 숫자 하드코딩 금지.
export const RATES = {
  commissionRate: 0.05,          // 구매대행 수수료: 상품가의 5%
  commissionVatRate: 0.1,        // 수수료 VAT: 수수료의 10%
  inspectionFeeFenPerUnit: 100,  // 유료 검수: ¥1/개 (=100펀)
  volumeDivisor: 6000,           // 부피중량 계수: cm³ ÷ 6000 = kg
  sea: { firstKgFen: 2500, additionalPerKgFen: 500 },   // 해운: 첫 1kg ¥25 + kg당 ¥5 (kg 올림)
  air: { docFeeFen: 3250, per100gFen: 180 },            // 항공: 서류비 ¥32.5 + 100g당 ¥1.8 (100g 올림)
} as const;
```

- [ ] **Step 3: 실패하는 테스트** `tests/quote.test.ts` (순수 함수 — DB 불필요):
```ts
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
```

- [ ] **Step 4: 실패 확인** — `npx vitest run tests/quote.test.ts` FAIL

- [ ] **Step 5: 구현** `src/lib/quote.ts`:
```ts
import { RATES } from "./rates";
import { ValidationError } from "./auth";

export type QuoteInput = {
  quantity: number;
  serviceType: "PURCHASE" | "SHIPPING";
  inspectionRequested: boolean;
  unitPriceFen: number;      // 배송대행 건 0 허용
  cnShippingFen: number;
  weightGrams: number;
  volumeCm3: number;
  exchangeRateX100: number;
  shippingMethod: "SEA" | "AIR";
};

export type QuoteItem = { key: string; label: string; amountFen: number };

export function computeQuote(input: QuoteInput) {
  if (input.weightGrams <= 0) throw new ValidationError("무게는 0보다 커야 합니다");
  if (input.exchangeRateX100 <= 0) throw new ValidationError("환율은 0보다 커야 합니다");
  if (input.volumeCm3 < 0 || input.cnShippingFen < 0 || input.unitPriceFen < 0)
    throw new ValidationError("입력값이 올바르지 않습니다");

  const items: QuoteItem[] = [];

  if (input.serviceType === "PURCHASE") {
    const productFen = input.unitPriceFen * input.quantity;
    const commissionFen = Math.round(productFen * RATES.commissionRate);
    const vatFen = Math.round(commissionFen * RATES.commissionVatRate);
    items.push({ key: "product", label: "상품가", amountFen: productFen });
    items.push({ key: "cnShipping", label: "중국 내 배송비", amountFen: input.cnShippingFen });
    items.push({ key: "commission", label: "구매대행 수수료 (5%)", amountFen: commissionFen });
    items.push({ key: "commissionVat", label: "수수료 부가세 (10%)", amountFen: vatFen });
  } else {
    items.push({ key: "cnShipping", label: "중국 내 배송비", amountFen: input.cnShippingFen });
  }

  if (input.inspectionRequested) {
    items.push({ key: "inspection", label: "유료 검수비 (¥1/개)", amountFen: RATES.inspectionFeeFenPerUnit * input.quantity });
  }

  // 청구중량: 실중량 vs 부피중량(cm³/6000) 중 큰 값
  const actualKg = input.weightGrams / 1000;
  const volumetricKg = input.volumeCm3 / RATES.volumeDivisor;
  const chargeableRaw = Math.max(actualKg, volumetricKg);

  let intlFen: number;
  let chargeableWeightKg: number;
  if (input.shippingMethod === "SEA") {
    chargeableWeightKg = Math.max(1, Math.ceil(chargeableRaw));      // kg 단위 올림, 최소 1kg
    intlFen = RATES.sea.firstKgFen + (chargeableWeightKg - 1) * RATES.sea.additionalPerKgFen;
  } else {
    const units100g = Math.max(1, Math.ceil((chargeableRaw * 1000) / 100)); // 100g 단위 올림
    chargeableWeightKg = units100g / 10;
    intlFen = RATES.air.docFeeFen + units100g * RATES.air.per100gFen;
  }
  items.push({ key: "intlShipping", label: `예상 국제운임 (${input.shippingMethod === "SEA" ? "해운" : "항공"})`, amountFen: intlFen });

  const totalFen = items.reduce((s, i) => s + i.amountFen, 0);
  const toKrw = (fen: number) => Math.round((fen * input.exchangeRateX100) / 10000);
  return {
    items, totalFen, chargeableWeightKg,
    totalKrw: toKrw(totalFen),
    itemsKrw: items.map(i => ({ ...i, amountKrw: toKrw(i.amountFen) })),
  };
}
```

- [ ] **Step 6: 통과 확인** — `npx vitest run` 전체 (22 + 7 = 29). **주의**: QA 예시 totalFen 기대값은 233000 — 테스트 실행 전 손으로 재검산하고, 불일치 시 요율표(benchmark §3) 기준이 정본. 통과 후 `npm run build`

- [ ] **Step 7: 커밋** — `git add src/lib/rates.ts src/lib/quote.ts tests/quote.test.ts prisma/ && git commit -m "feat: 요율 정의·항목별 견적 계산 TDD (정수 연산)"`

### Task 2: 운영자 견적 입력

**Files:** Create `src/app/api/admin/quote/route.ts`, `src/app/admin/orders/[id]/quote/page.tsx`; Modify `src/app/admin/orders/page.tsx`

- [ ] **Step 1: API** `src/app/api/admin/quote/route.ts` — Phase 2 inbound route 패턴 그대로 (ADMIN 403 가드 → 파싱 → 검증 → 저장 → 303 redirect):
```ts
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { ValidationError } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computeQuote } from "@/lib/quote";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN")
    return NextResponse.json({ ok: false, error: "권한이 없습니다" }, { status: 403 });
  try {
    const form = await req.formData();
    const orderId = String(form.get("orderId") ?? "");
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new ValidationError("주문을 찾을 수 없습니다");
    if (order.status !== "RECEIVED") throw new ValidationError("입고 완료된 주문만 견적을 입력할 수 있습니다");

    const toFen = (v: FormDataEntryValue | null, field: string) => {
      const n = Math.round(Number(v) * 100);
      if (!Number.isFinite(n) || n < 0) throw new ValidationError(`${field} 값이 올바르지 않습니다`);
      return n;
    };
    const unitPriceFen = toFen(form.get("unitPriceYuan"), "상품 단가");
    const cnShippingFen = toFen(form.get("cnShippingYuan"), "중국 내 배송비");
    const weightGrams = Math.round(Number(form.get("weightKg")) * 1000);
    const volumeCm3 = Math.round(Number(form.get("volumeCbm")) * 1_000_000);
    const exchangeRateX100 = Math.round(Number(form.get("exchangeRate")) * 100);
    const shippingMethod = String(form.get("shippingMethod"));
    if (shippingMethod !== "SEA" && shippingMethod !== "AIR") throw new ValidationError("배송 방식이 올바르지 않습니다");

    // 저장 전 계산 검증 — computeQuote가 던지면 저장하지 않음
    computeQuote({
      quantity: order.quantity,
      serviceType: order.serviceType as "PURCHASE" | "SHIPPING",
      inspectionRequested: order.inspectionRequested,
      unitPriceFen, cnShippingFen, weightGrams, volumeCm3, exchangeRateX100, shippingMethod,
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { quoteUnitPriceFen: unitPriceFen, quoteCnShippingFen: cnShippingFen, quoteWeightGrams: weightGrams, quoteVolumeCm3: volumeCm3, quoteExchangeRateX100: exchangeRateX100, quoteShippingMethod: shippingMethod, quotedAt: new Date() },
    });
    return NextResponse.redirect(new URL("/admin/orders?quoted=1", req.url), 303);
  } catch (e) {
    if (e instanceof ValidationError)
      return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    console.error("quote error:", e);
    return NextResponse.json({ ok: false, error: "견적 처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}
```

- [ ] **Step 2: 폼** `src/app/admin/orders/[id]/quote/page.tsx` — Phase 2 입고 폼 패턴(자체 ADMIN 가드+RECEIVED 아닌 건 notFound). 필드: 상품 단가 ¥(step 0.01, 배송대행 건은 0 안내), 중국 내 배송비 ¥, 실측 무게 kg(step 0.01), 부피 CBM(step 0.0001), 적용 환율 ₩/¥(step 0.01), 배송 방식 radio 해운/항공. 전부 required. 버튼 "견적 저장". PURCHASE 건이면 단가 required, SHIPPING 건이면 단가 입력란에 `defaultValue={0}` + "배송대행 건은 상품가 없음" 안내
- [ ] **Step 3: 목록 수정** `src/app/admin/orders/page.tsx` — RECEIVED 건: `quotedAt`이 없으면 [견적 입력] 링크(`/admin/orders/${o.id}/quote`), 있으면 "견적 완료" 텍스트
- [ ] **Step 4: 검증·커밋** — `npm run build && npx vitest run` → `git add src/app/api/admin/quote/ "src/app/admin/orders/[id]/quote/" src/app/admin/orders/page.tsx && git commit -m "feat: 운영자 견적 입력"`

### Task 3: 셀러 견적 카드 + 마무리

**Files:** Modify `src/app/dashboard/orders/[id]/page.tsx`, `src/app/dashboard/orders/page.tsx`

- [ ] **Step 1: 셀러 상세에 견적 카드 추가** — 입고 증거 섹션 아래. `order.quotedAt`이 있으면 `computeQuote` 호출해 렌더:
```tsx
{order.quotedAt && order.quoteShippingMethod && (
  <section className="bg-surface rounded-[27px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-6 space-y-3">
    <h2 className="text-[14px] font-semibold text-heading">항목별 견적</h2>
    {(() => {
      const q = computeQuote({
        quantity: order.quantity,
        serviceType: order.serviceType as "PURCHASE" | "SHIPPING",
        inspectionRequested: order.inspectionRequested,
        unitPriceFen: order.quoteUnitPriceFen!, cnShippingFen: order.quoteCnShippingFen!,
        weightGrams: order.quoteWeightGrams!, volumeCm3: order.quoteVolumeCm3!,
        exchangeRateX100: order.quoteExchangeRateX100!, shippingMethod: order.quoteShippingMethod as "SEA" | "AIR",
      });
      const yuan = (fen: number) => `¥${(fen / 100).toLocaleString("ko-KR", { minimumFractionDigits: 2 })}`;
      const krw = (w: number) => `₩${w.toLocaleString("ko-KR")}`;
      return (
        <>
          <ul className="text-sm space-y-1.5">
            {q.itemsKrw.map((i) => (
              <li key={i.key} className="flex justify-between">
                <span className="text-secondary">{i.label}</span>
                <span className="text-body">{yuan(i.amountFen)} <span className="text-muted">({krw(i.amountKrw)})</span></span>
              </li>
            ))}
          </ul>
          <div className="border-t border-black/5 pt-2 flex justify-between text-sm font-semibold">
            <span className="text-heading">합계</span>
            <span className="text-heading">{yuan(q.totalFen)} <span className="text-brand">({krw(q.totalKrw)})</span></span>
          </div>
          <p className="text-xs text-muted">청구중량 {q.chargeableWeightKg}kg 기준 · 적용 환율 ₩{(order.quoteExchangeRateX100! / 100).toFixed(2)}/¥ · 국제운임은 예상 금액이며 관세·부가세는 통관 시 별도입니다. 표시 금액은 참고용 안내입니다.</p>
        </>
      );
    })()}
  </section>
)}
{order.status === "RECEIVED" && !order.quotedAt && (
  <div className="bg-surface rounded-[27px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-6 text-sm text-muted">
    견적 산정 중입니다. 완료되면 항목별로 표시됩니다.
  </div>
)}
```
(import 추가: `import { computeQuote } from "@/lib/quote";`)

- [ ] **Step 2: 목록에 견적 배지** — `orders/page.tsx` 배지 영역에 `o.quotedAt`이면 `<span className="rounded-full bg-info/10 text-info px-2 py-1">견적 완료</span>` 추가 (info 토큰은 globals.css에 이미 정의)
- [ ] **Step 3: 최종 검증** — `npx vitest run && npm run build && npx -y @google/design.md lint .harness/dubyeol2/design-system.md`(errors 0)
- [ ] **Step 4: 커밋** — `git add src/app/dashboard/ && git commit -m "feat: 셀러 항목별 견적 카드"`

---

## Self-Review 결과
- 커버리지: 00 §3(운영자 입력↔T2, 자동 계산↔T1, 항목별 카드↔T3, 검수 미신청 항목 없음↔T1 테스트, 면책 문구↔T3, 요율 단일 파일↔rates.ts) — 갭 없음
- 정수 연산: 펀·원·×100 환율 전부 정수, 반올림 규칙 명시(수수료·VAT round, 운임 단위 올림, 원화 round)
- 재검산: 200000+3000+10000+1000+10000+9000=233000펀=¥2,330, ×190=₩442,700 ✓ (00 예시의 "¥2,230"은 오기 — 233000펀이 정본, 00은 합계 재검산 시 ¥2,330으로 정정할 것)
- 타입 일관성: QuoteInput·rates 키 이름 일치 확인
