# Phase 11 Shipment Packages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let admins assign requested shipment SKU quantities into BOX-1/BOX-2 package units and let sellers see the same package composition, weight, CBM, and status.

**Architecture:** Add package records below `Order` and item records below `OrderSkuLine`. The domain layer validates shipment-requested status, SKU ownership, and per-SKU package quantity totals before saving. Admin screens mutate package data; seller screens only read package data scoped by `sellerId`.

**Tech Stack:** Next.js 16 App Router, Prisma 6 SQLite, Vitest, TypeScript, existing `ValidationError`, existing `getSession()` / `getSessionUser()` auth helpers.

## Global Constraints

- Phase 11 does not create real shipping labels, external tracking, customs API calls, carrier API calls, automatic waybill sync, actual delivery completion, production packing-list PDF generation, deploy, git push, or remote merge.
- Package markers are local workflow markers such as `BOX-1`, `BOX-2`; they are not carrier labels.
- Preserve seller isolation: every seller-facing read must be scoped by `sellerId`.
- Admin writes must only affect orders in `SHIPMENT_REQUESTED` status.
- Package item total quantity for a SKU must never exceed its shippable quantity: `max(0, (inboundQuantity ?? quantity) - (defectCount ?? 0))`.
- Package save must replace one package marker atomically: package metadata and package items are stored in one Prisma transaction.
- Keep existing order, wallet, top-up, quote, inbound, and shipment request tests green.
- No new package dependencies.
- Use TDD for domain and route functions before UI wiring.
- Do not use `git add -A`; stage exact files only.

---

## File Structure

- Modify `prisma/schema.prisma`: add `ShipmentPackage`, `ShipmentPackageItem`; add relations to `Order` and `OrderSkuLine`.
- Create migration with `npx prisma migrate dev --name shipment_packages`.
- Modify `src/lib/order-lines.ts`: include shipment package relations where existing order views need them.
- Create `src/lib/shipment-packages.ts`: validation, package save, seller/admin listing helpers, display labels.
- Create `src/app/api/admin/shipments/packages/route.ts`: admin creates/updates one package marker from form or JSON.
- Create `src/app/admin/shipments/page.tsx`: admin shipment order queue.
- Create `src/app/admin/shipments/[id]/page.tsx`: admin package form and existing package list.
- Modify `src/app/admin/layout.tsx`: add admin shipment link.
- Modify `src/app/dashboard/shipment/page.tsx`: show package status and box summaries.
- Modify `src/app/dashboard/orders/[id]/page.tsx`: show package composition inside order detail.
- Tests: add `tests/shipment-packages.test.ts`; extend existing route/UI tests only if needed.

---

### Task 1: Package Model And Domain

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `src/lib/order-lines.ts`
- Create: `src/lib/shipment-packages.ts`
- Test: `tests/shipment-packages.test.ts`

**Interfaces:**
- Produces: `saveShipmentPackage(orderId, input)`, `listSellerShipmentPackages(sellerId, orderId)`, `listAdminShipmentOrders()`, `getAdminShipmentOrder(orderId)`, `getShipmentPackageStatusLabel(status)`
- `saveShipmentPackage(orderId, input)` input:
  ```ts
  {
    marker: string;
    status?: string;
    weightKg: number;
    volumeCbm: number;
    memo?: string | null;
    items: Array<{ skuLineId: string; quantity: number }>;
  }
  ```
- Produces package status strings: `PACKING`, `PACKED`, `READY`.

- [ ] **Step 1: Write failing domain tests**

Create `tests/shipment-packages.test.ts` with helpers that create a multi-SKU order, record inbound results, quote it, credit wallet, and call `requestShipmentWithWallet()`.

