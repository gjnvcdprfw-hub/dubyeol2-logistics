# Phase 9 SKU Lines Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the current one-row order model into an order group with product lines and SKU lines so operations and settlement can be tracked per SKU.

**Architecture:** Keep `Order` as the order group for compatibility with Phase 1~7. Add `OrderProductLine` and `OrderSkuLine` as child records. Existing single-item order inputs are normalized into one product line and one SKU line so old screens and tests can keep working while new screens display SKU-level work and settlement evidence.

**Tech Stack:** Next.js 16 App Router, Prisma 6 SQLite, Vitest, TypeScript, existing `ValidationError`, existing `computeQuote()`.

## Global Constraints

- Phase 9 does **not** create package markers, box weight/CBM, packing list, shipment tracking, deposit charging, 1688 external integration, or real shipping documents.
- Preserve seller isolation: every seller-facing order read must be scoped by `sellerId`.
- Preserve existing Phase 1~7 paths while adding SKU detail.
- No new package dependencies.
- Use TDD for domain functions before UI wiring.
- Do not use `git add -A`; stage exact files only.

---

## File Structure

- Modify `prisma/schema.prisma`: add `OrderProductLine` and `OrderSkuLine`; keep legacy `Order.product*` fields during migration.
- Create migration via `npx prisma migrate dev --name order_sku_lines`.
- Modify `src/lib/orders.ts`: accept new multi-line input and normalize old single-line input.
- Create `src/lib/order-lines.ts`: shared validation, normalization, and include helpers for SKU lines.
- Modify `src/lib/inbound.ts`: allow SKU-level inbound/inspection results while keeping old aggregate path.
- Modify `src/lib/quote.ts` or create `src/lib/sku-quote.ts`: compute SKU purchase/inspection subtotals and preserve order-level shipping total.
- Modify `src/app/dashboard/orders/new/page.tsx`: allow multiple product/SKU rows; keep a simple single-row default.
- Modify `src/app/dashboard/orders/[id]/page.tsx`: show SKU table and order total.
- Modify `src/app/admin/orders/[id]/page.tsx`: record inbound/inspection by SKU.
- Modify `src/app/admin/orders/[id]/quote/page.tsx`: enter SKU unit price and China shipping per SKU, plus order-level weight/volume/shipping method.
- Modify `src/app/api/orders/route.ts`, `src/app/api/admin/inbound/route.ts`, `src/app/api/admin/quote/route.ts`: parse the new payloads.
- Tests: add/modify `tests/orders.test.ts`, `tests/inbound.test.ts`, `tests/quote.test.ts`.

---

