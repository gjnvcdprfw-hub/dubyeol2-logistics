# Phase 7 Seller Shipment Wallet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the logged-in seller flow where a quoted order can be requested for shipment, the seller wallet is debited, a wallet ledger entry is recorded, and order/shipment/wallet/dashboard screens all show the same state.

**Architecture:** Keep the existing Prisma + Next.js App Router pattern. Add a small wallet ledger model and a shipment request domain function that performs wallet debit and order status change in one transaction. Seller screens read from the same domain helpers so status, balance, and history cannot drift.

**Tech Stack:** Next.js 16 App Router, React 19 server components, Prisma 6 with SQLite, Vitest, TypeScript.

## Global Constraints

- No real bank account, real deposit, real payment provider, paid API, real shipment, customs, or tracking integration.
- Use a local test wallet ledger only.
- All seller reads and writes must be scoped by `sellerId`.
- Money and order state must change together or not at all.
- Do not expose secrets. Do not deploy, push, remote merge, or touch a real database.
- Phase 6 external audit remains pending; do not merge Phase 6/7 to main until their gates are complete.

---

## File Structure

- Modify `prisma/schema.prisma`: add `Order.shipmentRequestedAt`, `Order.shipmentRequestedAmountKrw`, `User.walletTransactions`, `Order.walletTransactions`, and `WalletTransaction`.
- Create a Prisma-generated wallet shipment migration under `prisma/migrations/` after schema change.
- Create `src/lib/wallet.ts`: wallet summary, test credit helper, shipment request transaction.
- Create `tests/wallet.test.ts`: unit/integration tests for wallet debit, insufficient balance, seller isolation, and idempotency.
- Create `src/app/api/shipments/request/route.ts`: authenticated POST endpoint for form and JSON shipment requests.
- Modify `src/app/dashboard/orders/[id]/page.tsx`: show wallet-aware shipment CTA or completed shipment state.
- Modify `src/app/dashboard/shipment/page.tsx`: show real shipment request counts and rows for the current seller.
- Modify `src/app/dashboard/wallet/page.tsx`: show current wallet balance and ledger.
- Modify `src/app/dashboard/page.tsx`: show real wallet balance and shipment-requested counts.
- Create `scripts/seed-wallet.ts`: local QA utility to credit a seller wallet by email.
- Modify `.harness/dubyeol2/phase-packets/phase-007/02-plan.md`: link this plan and summarize Builder tasks.

---

### Task 1: Wallet Ledger Model and Domain

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/lib/wallet.ts`
- Create: `tests/wallet.test.ts`
- Create: Prisma-generated `wallet_shipment` migration under `prisma/migrations/`

**Interfaces:**
- Consumes: `prisma`, `ValidationError`, `computeQuote()`.
- Produces:
  - `getWalletSummary(sellerId: string): Promise<WalletSummary>`
  - `recordWalletCredit(sellerId: string, amountKrw: number, memo: string): Promise<WalletTransaction>`
  - `getQuotedOrderTotalKrw(order: OrderLike): number`
  - `requestShipmentWithWallet(sellerId: string, orderId: string): Promise<ShipmentRequestResult>`

- [ ] **Step 1: Extend Prisma schema**

Add these fields and model to `prisma/schema.prisma`:

```prisma
model User {
  id                 String              @id @default(cuid())
  email              String              @unique
  passwordHash       String
  companyName        String?
  contactName        String
  phone              String?
  role               String              @default("SELLER") // "SELLER" | "ADMIN"
  inboundCode        String?             @unique // 회원별 입고ID (8자 대문자영숫자)
  createdAt          DateTime            @default(now())
  orders             Order[]
  walletTransactions WalletTransaction[]
}