Core test cases:
```ts
it("운영자가 출고요청 주문에 박스별 SKU 구성을 저장한다", async () => {
  const { order, red, blue } = await createShipmentRequestedSkuOrder(sellerA.id);

  const box = await saveShipmentPackage(order.id, {
    marker: "BOX-1",
    status: "PACKED",
    weightKg: 12.5,
    volumeCbm: 0.08,
    memo: "1차 포장",
    items: [
      { skuLineId: red.id, quantity: 2 },
      { skuLineId: blue.id, quantity: 1 },
    ],
  });

  expect(box.marker).toBe("BOX-1");
  expect(box.weightGrams).toBe(12500);
  expect(box.volumeCm3).toBe(80000);
  expect(box.items).toHaveLength(2);
});

it("SKU 출고 가능 수량보다 많이 박스에 배정하면 거부한다", async () => {
  const { order, blue } = await createShipmentRequestedSkuOrder(sellerA.id);

  await expect(saveShipmentPackage(order.id, {
    marker: "BOX-1",
    status: "PACKED",
    weightKg: 10,
    volumeCbm: 0.1,
    items: [{ skuLineId: blue.id, quantity: 99 }],
  })).rejects.toThrow("출고 가능 수량");
});

it("출고요청 상태가 아닌 주문에는 포장단위를 저장하지 않는다", async () => {
  const order = await createQuotedOrderWithoutShipmentRequest(sellerA.id);
  const sku = await firstSku(order.id);

  await expect(saveShipmentPackage(order.id, {
    marker: "BOX-1",
    status: "PACKED",
    weightKg: 10,
    volumeCbm: 0.1,
    items: [{ skuLineId: sku.id, quantity: 1 }],
  })).rejects.toThrow("출고 요청");
});

it("셀러는 자기 주문의 포장단위만 본다", async () => {
  const { order, red } = await createShipmentRequestedSkuOrder(sellerA.id);
  await saveShipmentPackage(order.id, {
    marker: "BOX-1",
    status: "PACKED",
    weightKg: 12.5,
    volumeCbm: 0.08,
    items: [{ skuLineId: red.id, quantity: 1 }],
  });

  const own = await listSellerShipmentPackages(sellerA.id, order.id);
  await expect(listSellerShipmentPackages(sellerB.id, order.id)).rejects.toThrow("주문을 찾을 수 없습니다");
  expect(own).toHaveLength(1);
  expect(own[0].items[0].skuLineId).toBe(red.id);
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run tests/shipment-packages.test.ts`

Expected: FAIL because package models and `src/lib/shipment-packages.ts` do not exist yet.

- [ ] **Step 3: Add Prisma schema**

Modify `prisma/schema.prisma`.

Add to `Order`:
```prisma
  shipmentPackages          ShipmentPackage[]
```

Add to `OrderSkuLine`:
```prisma
  shipmentPackageItems ShipmentPackageItem[]
```

Add models:
```prisma
model ShipmentPackage {
  id          String                @id @default(cuid())
  order       Order                 @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId     String
  marker      String
  status      String                @default("PACKING")
  weightGrams Int
  volumeCm3   Int
  memo        String?
  createdAt   DateTime              @default(now())
  updatedAt   DateTime              @updatedAt
  items       ShipmentPackageItem[]

  @@unique([orderId, marker])
  @@index([orderId])
  @@index([status])
}

model ShipmentPackageItem {
  id         String          @id @default(cuid())
  package    ShipmentPackage @relation(fields: [packageId], references: [id], onDelete: Cascade)
  packageId  String
  skuLine    OrderSkuLine    @relation(fields: [skuLineId], references: [id], onDelete: Cascade)
  skuLineId  String
  quantity   Int
  createdAt  DateTime        @default(now())

  @@unique([packageId, skuLineId])
  @@index([skuLineId])
}
```

Run: `npx prisma migrate dev --name shipment_packages`

Expected: migration succeeds and Prisma Client regenerates.

- [ ] **Step 4: Implement domain functions**

Create `src/lib/shipment-packages.ts`:

```ts
import { ValidationError } from "./auth";
import { prisma } from "./db";
import { orderWithLinesInclude } from "./order-lines";

export type ShipmentPackageInput = {
  marker: string;
  status?: string;
  weightKg: number;
  volumeCbm: number;
  memo?: string | null;
  items: Array<{ skuLineId: string; quantity: number }>;
};

export const SHIPMENT_PACKAGE_STATUSES = ["PACKING", "PACKED", "READY"] as const;

export function getShipmentPackageStatusLabel(status: string) {
  switch (status) {
    case "PACKING":
      return "포장중";
    case "PACKED":
      return "포장완료";
    case "READY":
      return "출고대기";
    default:
      return status;
  }
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toPositiveMeasurement(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) throw new ValidationError(`${label} 값이 올바르지 않습니다`);
  return value;
}

function shippableQuantity(sku: { quantity: number; inboundQuantity: number | null; defectCount: number | null }) {
  return Math.max(0, (sku.inboundQuantity ?? sku.quantity) - (sku.defectCount ?? 0));
}

function normalizeInput(input: ShipmentPackageInput) {
  const marker = cleanText(input.marker).toUpperCase();
  if (!/^BOX-[A-Z0-9-]+$/.test(marker)) throw new ValidationError("포장단위 마커는 BOX-1 형식으로 입력해 주세요");
  const status = cleanText(input.status || "PACKING").toUpperCase();
  if (!SHIPMENT_PACKAGE_STATUSES.includes(status as never)) throw new ValidationError("포장 상태가 올바르지 않습니다");
  const weightGrams = Math.round(toPositiveMeasurement(Number(input.weightKg), "무게") * 1000);
  const volumeCm3 = Math.round(toPositiveMeasurement(Number(input.volumeCbm), "CBM") * 1_000_000);
  if (!Array.isArray(input.items) || input.items.length < 1) throw new ValidationError("박스에 담을 SKU를 1개 이상 입력해 주세요");
  const items = input.items.map((item) => {
    const quantity = Number(item.quantity);
    if (!item.skuLineId || !Number.isInteger(quantity) || quantity < 1) {
      throw new ValidationError("박스 SKU 수량이 올바르지 않습니다");
    }
    return { skuLineId: item.skuLineId, quantity };
  });
  const ids = items.map((item) => item.skuLineId);
  if (new Set(ids).size !== ids.length) throw new ValidationError("같은 SKU가 한 박스에 중복되었습니다");
  return { marker, status, weightGrams, volumeCm3, memo: cleanText(input.memo ?? "") || null, items };
}

export async function saveShipmentPackage(orderId: string, input: ShipmentPackageInput) {
  if (!orderId) throw new ValidationError("주문을 선택해 주세요");
  const data = normalizeInput(input);

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: orderWithLinesInclude });
    if (!order) throw new ValidationError("주문을 찾을 수 없습니다");
    if (order.status !== "SHIPMENT_REQUESTED") throw new ValidationError("출고 요청된 주문만 포장단위를 배정할 수 있습니다");

    const orderSkuLines = order.productLines.flatMap((line) => line.skuLines);
    const skuById = new Map(orderSkuLines.map((sku) => [sku.id, sku]));
    for (const item of data.items) {
      if (!skuById.has(item.skuLineId)) throw new ValidationError("주문에 속한 SKU만 포장할 수 있습니다");
    }

    const existingPackages = await tx.shipmentPackage.findMany({
      where: { orderId },
      include: { items: true },
    });
    const packageIdForSameMarker = existingPackages.find((pkg) => pkg.marker === data.marker)?.id;
    const totals = new Map<string, number>();
    for (const pkg of existingPackages) {
      if (pkg.id === packageIdForSameMarker) continue;
      for (const item of pkg.items) totals.set(item.skuLineId, (totals.get(item.skuLineId) ?? 0) + item.quantity);
    }
    for (const item of data.items) totals.set(item.skuLineId, (totals.get(item.skuLineId) ?? 0) + item.quantity);
    for (const [skuLineId, total] of totals) {
      const sku = skuById.get(skuLineId);
      if (!sku || total > shippableQuantity(sku)) throw new ValidationError("SKU 출고 가능 수량을 초과했습니다");
    }

    const saved = await tx.shipmentPackage.upsert({
      where: { orderId_marker: { orderId, marker: data.marker } },
      create: {
        orderId,
        marker: data.marker,
        status: data.status,
        weightGrams: data.weightGrams,
        volumeCm3: data.volumeCm3,
        memo: data.memo,
      },
      update: {
        status: data.status,
        weightGrams: data.weightGrams,
        volumeCm3: data.volumeCm3,
        memo: data.memo,
      },
    });
    await tx.shipmentPackageItem.deleteMany({ where: { packageId: saved.id } });
    await tx.shipmentPackageItem.createMany({
      data: data.items.map((item) => ({ packageId: saved.id, skuLineId: item.skuLineId, quantity: item.quantity })),
    });
    return tx.shipmentPackage.findUniqueOrThrow({
      where: { id: saved.id },
      include: { items: { include: { skuLine: true }, orderBy: { createdAt: "asc" } } },
    });
  });
}

export async function listSellerShipmentPackages(sellerId: string, orderId: string) {
  if (!sellerId) throw new ValidationError("로그인이 필요합니다");
  const order = await prisma.order.findFirst({ where: { id: orderId, sellerId }, select: { id: true } });
  if (!order) throw new ValidationError("주문을 찾을 수 없습니다");
  return prisma.shipmentPackage.findMany({
    where: { orderId },
    include: { items: { include: { skuLine: true } } },
    orderBy: { marker: "asc" },
  });
}

export async function listAdminShipmentOrders() {
  return prisma.order.findMany({
    where: { status: "SHIPMENT_REQUESTED" },
    orderBy: { shipmentRequestedAt: "desc" },
    include: { seller: { select: { email: true, contactName: true, companyName: true } }, shipmentPackages: { include: { items: true } } },
  });
}

export async function getAdminShipmentOrder(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      seller: { select: { email: true, contactName: true, companyName: true } },
      productLines: { include: { skuLines: { orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } },
      shipmentPackages: { include: { items: { include: { skuLine: true } } }, orderBy: { marker: "asc" } },
    },
  });
}
```