### Task 1: Data Model And Order Normalization

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/lib/order-lines.ts`
- Modify: `src/lib/orders.ts`
- Test: `tests/orders.test.ts`

**Interfaces:**
- Produces: `type NewOrderProductLine`, `type NewOrderSkuLine`, `normalizeOrderLines(input)`, `orderWithLinesInclude`
- Produces: `createOrder(sellerId, input)` supporting both legacy single-line input and new `items`
- Consumes: existing `ValidationError`, `prisma`

- [ ] **Step 1: Add failing tests for multi-SKU order creation**

Add this test block to `tests/orders.test.ts`:

```ts
describe("createOrder — SKU 라인 구조", () => {
  it("주문 묶음 1건에 상품 라인과 SKU 라인을 저장한다", async () => {
    const order = await createOrder(sellerA.id, {
      serviceType: "PURCHASE",
      inspectionRequested: true,
      memo: "묶음 주문",
      items: [
        {
          productUrl: "https://detail.1688.com/offer/100.html",
          productName: "상품 A",
          skus: [
            { optionText: "빨강", quantity: 50 },
            { optionText: "파랑", quantity: 50 },
          ],
        },
        {
          productUrl: "https://detail.1688.com/offer/200.html",
          productName: "상품 B",
          skus: [{ optionText: "L", quantity: 30 }],
        },
      ],
    });

    const saved = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { productLines: { include: { skuLines: true }, orderBy: { sortOrder: "asc" } } },
    });

    expect(saved.quantity).toBe(130);
    expect(saved.productLines).toHaveLength(2);
    expect(saved.productLines[0].skuLines.map((sku) => sku.optionText)).toEqual(["빨강", "파랑"]);
    expect(saved.productLines[1].skuLines[0].quantity).toBe(30);
  });

  it("기존 단건 주문 입력은 SKU 1개짜리 주문으로 호환 저장한다", async () => {
    const order = await createOrder(sellerA.id, {
      productUrl: "https://detail.1688.com/offer/123.html",
      productName: "미니가전",
      optionText: "화이트",
      quantity: 100,
      serviceType: "PURCHASE",
      inspectionRequested: true,
    });

    const saved = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { productLines: { include: { skuLines: true } } },
    });

    expect(saved.productLines).toHaveLength(1);
    expect(saved.productLines[0].skuLines).toHaveLength(1);
    expect(saved.productLines[0].skuLines[0].optionText).toBe("화이트");
    expect(saved.productLines[0].skuLines[0].quantity).toBe(100);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run tests/orders.test.ts`

Expected: FAIL because `items`, `productLines`, and `skuLines` do not exist yet.

- [ ] **Step 3: Add Prisma models**

In `prisma/schema.prisma`, add relations to `Order`:

```prisma
  productLines              OrderProductLine[]
```

Add models:

```prisma
model OrderProductLine {
  id          String         @id @default(cuid())
  order       Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId     String
  productUrl  String
  productName String
  sortOrder   Int
  createdAt   DateTime       @default(now())
  skuLines    OrderSkuLine[]

  @@index([orderId])
}

model OrderSkuLine {
  id                  String           @id @default(cuid())
  productLine         OrderProductLine @relation(fields: [productLineId], references: [id], onDelete: Cascade)
  productLineId       String
  optionText          String
  quantity            Int
  inboundQuantity     Int?
  missingQuantity     Int?
  defectCount         Int?
  inspectionPassed    Boolean?
  inspectionNote      String?
  quoteUnitPriceFen   Int?
  quoteCnShippingFen  Int?
  sortOrder           Int
  createdAt           DateTime         @default(now())

  @@index([productLineId])
}
```

Run: `npx prisma migrate dev --name order_sku_lines`

Expected: migration succeeds and Prisma Client regenerates.

- [ ] **Step 4: Implement line normalization**

Create `src/lib/order-lines.ts`:

```ts
import { ValidationError } from "./auth";

export type NewOrderSkuLine = {
  optionText: string;
  quantity: number;
};

export type NewOrderProductLine = {
  productUrl: string;
  productName: string;
  skus: NewOrderSkuLine[];
};

export const orderWithLinesInclude = {
  productLines: {
    include: { skuLines: { orderBy: { sortOrder: "asc" as const } } },
    orderBy: { sortOrder: "asc" as const },
  },
};

export function normalizeOrderLines(input: {
  productUrl?: string;
  productName?: string;
  optionText?: string;
  quantity?: number;
  items?: NewOrderProductLine[];
}) {
  const items = input.items?.length
    ? input.items
    : [{
        productUrl: input.productUrl ?? "",
        productName: input.productName ?? "",
        skus: [{ optionText: input.optionText ?? "기본", quantity: Number(input.quantity) }],
      }];

  if (items.length < 1) throw new ValidationError("상품을 1개 이상 입력해 주세요");

  return items.map((item, productIndex) => {
    if (!/^https?:\/\/.+/.test(item.productUrl)) throw new ValidationError("상품 링크 형식이 올바르지 않습니다");
    if (!item.productName.trim()) throw new ValidationError("상품명을 입력해 주세요");
    if (!item.skus.length) throw new ValidationError("SKU를 1개 이상 입력해 주세요");

    return {
      productUrl: item.productUrl.trim(),
      productName: item.productName.trim(),
      sortOrder: productIndex,
      skuLines: item.skus.map((sku, skuIndex) => {
        if (!Number.isInteger(sku.quantity) || sku.quantity < 1) {
          throw new ValidationError("수량은 1 이상이어야 합니다");
        }
        return {
          optionText: (sku.optionText || "기본").trim(),
          quantity: sku.quantity,
          sortOrder: skuIndex,
        };
      }),
    };
  });
}