model Order {
  id                         String              @id @default(cuid())
  seller                     User                @relation(fields: [sellerId], references: [id])
  sellerId                   String
  productUrl                 String
  productName                String
  optionText                 String?
  quantity                   Int
  serviceType                String // "PURCHASE"(구매대행) | "SHIPPING"(배송대행)
  inspectionRequested        Boolean             @default(false)
  memo                       String?
  status                     String              @default("REQUESTED") // "REQUESTED" | "RECEIVED" | "SHIPMENT_REQUESTED"
  createdAt                  DateTime            @default(now())
  receivedAt                 DateTime?
  outerIssue                 Boolean?
  outerNote                  String?
  inspCountActual            Int?
  inspAppearanceOk           Boolean?
  inspDefectCount            Int?
  inspNote                   String?
  quoteUnitPriceFen          Int?
  quoteCnShippingFen         Int?
  quoteWeightGrams           Int?
  quoteVolumeCm3             Int?
  quoteExchangeRateX100      Int?
  quoteShippingMethod        String?
  quotedAt                   DateTime?
  shipmentRequestedAt        DateTime?
  shipmentRequestedAmountKrw Int?
  photos                     InboundPhoto[]
  walletTransactions         WalletTransaction[]
}

model WalletTransaction {
  id              String   @id @default(cuid())
  seller          User     @relation(fields: [sellerId], references: [id], onDelete: Cascade)
  sellerId        String
  order           Order?   @relation(fields: [orderId], references: [id], onDelete: SetNull)
  orderId         String?
  type            String   // "TEST_CREDIT" | "SHIPMENT_DEBIT"
  amountKrw       Int      // credit positive, debit negative
  balanceAfterKrw Int
  memo            String
  createdAt       DateTime @default(now())
}
```

- [ ] **Step 2: Generate migration**

Run:

```bash
npx prisma migrate dev --name wallet-shipment
```

Expected: a new migration directory under `prisma/migrations/` and regenerated Prisma client.

- [ ] **Step 3: Write failing wallet tests**

Create `tests/wallet.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/db";
import { registerSeller } from "../src/lib/auth";
import { createOrder } from "../src/lib/orders";
import { recordInbound } from "../src/lib/inbound";
import { getWalletSummary, recordWalletCredit, requestShipmentWithWallet } from "../src/lib/wallet";

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
  await prisma.walletTransaction.deleteMany();
  await prisma.inboundPhoto.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
  sellerA = await registerSeller({ email: "wallet-a@test.local", password: "password1", contactName: "A" });
  sellerB = await registerSeller({ email: "wallet-b@test.local", password: "password1", contactName: "B" });
});

describe("wallet shipment request", () => {
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

  it("셀러별 예치금 요약은 자기 거래만 계산한다", async () => {
    await recordWalletCredit(sellerA.id, 300000, "A 예치금");
    await recordWalletCredit(sellerB.id, 900000, "B 예치금");

    const summaryA = await getWalletSummary(sellerA.id);
    expect(summaryA.balanceKrw).toBe(300000);
    expect(summaryA.transactions).toHaveLength(1);
    expect(summaryA.transactions[0].sellerId).toBe(sellerA.id);
  });
});
```

- [ ] **Step 4: Run failing test**

Run:

```bash
npx vitest run tests/wallet.test.ts
```

Expected: FAIL because `WalletTransaction` model and `src/lib/wallet.ts` do not exist.

- [ ] **Step 5: Implement `src/lib/wallet.ts`**

Create `src/lib/wallet.ts`:

```ts
import type { Order, WalletTransaction } from "@prisma/client";
import { prisma } from "./db";
import { ValidationError } from "./auth";
import { computeQuote } from "./quote";

export type WalletSummary = {
  balanceKrw: number;
  totalCreditKrw: number;
  totalDebitKrw: number;
  transactions: WalletTransaction[];
};

type OrderLike = Pick<Order,
  "quantity" | "serviceType" | "inspectionRequested" |
  "quoteUnitPriceFen" | "quoteCnShippingFen" | "quoteWeightGrams" |
  "quoteVolumeCm3" | "quoteExchangeRateX100" | "quoteShippingMethod" |
  "quotedAt"
>;

export type ShipmentRequestResult = {
  order: Order;
  transaction: WalletTransaction;
  balanceKrw: number;
};