- [ ] **Step 5: Verify domain tests pass**

Run: `npx vitest run tests/shipment-packages.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit Task 1**

```bash
git add prisma/schema.prisma prisma/migrations/<generated>/migration.sql src/lib/order-lines.ts src/lib/shipment-packages.ts tests/shipment-packages.test.ts
git commit -m "feat: add shipment package domain"
```

---

### Task 2: Admin Shipment Package Entry

**Files:**
- Create: `src/app/api/admin/shipments/packages/route.ts`
- Create: `src/app/admin/shipments/page.tsx`
- Create: `src/app/admin/shipments/[id]/page.tsx`
- Modify: `src/app/admin/layout.tsx`
- Test: `tests/shipment-packages.test.ts`

**Interfaces:**
- Consumes: `saveShipmentPackage()`, `listAdminShipmentOrders()`, `getAdminShipmentOrder()`, `getSessionUser()`
- Produces: admin route that accepts JSON and form data.

- [ ] **Step 1: Add failing admin route tests**

Append tests that mock `getSessionUser()`:
```ts
it("운영자 JSON route는 박스 포장단위를 저장한다", async () => {
  const { order, red } = await createShipmentRequestedSkuOrder(sellerA.id);
  const { POST } = await importAdminPackageRoute("ADMIN");

  const response = await POST(new Request("http://localhost/api/admin/shipments/packages", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      orderId: order.id,
      marker: "BOX-1",
      status: "PACKED",
      weightKg: 12.5,
      volumeCbm: 0.08,
      items: [{ skuLineId: red.id, quantity: 1 }],
    }),
  }));

  const body = await response.json();
  expect(response.status).toBe(200);
  expect(body.ok).toBe(true);
  expect(body.result.marker).toBe("BOX-1");
});