export function getTotalQuantity(lines: ReturnType<typeof normalizeOrderLines>) {
  return lines.reduce((sum, item) => sum + item.skuLines.reduce((s, sku) => s + sku.quantity, 0), 0);
}
```

- [ ] **Step 5: Update `createOrder()`**

Modify `src/lib/orders.ts`:

```ts
import { prisma } from "./db";
import { ValidationError } from "./auth";
import { getTotalQuantity, normalizeOrderLines, type NewOrderProductLine, orderWithLinesInclude } from "./order-lines";

export type NewOrder = {
  productUrl?: string;
  productName?: string;
  optionText?: string;
  quantity?: number;
  items?: NewOrderProductLine[];
  serviceType: "PURCHASE" | "SHIPPING";
  inspectionRequested: boolean;
  memo?: string;
};

export async function createOrder(sellerId: string, input: NewOrder) {
  if (!sellerId) throw new ValidationError("로그인이 필요합니다");
  if (input.serviceType !== "PURCHASE" && input.serviceType !== "SHIPPING") throw new ValidationError("서비스 유형이 올바르지 않습니다");

  const lines = normalizeOrderLines(input);
  const first = lines[0];
  const firstSku = first.skuLines[0];

  return prisma.order.create({
    data: {
      sellerId,
      productUrl: first.productUrl,
      productName: lines.length === 1 ? first.productName : `${first.productName} 외 ${lines.length - 1}개 상품`,
      optionText: lines.length === 1 && first.skuLines.length === 1 ? firstSku.optionText : `${getTotalQuantity(lines)}개 / ${lines.reduce((sum, item) => sum + item.skuLines.length, 0)} SKU`,
      quantity: getTotalQuantity(lines),
      serviceType: input.serviceType,
      inspectionRequested: Boolean(input.inspectionRequested),
      memo: input.memo,
      productLines: {
        create: lines.map((line) => ({
          productUrl: line.productUrl,
          productName: line.productName,
          sortOrder: line.sortOrder,
          skuLines: { create: line.skuLines },
        })),
      },
    },
    include: orderWithLinesInclude,
  });
}

export async function listOrdersBySeller(sellerId: string) {
  if (!sellerId) throw new ValidationError("로그인이 필요합니다");
  return prisma.order.findMany({
    where: { sellerId },
    orderBy: { createdAt: "desc" },
    include: orderWithLinesInclude,
  });
}
```

- [ ] **Step 6: Run Task 1 tests**

Run: `npx vitest run tests/orders.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit Task 1**

```bash
git add prisma/schema.prisma prisma/migrations src/lib/order-lines.ts src/lib/orders.ts tests/orders.test.ts
git commit -m "feat: add SKU line order structure"
```

### Task 2: SKU-Level Inbound And Inspection

**Files:**
- Modify: `src/lib/inbound.ts`
- Modify: `src/app/api/admin/inbound/route.ts`
- Modify: `src/app/admin/orders/[id]/page.tsx`
- Test: `tests/inbound.test.ts`

**Interfaces:**
- Consumes: `OrderSkuLine` rows from Task 1
- Produces: `recordInbound(orderId, { skuResults })` with SKU-level inbound/inspection fields

- [ ] **Step 1: Add failing SKU inbound test**

Add to `tests/inbound.test.ts`:

```ts
it("SKU별 입고·부족·하자 수량을 기록한다", async () => {
  const order = await createOrder(seller.id, {
    serviceType: "PURCHASE",
    inspectionRequested: true,
    items: [{
      productUrl: "https://a.com",
      productName: "상품 A",
      skus: [
        { optionText: "빨강", quantity: 50 },
        { optionText: "파랑", quantity: 50 },
      ],
    }],
  });
  const saved = await prisma.order.findUniqueOrThrow({
    where: { id: order.id },
    include: { productLines: { include: { skuLines: true }, orderBy: { sortOrder: "asc" } } },
  });
  const red = saved.productLines[0].skuLines[0];
  const blue = saved.productLines[0].skuLines[1];

  await recordInbound(order.id, {
    photoPaths: ["/uploads/a.jpg"],
    outerIssue: false,
    skuResults: [
      { skuLineId: red.id, inboundQuantity: 50, defectCount: 0, inspectionPassed: true, inspectionNote: "정상" },
      { skuLineId: blue.id, inboundQuantity: 45, defectCount: 0, inspectionPassed: true, inspectionNote: "5개 부족" },
    ],
  });

  const rows = await prisma.orderSkuLine.findMany({ orderBy: { sortOrder: "asc" } });
  expect(rows[0].inboundQuantity).toBe(50);
  expect(rows[0].missingQuantity).toBe(0);
  expect(rows[1].inboundQuantity).toBe(45);
  expect(rows[1].missingQuantity).toBe(5);
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run tests/inbound.test.ts`

Expected: FAIL because `skuResults` and `orderSkuLine` updates are not implemented.

- [ ] **Step 3: Extend inbound types and validation**

In `src/lib/inbound.ts`, extend types:

```ts
export type SkuInboundResult = {
  skuLineId: string;
  inboundQuantity: number;
  defectCount: number;
  inspectionPassed: boolean;
  inspectionNote?: string;
};

export type InboundInput = {
  photoPaths: string[];
  outerIssue: boolean;
  outerNote?: string;
  inspection?: { countActual: number; appearanceOk: boolean; defectCount: number; note?: string };
  skuResults?: SkuInboundResult[];
};
```

Inside `recordInbound()` after loading `order`, load SKU lines:

```ts
const skuLines = await prisma.orderSkuLine.findMany({
  where: { productLine: { orderId } },
});
```

Before updating the order, validate:

```ts
if (input.skuResults?.length) {
  const knownIds = new Set(skuLines.map((sku) => sku.id));
  for (const result of input.skuResults) {
    if (!knownIds.has(result.skuLineId)) throw new ValidationError("SKU 정보를 찾을 수 없습니다");
    const sku = skuLines.find((item) => item.id === result.skuLineId)!;
    if (!Number.isInteger(result.inboundQuantity) || result.inboundQuantity < 0 || result.inboundQuantity > sku.quantity) {
      throw new ValidationError("SKU 입고 수량이 올바르지 않습니다");
    }
    if (!Number.isInteger(result.defectCount) || result.defectCount < 0 || result.defectCount > result.inboundQuantity) {
      throw new ValidationError("SKU 하자 수량이 올바르지 않습니다");
    }
  }
  if (order.inspectionRequested && input.skuResults.length !== skuLines.length) {
    throw new ValidationError("유료 검수 신청 건은 모든 SKU의 검수 결과를 함께 기록해야 합니다");
  }
}
```

After `prisma.order.update()`, update each SKU line:

```ts
for (const result of input.skuResults ?? []) {
  const sku = skuLines.find((item) => item.id === result.skuLineId)!;
  await prisma.orderSkuLine.update({
    where: { id: result.skuLineId },
    data: {
      inboundQuantity: result.inboundQuantity,
      missingQuantity: sku.quantity - result.inboundQuantity,
      defectCount: result.defectCount,
      inspectionPassed: result.inspectionPassed,
      inspectionNote: result.inspectionNote,
    },
  });
}
```

- [ ] **Step 4: Parse SKU results in admin route**

In `src/app/api/admin/inbound/route.ts`, parse indexed fields:

```ts
const skuResults = Array.from(form.keys())
  .filter((key) => key.startsWith("sku[") && key.endsWith("][id]"))
  .map((key) => {
    const index = key.match(/^sku\[(\d+)\]\[id\]$/)![1];
    return {
      skuLineId: String(form.get(`sku[${index}][id]`) ?? ""),
      inboundQuantity: Number(form.get(`sku[${index}][inboundQuantity]`)),
      defectCount: Number(form.get(`sku[${index}][defectCount]`) ?? 0),
      inspectionPassed: form.get(`sku[${index}][inspectionPassed]`) === "on",
      inspectionNote: String(form.get(`sku[${index}][inspectionNote]`) ?? "") || undefined,
    };
  });
```

Pass `skuResults: skuResults.length ? skuResults : undefined` into `recordInbound()`.

- [ ] **Step 5: Add SKU fields to admin inbound page**

In `src/app/admin/orders/[id]/page.tsx`, load `productLines.skuLines` and render inputs named:

```tsx
<input type="hidden" name={`sku[${index}][id]`} value={sku.id} />
<input type="number" name={`sku[${index}][inboundQuantity]`} min={0} max={sku.quantity} defaultValue={sku.quantity} />
<input type="number" name={`sku[${index}][defectCount]`} min={0} defaultValue={0} />
<input type="checkbox" name={`sku[${index}][inspectionPassed]`} defaultChecked />
<input name={`sku[${index}][inspectionNote]`} placeholder="SKU별 검수 메모" />
```

Keep the existing aggregate fields only as fallback for legacy orders without SKU rows.

- [ ] **Step 6: Run Task 2 tests**

Run: `npx vitest run tests/inbound.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit Task 2**

```bash
git add src/lib/inbound.ts src/app/api/admin/inbound/route.ts "src/app/admin/orders/[id]/page.tsx" tests/inbound.test.ts
git commit -m "feat: record inbound results per SKU"
```

### Task 3: SKU-Level Quote And Seller Detail Display

**Files:**
- Modify: `src/app/api/admin/quote/route.ts`
- Modify: `src/lib/wallet.ts`
- Modify: `src/app/admin/orders/[id]/quote/page.tsx`
- Modify: `src/app/dashboard/orders/[id]/page.tsx`
- Test: `tests/quote.test.ts`

**Interfaces:**
- Consumes: `OrderSkuLine.quoteUnitPriceFen`, `OrderSkuLine.quoteCnShippingFen`
- Produces: SKU-level quote rows plus order-level total. Existing shipment/wallet paths keep a compatible order-level total.

- [ ] **Step 1: Add failing quote test**

Add to `tests/quote.test.ts`:

```ts
import { computeSkuSettlement } from "../src/lib/sku-quote";

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
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run tests/quote.test.ts`

Expected: FAIL because `src/lib/sku-quote.ts` does not exist.

- [ ] **Step 3: Create SKU quote helper**

Create `src/lib/sku-quote.ts`:

```ts
import { ValidationError } from "./auth";
import { RATES } from "./rates";

export type SkuSettlementInput = {
  inspectionRequested: boolean;
  exchangeRateX100: number;
  skus: Array<{
    label: string;
    quantity: number;
    unitPriceFen: number;
    cnShippingFen: number;
  }>;
};