export function getQuotedOrderTotalKrw(order: OrderLike) {
  if (!order.quotedAt || !order.quoteShippingMethod) {
    throw new ValidationError("견적 완료된 주문만 출고 요청할 수 있습니다");
  }
  return computeQuote({
    quantity: order.quantity,
    serviceType: order.serviceType as "PURCHASE" | "SHIPPING",
    inspectionRequested: order.inspectionRequested,
    unitPriceFen: order.quoteUnitPriceFen ?? 0,
    cnShippingFen: order.quoteCnShippingFen ?? 0,
    weightGrams: order.quoteWeightGrams ?? 0,
    volumeCm3: order.quoteVolumeCm3 ?? 0,
    exchangeRateX100: order.quoteExchangeRateX100 ?? 0,
    shippingMethod: order.quoteShippingMethod as "SEA" | "AIR",
  }).totalKrw;
}

export async function getWalletSummary(sellerId: string): Promise<WalletSummary> {
  if (!sellerId) throw new ValidationError("로그인이 필요합니다");
  const transactions = await prisma.walletTransaction.findMany({
    where: { sellerId },
    orderBy: { createdAt: "desc" },
  });
  const balanceKrw = transactions.reduce((sum, tx) => sum + tx.amountKrw, 0);
  const totalCreditKrw = transactions.filter((tx) => tx.amountKrw > 0).reduce((sum, tx) => sum + tx.amountKrw, 0);
  const totalDebitKrw = transactions.filter((tx) => tx.amountKrw < 0).reduce((sum, tx) => sum + Math.abs(tx.amountKrw), 0);
  return { balanceKrw, totalCreditKrw, totalDebitKrw, transactions };
}

export async function recordWalletCredit(sellerId: string, amountKrw: number, memo: string) {
  if (!sellerId) throw new ValidationError("로그인이 필요합니다");
  if (!Number.isInteger(amountKrw) || amountKrw <= 0) throw new ValidationError("예치금 금액이 올바르지 않습니다");
  const summary = await getWalletSummary(sellerId);
  return prisma.walletTransaction.create({
    data: {
      sellerId,
      type: "TEST_CREDIT",
      amountKrw,
      balanceAfterKrw: summary.balanceKrw + amountKrw,
      memo,
    },
  });
}

export async function requestShipmentWithWallet(sellerId: string, orderId: string): Promise<ShipmentRequestResult> {
  if (!sellerId) throw new ValidationError("로그인이 필요합니다");
  if (!orderId) throw new ValidationError("주문을 선택해 주세요");

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({ where: { id: orderId, sellerId } });
    if (!order) throw new ValidationError("주문을 찾을 수 없습니다");
    if (order.status === "SHIPMENT_REQUESTED") throw new ValidationError("이미 출고 요청된 주문입니다");
    if (order.status !== "RECEIVED") throw new ValidationError("입고·견적 완료된 주문만 출고 요청할 수 있습니다");

    const amountKrw = getQuotedOrderTotalKrw(order);
    const currentTransactions = await tx.walletTransaction.findMany({ where: { sellerId } });
    const balanceKrw = currentTransactions.reduce((sum, item) => sum + item.amountKrw, 0);
    if (balanceKrw < amountKrw) throw new ValidationError("예치금 잔액이 부족합니다");

    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        status: "SHIPMENT_REQUESTED",
        shipmentRequestedAt: new Date(),
        shipmentRequestedAmountKrw: amountKrw,
      },
    });
    const transaction = await tx.walletTransaction.create({
      data: {
        sellerId,
        orderId: order.id,
        type: "SHIPMENT_DEBIT",
        amountKrw: -amountKrw,
        balanceAfterKrw: balanceKrw - amountKrw,
        memo: `출고 요청 차감: ${order.productName}`,
      },
    });
    return { order: updatedOrder, transaction, balanceKrw: balanceKrw - amountKrw };
  });
}
```

- [ ] **Step 6: Run Task 1 tests**

Run:

```bash
npx vitest run tests/wallet.test.ts tests/orders.test.ts tests/quote.test.ts
```

Expected: PASS. If older tests fail because they delete users before wallet transactions, add `await prisma.walletTransaction.deleteMany();` at the start of the affected `beforeEach`.

---

### Task 2: Shipment Request Endpoint and QA Seed Utility

**Files:**
- Create: `src/app/api/shipments/request/route.ts`
- Create: `scripts/seed-wallet.ts`
- Modify if needed: `tests/wallet.test.ts`

**Interfaces:**
- Consumes: `requestShipmentWithWallet(sellerId, orderId)`, `recordWalletCredit(sellerId, amountKrw, memo)`.
- Produces:
  - POST `/api/shipments/request` accepting JSON `{ orderId }` or form field `orderId`.
  - `npx tsx scripts/seed-wallet.ts <email> <amountKrw>` for local QA wallet credit.

- [ ] **Step 1: Add endpoint**

Create `src/app/api/shipments/request/route.ts`:

```ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { ValidationError } from "@/lib/auth";
import { requestShipmentWithWallet } from "@/lib/wallet";