it("운영자가 아니면 박스 저장 route가 거부된다", async () => {
  const { order, red } = await createShipmentRequestedSkuOrder(sellerA.id);
  const { POST } = await importAdminPackageRoute("SELLER");

  const response = await POST(new Request("http://localhost/api/admin/shipments/packages", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ orderId: order.id, marker: "BOX-1", weightKg: 1, volumeCbm: 0.01, items: [{ skuLineId: red.id, quantity: 1 }] }),
  }));

  expect(response.status).toBe(403);
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run tests/shipment-packages.test.ts -t "route"`

Expected: FAIL because admin route does not exist.

- [ ] **Step 3: Implement admin API route**

Create `src/app/api/admin/shipments/packages/route.ts`.

It must:
- call `getSessionUser()`;
- return 403 unless role is `ADMIN`;
- parse JSON when `content-type` includes `application/json`;
- parse form data otherwise;
- convert form fields `sku[0][id]`, `sku[0][quantity]` into items;
- call `saveShipmentPackage()`;
- return JSON for JSON requests and redirect to `/admin/shipments/${orderId}?packed=1` for form requests.

- [ ] **Step 4: Implement admin pages and nav**

Create:
- `src/app/admin/shipments/page.tsx`: list `SHIPMENT_REQUESTED` orders from `listAdminShipmentOrders()` and link to `/admin/shipments/[id]`.
- `src/app/admin/shipments/[id]/page.tsx`: show order seller, SKU rows, existing packages, and a single-package form. The form posts to `/api/admin/shipments/packages`.

Modify:
- `src/app/admin/layout.tsx`: add `<Link href="/admin/shipments" className="text-sm">출고 처리</Link>`.

- [ ] **Step 5: Verify admin route tests pass**

Run: `npx vitest run tests/shipment-packages.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit Task 2**

```bash
git add src/app/api/admin/shipments/packages/route.ts src/app/admin/shipments/page.tsx src/app/admin/shipments/[id]/page.tsx src/app/admin/layout.tsx tests/shipment-packages.test.ts
git commit -m "feat: add admin shipment packages"
```

---

### Task 3: Seller Shipment Package Display

**Files:**
- Modify: `src/app/dashboard/shipment/page.tsx`
- Modify: `src/app/dashboard/orders/[id]/page.tsx`
- Test: `tests/shipment-packages.test.ts`

**Interfaces:**
- Consumes: shipment package relations included on seller-scoped order reads.
- Produces: seller visible package summary on shipment list and order detail.

- [ ] **Step 1: Add failing seller UI regression tests**

Use `renderToStaticMarkup()` for lightweight UI assertions:
```ts
it("셀러 출고관리 화면은 박스별 구성과 상태를 표시한다", async () => {
  const { order, red } = await createShipmentRequestedSkuOrder(sellerA.id);
  await saveShipmentPackage(order.id, {
    marker: "BOX-1",
    status: "PACKED",
    weightKg: 12.5,
    volumeCbm: 0.08,
    items: [{ skuLineId: red.id, quantity: 1 }],
  });
  const html = await renderSellerShipmentPageFor(sellerA.id);

  expect(html).toContain("BOX-1");
  expect(html).toContain("포장완료");
  expect(html).toContain("12.5kg");
  expect(html).toContain("0.08CBM");
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run tests/shipment-packages.test.ts -t "셀러 출고관리"`

Expected: FAIL because seller pages do not show package data yet.

- [ ] **Step 3: Update seller shipment list**