export function computeSkuSettlement(input: SkuSettlementInput) {
  if (!Number.isInteger(input.exchangeRateX100) || input.exchangeRateX100 <= 0) throw new ValidationError("환율은 0보다 커야 합니다");
  const toKrw = (fen: number) => Math.round((fen * input.exchangeRateX100) / 10000);

  const lines = input.skus.map((sku) => {
    if (!Number.isInteger(sku.quantity) || sku.quantity < 1) throw new ValidationError("SKU 수량이 올바르지 않습니다");
    if (sku.unitPriceFen < 0 || sku.cnShippingFen < 0) throw new ValidationError("SKU 금액이 올바르지 않습니다");
    const productFen = sku.unitPriceFen * sku.quantity;
    const inspectionFen = input.inspectionRequested ? RATES.inspectionFeeFenPerUnit * sku.quantity : 0;
    const totalFen = productFen + sku.cnShippingFen + inspectionFen;
    return { ...sku, productFen, inspectionFen, totalFen, totalKrw: toKrw(totalFen) };
  });

  const totalFen = lines.reduce((sum, line) => sum + line.totalFen, 0);
  return { lines, totalFen, totalKrw: toKrw(totalFen) };
}
```

- [ ] **Step 4: Save SKU quote inputs in admin quote route**

In `src/app/api/admin/quote/route.ts`, parse fields:

```ts
const skuQuotes = Array.from(form.keys())
  .filter((key) => key.startsWith("sku[") && key.endsWith("][id]"))
  .map((key) => {
    const index = key.match(/^sku\[(\d+)\]\[id\]$/)![1];
    return {
      id: String(form.get(`sku[${index}][id]`) ?? ""),
      unitPriceFen: toFen(form.get(`sku[${index}][unitPriceYuan]`), "SKU 상품 단가"),
      cnShippingFen: toFen(form.get(`sku[${index}][cnShippingYuan]`), "SKU 중국 내 배송비"),
    };
  });
```

Before the existing `computeQuote()` validation, derive compatible aggregate values from the SKU rows:

```ts
const orderLines = await prisma.orderProductLine.findMany({
  where: { orderId: order.id },
  include: { skuLines: true },
});
const totalProductFen = skuQuotes.reduce((sum, sku) => {
  const source = orderLines.find((line) => line.skuLines.some((row) => row.id === sku.id));
  const row = source?.skuLines.find((item) => item.id === sku.id);
  return sum + sku.unitPriceFen * (row?.quantity ?? 0);
}, 0);
const totalCnShippingFen = skuQuotes.reduce((sum, sku) => sum + sku.cnShippingFen, 0);
const aggregateUnitPriceFen = order.quantity > 0 ? Math.round(totalProductFen / order.quantity) : 0;
```

Use `aggregateUnitPriceFen` and `totalCnShippingFen` for the existing order-level quote fields:

```ts
const unitPriceFen = skuQuotes.length ? aggregateUnitPriceFen : toFen(form.get("unitPriceYuan"), "상품 단가");
const cnShippingFen = skuQuotes.length ? totalCnShippingFen : toFen(form.get("cnShippingYuan"), "중국 내 배송비");
```

After order quote update, update SKU rows:

```ts
for (const sku of skuQuotes) {
  await prisma.orderSkuLine.update({
    where: { id: sku.id },
    data: { quoteUnitPriceFen: sku.unitPriceFen, quoteCnShippingFen: sku.cnShippingFen },
  });
}
```

Keep existing order-level `quoteWeightGrams`, `quoteVolumeCm3`, `quoteExchangeRateX100`, `quoteShippingMethod` for international shipping.

In `src/lib/wallet.ts`, keep `getQuotedOrderTotalKrw(order)` working for legacy orders. Do not change shipment debit behavior in Phase 9 unless a test proves the SKU order total is wrong; shipment/packing work belongs to Phase 11.

- [ ] **Step 5: Add SKU quote inputs to admin quote page**

In `src/app/admin/orders/[id]/quote/page.tsx`, load product/SKU lines and render:

```tsx
<input type="hidden" name={`sku[${index}][id]`} value={sku.id} />
<input type="number" name={`sku[${index}][unitPriceYuan]`} min={0} step={0.01} required />
<input type="number" name={`sku[${index}][cnShippingYuan]`} min={0} step={0.01} required />
```

For `SHIPPING` service type, default `unitPriceYuan` to `0`.

- [ ] **Step 6: Show SKU settlement in seller order detail**

In `src/app/dashboard/orders/[id]/page.tsx`, include product/SKU lines and render each SKU:

```tsx
{order.productLines.map((line) => (
  <section key={line.id}>
    <h3>{line.productName}</h3>
    {line.skuLines.map((sku) => (
      <div key={sku.id}>
        <span>{sku.optionText}</span>
        <span>주문 {sku.quantity}개</span>
        <span>입고 {sku.inboundQuantity ?? "-"}개</span>
        <span>부족 {sku.missingQuantity ?? 0}개</span>
        <span>하자 {sku.defectCount ?? 0}개</span>
      </div>
    ))}
  </section>
))}
```

Add a visible note: `포장단위는 출고요청 때 배정됩니다.`

- [ ] **Step 7: Run Task 3 tests**

Run: `npx vitest run tests/quote.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit Task 3**