async function readOrderId(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await req.json();
    return typeof body?.orderId === "string" ? body.orderId : "";
  }
  const form = await req.formData();
  const value = form.get("orderId");
  return typeof value === "string" ? value : "";
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ ok: false, error: "로그인이 필요합니다" }, { status: 401 });
  const orderId = await readOrderId(req);
  try {
    const result = await requestShipmentWithWallet(session.userId, orderId);
    const accepts = req.headers.get("accept") ?? "";
    if (accepts.includes("application/json")) return NextResponse.json({ ok: true, result });
    return NextResponse.redirect(new URL(`/dashboard/orders/${orderId}?shipment=requested`, req.url), 303);
  } catch (e) {
    if (e instanceof ValidationError) {
      const accepts = req.headers.get("accept") ?? "";
      if (accepts.includes("application/json")) {
        return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
      }
      return NextResponse.redirect(new URL(`/dashboard/orders/${orderId}?shipmentError=${encodeURIComponent(e.message)}`, req.url), 303);
    }
    console.error("shipment request error:", e);
    return NextResponse.json({ ok: false, error: "출고 요청 중 오류가 발생했습니다" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Add local wallet seed script**

Create `scripts/seed-wallet.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const email = process.argv[2];
const amount = Number(process.argv[3]);

async function main() {
  if (!email || !Number.isInteger(amount) || amount <= 0) {
    console.error("사용법: npx tsx scripts/seed-wallet.ts <seller-email> <amountKrw>");
    process.exit(1);
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`셀러를 찾을 수 없습니다: ${email}`);
    process.exit(1);
  }
  const current = await prisma.walletTransaction.findMany({ where: { sellerId: user.id } });
  const balance = current.reduce((sum, tx) => sum + tx.amountKrw, 0);
  await prisma.walletTransaction.create({
    data: {
      sellerId: user.id,
      type: "TEST_CREDIT",
      amountKrw: amount,
      balanceAfterKrw: balance + amount,
      memo: "로컬 QA 예치금",
    },
  });
  console.log(`예치금 준비 완료: ${email} +₩${amount.toLocaleString("ko-KR")}`);
}

main().finally(() => prisma.$disconnect());
```

- [ ] **Step 3: Manually smoke endpoint with JSON after Task 1 passes**

Use a test or local session only. Do not call external services.

Run:

```bash
npx vitest run tests/wallet.test.ts
```

Expected: PASS. Endpoint behavior is covered indirectly by domain tests and will be verified through browser QA in Task 4.

---

### Task 3: Seller Screens

**Files:**
- Modify: `src/app/dashboard/orders/[id]/page.tsx`
- Modify: `src/app/dashboard/shipment/page.tsx`
- Modify: `src/app/dashboard/wallet/page.tsx`
- Modify: `src/app/dashboard/page.tsx`

**Interfaces:**
- Consumes: `getWalletSummary()`, `getQuotedOrderTotalKrw()`, `listOrdersBySeller()`.
- Produces: seller-visible order detail CTA, shipment list/counts, wallet balance/ledger, dashboard wallet/shipment counts.

- [ ] **Step 1: Update order detail status and CTA**

In `src/app/dashboard/orders/[id]/page.tsx`:

```tsx
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { computeQuote } from "@/lib/quote";
import { getQuotedOrderTotalKrw, getWalletSummary } from "@/lib/wallet";

const STATUS_LABEL: Record<string, string> = {
  REQUESTED: "접수됨",
  RECEIVED: "입고완료",
  SHIPMENT_REQUESTED: "출고 요청",
};

function krw(value: number) {
  return `₩${value.toLocaleString("ko-KR")}`;
}
```

Inside `OrderDetailPage`, after loading `order`, compute:

```tsx
const wallet = await getWalletSummary(session.userId);
const shipmentError = typeof searchParams?.shipmentError === "string" ? searchParams.shipmentError : "";
const shipmentRequested = searchParams?.shipment === "requested";
const quoteTotalKrw = order.quotedAt && order.quoteShippingMethod ? getQuotedOrderTotalKrw(order) : null;
const canRequestShipment = order.status === "RECEIVED" && quoteTotalKrw !== null && wallet.balanceKrw >= quoteTotalKrw;
```

Change function signature to:

```tsx
export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
```

Await search params:

```tsx
const query = searchParams ? await searchParams : {};
```

Use `query` in the snippet above.

Add this section after the quote section:

```tsx
{quoteTotalKrw !== null && (
  <section className="bg-surface rounded-[27px] shadow-card p-6 space-y-4">
    <div className="flex items-center justify-between gap-4">
      <div>
        <h2 className="text-[14px] font-semibold text-heading">출고 요청</h2>
        <p className="mt-1 text-sm text-secondary">
          예치금으로 견적 금액을 차감하고 출고 요청 상태로 넘깁니다.
        </p>
      </div>
      <span className="rounded-full bg-surface-alt text-muted text-xs px-3 py-1">로컬 테스트 원장</span>
    </div>
    {shipmentRequested && <p className="rounded-lg bg-success-tint text-success p-3 text-sm">출고 요청이 접수되었습니다.</p>}
    {shipmentError && <p className="rounded-lg bg-danger/10 text-danger p-3 text-sm">{shipmentError}</p>}
    <div className="grid sm:grid-cols-2 gap-3 text-sm">
      <div className="rounded-lg bg-surface-alt p-4">
        <p className="text-muted">차감 예정 금액</p>
        <p className="mt-1 font-semibold text-heading">{krw(quoteTotalKrw)}</p>
      </div>
      <div className="rounded-lg bg-surface-alt p-4">
        <p className="text-muted">사용 가능 예치금</p>
        <p className="mt-1 font-semibold text-heading">{krw(wallet.balanceKrw)}</p>
      </div>
    </div>
    {order.status === "SHIPMENT_REQUESTED" ? (
      <p className="rounded-lg bg-info/10 text-info p-3 text-sm">이미 출고 요청된 주문입니다. 출고관리에서 상태를 확인하세요.</p>
    ) : (
      <form action="/api/shipments/request" method="post" className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="orderId" value={order.id} />
        <button
          type="submit"
          disabled={!canRequestShipment}
          className="rounded-[18px] bg-brand text-white text-sm font-semibold px-4 py-2 disabled:bg-surface-alt disabled:text-muted"
        >
          출고 요청하고 예치금 차감
        </button>
        {!canRequestShipment && (
          <span className="text-sm text-danger">예치금 잔액이 부족하거나 견적 완료 상태가 아닙니다.</span>
        )}
      </form>
    )}
  </section>
)}
```

- [ ] **Step 2: Update shipment page**

Replace `src/app/dashboard/shipment/page.tsx` static counts with seller-scoped orders:

```tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listOrdersBySeller } from "@/lib/orders";
import StatusTile, { StatusTone } from "@/components/dashboard/status-tile";

const TILES: { label: string; tone: StatusTone; count: (orders: Awaited<ReturnType<typeof listOrdersBySeller>>) => number }[] = [
  { label: "출고 요청", tone: "warning", count: (orders) => orders.filter((o) => o.status === "SHIPMENT_REQUESTED").length },
  { label: "출고 준비", tone: "info", count: () => 0 },
  { label: "발송대기", tone: "info", count: () => 0 },
  { label: "발송예정", tone: "info", count: () => 0 },
  { label: "발송완료", tone: "success", count: () => 0 },
];

function krw(value: number | null) {
  return `₩${(value ?? 0).toLocaleString("ko-KR")}`;
}

export default async function ShipmentPage() {
  const session = await getSession();
  if (!session.userId) redirect("/auth/login");
  const orders = await listOrdersBySeller(session.userId);
  const shipmentOrders = orders.filter((o) => o.status === "SHIPMENT_REQUESTED");
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-heading">출고 관리</h1>
      <div className="bg-surface rounded-[27px] shadow-card p-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {TILES.map((t) => <StatusTile key={t.label} label={t.label} count={t.count(orders)} tone={t.tone} />)}
        </div>
      </div>
      <section className="bg-surface rounded-[27px] shadow-card p-6">
        <h2 className="text-[14px] font-semibold text-heading">출고 요청 내역</h2>
        {shipmentOrders.length === 0 ? (
          <p className="mt-6 text-center text-muted">출고 요청된 주문이 아직 없습니다</p>
        ) : (
          <div className="mt-4 divide-y divide-black/5">
            {shipmentOrders.map((order) => (
              <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-semibold text-heading">{order.productName} × {order.quantity}</p>
                  <p className="mt-1 text-sm text-secondary">출고 요청 · {order.shipmentRequestedAt?.toLocaleDateString("ko-KR") ?? "요청일 확인 중"}</p>
                </div>
                <p className="text-sm font-semibold text-brand">{krw(order.shipmentRequestedAmountKrw)}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Update wallet page**

Use `getWalletSummary(session.userId)` in `src/app/dashboard/wallet/page.tsx`; replace static `STATS` and empty state:

```tsx
const wallet = await getWalletSummary(session.userId);
const STATS = [
  { label: "총 충전", value: krw(wallet.totalCreditKrw) },
  { label: "총 사용", value: krw(wallet.totalDebitKrw) },
  { label: "거래", value: `${wallet.transactions.length}건` },
];
```

Render transactions:

```tsx
{wallet.transactions.length === 0 ? (
  <div className="py-8 text-center">
    <p className="text-3xl">💳</p>
    <p className="mt-4 font-semibold text-heading">아직 거래 내역이 없습니다</p>
    <p className="mt-2 text-sm text-secondary">로컬 QA 예치금을 준비하면 충전·사용 내역이 여기에 남습니다.</p>
  </div>
) : (
  <div className="divide-y divide-black/5">
    {wallet.transactions.map((tx) => (
      <div key={tx.id} className="flex items-center justify-between gap-4 py-4">
        <div>
          <p className="font-semibold text-heading">{tx.type === "SHIPMENT_DEBIT" ? "출고 요청 차감" : "로컬 QA 예치금"}</p>
          <p className="mt-1 text-sm text-secondary">{tx.memo} · {tx.createdAt.toLocaleString("ko-KR")}</p>
        </div>
        <div className="text-right">
          <p className={tx.amountKrw < 0 ? "font-semibold text-danger" : "font-semibold text-success"}>
            {tx.amountKrw < 0 ? "-" : "+"}{krw(Math.abs(tx.amountKrw))}
          </p>
          <p className="mt-1 text-xs text-muted">잔액 {krw(tx.balanceAfterKrw)}</p>
        </div>
      </div>
    ))}
  </div>
)}
```

Keep charge/refund buttons disabled and label them `오픈 전 확정`.

- [ ] **Step 4: Update dashboard home**

In `src/app/dashboard/page.tsx`, import `getWalletSummary`, compute shipment count, and remove `prep` from shipment card:

```tsx
import { getWalletSummary } from "@/lib/wallet";

const wallet = await getWalletSummary(session.userId);
const shipmentRequested = orders.filter((o) => o.status === "SHIPMENT_REQUESTED").length;
```

Change wallet banner:

```tsx
<p className="text-sm text-white/80">예치금 현황 <span className="ml-2 rounded-full bg-white/20 text-white text-xs px-2 py-0.5">로컬 테스트 원장</span></p>
<p className="mt-1 text-2xl font-bold">사용 가능 잔액 {krw(wallet.balanceKrw)}</p>
<p className="text-xs text-white/70">실계좌·실입금·실결제 연동은 오픈 전 확정합니다.</p>
```

Change shipment card:

```tsx
<SectionCard title="출고 관리 현황" count={shipmentRequested} href="/dashboard/shipment">
  <StatusTile label="출고 요청" count={shipmentRequested} tone="warning" />
  <StatusTile label="출고 준비" count={0} tone="muted" />
  <StatusTile label="발송완료" count={0} tone="muted" />
</SectionCard>
```

- [ ] **Step 5: Run focused checks**

Run:

```bash
npx vitest run tests/wallet.test.ts tests/orders.test.ts tests/quote.test.ts
npm run build
```

Expected: both PASS.

---

### Task 4: Verification Evidence and Harness Updates

**Files:**
- Create: `.harness/dubyeol2/phase-packets/phase-007/03-verification.md`
- Modify: `.harness/dubyeol2/phase-packets/phase-007/02-plan.md`
- Modify: `.harness/dubyeol2/current-run.md`

**Interfaces:**
- Consumes: completed Task 1-3 code and tests.
- Produces: Phase 7 machine-check evidence and external-audit-ready status.

- [ ] **Step 1: Write Phase 7 plan link**

Create `.harness/dubyeol2/phase-packets/phase-007/02-plan.md`:

```markdown
# Phase 7 구현 계획

상태: Team Leader plan 작성 완료 (2026-07-05). Superpowers: `superpowers:writing-plans`

## 1. 원본 계획

- `docs/superpowers/plans/2026-07-05-phase-007-seller-shipment-wallet.md`

## 2. Builder Task 요약

| Task | 고객 결과 | 주요 파일 | 검증 |
|---|---|---|---|
| Task 1 | 예치금 원장과 출고 요청 거래가 안전하게 저장된다 | `prisma/schema.prisma`, `src/lib/wallet.ts`, `tests/wallet.test.ts` | `npx vitest run tests/wallet.test.ts tests/orders.test.ts tests/quote.test.ts` |
| Task 2 | 셀러가 출고 요청을 API로 완료할 수 있다 | `src/app/api/shipments/request/route.ts`, `scripts/seed-wallet.ts` | JSON/form 요청 수동 확인 + wallet tests |
| Task 3 | 셀러 화면 4곳이 같은 예치금·출고 상태를 보여준다 | 주문 상세, 출고관리, 예치금, 대시보드 홈 | `npm run build`, 로컬 브라우저 QA |
| Task 4 | Machine Check와 외부감리 입력이 준비된다 | `03-verification.md`, `external-audit/request.json` | 테스트·빌드·브라우저 QA 증거 |

## 3. 담장

- 실계좌, 실입금, 실결제, 송장, 통관, 택배 추적 없음.
- 로컬 테스트 예치금 원장만 사용.
- Phase 6 감리 대기는 별도 유지.
```

- [ ] **Step 2: Run full verification**

Run:

```bash
npx vitest run
npm run build
git diff --check
```

Expected:
- Vitest PASS.
- Next build PASS.
- `git diff --check` no whitespace errors.

- [ ] **Step 3: Browser QA**

Use local app only. Prepare a seller with a quoted order and wallet credit:

```bash
npx tsx scripts/seed-wallet.ts <seller-email> 300000
```

QA path:
1. Log in as the seller.
2. Open a quoted order detail.
3. Confirm wallet balance is visible.
4. Click `출고 요청하고 예치금 차감`.
5. Confirm order detail shows `출고 요청`.
6. Open `/dashboard/wallet` and confirm one `출고 요청 차감` transaction.
7. Open `/dashboard/shipment` and confirm the same order appears.
8. Open dashboard home and confirm wallet balance and shipment count.
9. Log in as another seller and confirm the first seller order/ledger is not visible.

- [ ] **Step 4: Write `03-verification.md`**

Record:
- commands run and outputs,
- browser QA evidence,
- security/secret review result,
- Superpowers checklist rows for `using-superpowers`, `brainstorming`, `writing-plans`, `subagent-driven-development`, `test-driven-development`, `verification-before-completion`, and non-used skills with reasons.

- [ ] **Step 5: Prepare external audit request**

Update `.harness/dubyeol2/external-audit/request.json` for Phase 7 after Machine Check PASS. Because mode B has Codex as builder, Claude must perform external audit. Do not self-audit with Codex.

---

## Self-Review

- Spec coverage: Phase 7 scope, acceptance example, wallet debit, shipment status, seller isolation, insufficient balance, and no-real-payment guardrail are covered by Tasks 1-4.
- Placeholder scan: no unfinished requirement markers or vague future-work instructions remain.
- Type consistency: produced helpers in Task 1 are consumed by Tasks 2-3 with matching names and parameters.