Modify `src/app/dashboard/shipment/page.tsx`:
- keep seller scoping through `listOrdersBySeller(session.userId)`;
- for shipment orders, show package count and package summaries under each order;
- show package marker, status label, weight kg, CBM, and SKU item count;
- keep empty state when no packages exist: `포장단위가 아직 배정되지 않았습니다`.

- [ ] **Step 4: Update seller order detail**

Modify `src/app/dashboard/orders/[id]/page.tsx`:
- include shipment packages in the existing seller-scoped order query;
- below SKU work status, show `포장단위 / 패킹리스트 기초` section when `order.status === "SHIPMENT_REQUESTED"`;
- show each package marker, status, weight, CBM, memo, and package item rows with SKU option and quantity;
- include copy: `정식 패킹리스트 PDF와 실제 배송조회는 아직 연결하지 않았습니다.`

- [ ] **Step 5: Verify seller UI tests pass**

Run: `npx vitest run tests/shipment-packages.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit Task 3**

```bash
git add src/app/dashboard/shipment/page.tsx src/app/dashboard/orders/[id]/page.tsx tests/shipment-packages.test.ts
git commit -m "feat: show shipment packages to sellers"
```

---

### Task 4: Phase 11 Verification And Audit Prep

**Files:**
- Create: `.harness/dubyeol2/phase-packets/phase-011/03-verification.md`
- Create: `.harness/dubyeol2/external-audit/pending/request-phase-011.json`
- Create: `.harness/dubyeol2/phase-packets/phase-011/screenshots/*.png`
- Modify: `.harness/dubyeol2/current-run.md`

**Interfaces:**
- Consumes: completed Tasks 1-3.
- Produces: Machine Check evidence and Claude audit request.

- [ ] **Step 1: Run machine checks**

Run:
```bash
npx vitest run tests/shipment-packages.test.ts tests/wallet.test.ts tests/orders.test.ts
npx vitest run
npm run build
git diff --check
npx -y @google/design.md lint .harness/dubyeol2/design-system.md
```

Expected:
- targeted tests PASS;
- full vitest PASS;
- build PASS;
- diff check PASS;
- design lint errors 0.

- [ ] **Step 2: Run local browser QA**

Use local `http://localhost:5173` and Playwright/Chrome.

Scenario:
1. register seller A;
2. create multi-SKU order;
3. admin records inbound and quote;
4. seed/approve enough wallet balance;
5. seller requests shipment;
6. admin creates `BOX-1` and `BOX-2` with SKU quantities, weight, CBM, and `PACKED` status;
7. seller sees both boxes in `/dashboard/shipment` and `/dashboard/orders/[id]`;
8. seller B cannot see seller A package data;
9. console issue count is 0.

Save screenshots:
- `01-admin-shipment-queue.png`
- `02-admin-package-form.png`
- `03-admin-packages-saved.png`
- `04-seller-shipment-packages.png`
- `05-seller-order-package-detail.png`
- `06-seller-b-isolated.png`

- [ ] **Step 3: Write `03-verification.md`**

Include:
- Builder result summary by task;
- Superpowers checklist;
- machine check command results;
- security/permission review substitute if `/security-review` is unavailable;
- live QA data and screenshots;
- known exclusions: PDF, labels, tracking, customs/carrier APIs.

- [ ] **Step 4: Write audit request**

Create `.harness/dubyeol2/external-audit/pending/request-phase-011.json` with:
- customer promise;
- out-of-scope guardrails;
- changed files;
- machine check evidence;
- live QA evidence;
- instruction that Claude is auditor under Mode B and must output JSON only.

- [ ] **Step 5: Commit Task 4**

```bash
git add .harness/dubyeol2/phase-packets/phase-011/03-verification.md .harness/dubyeol2/external-audit/pending/request-phase-011.json .harness/dubyeol2/phase-packets/phase-011/screenshots .harness/dubyeol2/current-run.md
git commit -m "docs: verify phase 11 shipment packages"
```