```bash
git add src/lib/sku-quote.ts src/app/api/admin/quote/route.ts "src/app/admin/orders/[id]/quote/page.tsx" "src/app/dashboard/orders/[id]/page.tsx" tests/quote.test.ts
git commit -m "feat: show quote evidence per SKU"
```

### Task 4: Seller Order Form And Regression Verification

**Files:**
- Modify: `src/app/dashboard/orders/new/page.tsx`
- Modify: `src/app/dashboard/orders/page.tsx`
- Modify: `src/app/dashboard/inbound/page.tsx`
- Test: `tests/orders.test.ts`, `tests/inbound.test.ts`, `tests/quote.test.ts`

**Interfaces:**
- Consumes: `createOrder()` new `items` input from Task 1
- Produces: UI path for creating a multi-SKU order and viewing SKU summaries

- [ ] **Step 1: Update order form state**

In `src/app/dashboard/orders/new/page.tsx`, replace single product state with:

```ts
const [form, setForm] = useState({
  serviceType: "PURCHASE",
  inspectionRequested: false,
  memo: "",
  items: [{
    productUrl: "",
    productName: "",
    skus: [{ optionText: "", quantity: 1 }],
  }],
});
```

Submit:

```ts
body: JSON.stringify({
  ...form,
  items: form.items.map((item) => ({
    ...item,
    skus: item.skus.map((sku) => ({ ...sku, quantity: Number(sku.quantity) })),
  })),
})
```

- [ ] **Step 2: Render add/remove SKU controls**

Add buttons:

```tsx
<button type="button" onClick={() => addSku(productIndex)}>SKU 추가</button>
<button type="button" onClick={addProduct}>상품 추가</button>
```

Do not add 1688 search or external lookup.

- [ ] **Step 3: Keep list pages stable**

In `src/app/dashboard/orders/page.tsx` and `src/app/dashboard/inbound/page.tsx`, display order summary as:

```tsx
{o.productName} <span className="text-muted">· {o.quantity}개 / {o.productLines.reduce((sum, line) => sum + line.skuLines.length, 0)} SKU</span>
```

Fallback to the old `× {o.quantity}` if `productLines` is empty.

- [ ] **Step 4: Run full verification**

Run:

```bash
npx vitest run
npm run build
git diff --check
```

Expected:
- Vitest: all files pass.
- Build: compiled successfully.
- Diff check: no output.

- [ ] **Step 5: Commit Task 4**

```bash
git add src/app/dashboard/orders/new/page.tsx src/app/dashboard/orders/page.tsx src/app/dashboard/inbound/page.tsx tests/orders.test.ts tests/inbound.test.ts tests/quote.test.ts
git commit -m "feat: add multi-SKU order entry UI"
```

## Self-Review

- Spec coverage: Phase 9 requirements map to Task 1 (data structure), Task 2 (SKU inbound/inspection), Task 3 (SKU quote/settlement evidence), Task 4 (seller UI and regression).
- Placeholder scan: no `TBD`, `TODO`, or open placeholder remains.
- Type consistency: `NewOrderProductLine`, `NewOrderSkuLine`, `normalizeOrderLines`, `orderWithLinesInclude`, and SKU quote fields are defined before use.
- Scope check: package markers, packing list, deposit charge, shipment tracking, and 1688 integration are explicitly excluded from Phase 9.
