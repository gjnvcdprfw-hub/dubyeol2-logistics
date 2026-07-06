# Phase 10 Wallet Top-Ups Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a seller request a wallet top-up and let an admin approve or reject it so balance, ledger, seller screen, and admin screen stay consistent.

**Architecture:** Keep `WalletTransaction` as the balance ledger. Add a `WalletTopUpRequest` record as the workflow object for seller request and admin decision. Approval creates exactly one positive `WalletTransaction` and links it back to the request inside one transaction; rejection never changes balance.

**Tech Stack:** Next.js 16 App Router, Prisma 6 SQLite, Vitest, TypeScript, existing `ValidationError`, existing `getSession()` / `getSessionUser()` auth helpers.

## Global Constraints

- Phase 10 does not expose real bank account values, PG, card payments, bank API, automatic deposit matching, refund automation, tax invoice flow, packing list, package markers, 1688 external integration, deploy, git push, or remote merge.
- Preserve seller isolation: every seller-facing read and mutation must be scoped by `sellerId`.
- Admin approval must be idempotent by state check: a non-`PENDING` request cannot create another credit transaction.
- Approval must update request state and create the credit ledger entry in one Prisma transaction.
- Rejecting a request must not create a wallet transaction and must not change balance.
- Keep existing shipment debit behavior and tests green.
- No new package dependencies.
- Use TDD for domain and route functions before UI wiring.
- Do not use `git add -A`; stage exact files only.

---

## File Structure

- Modify `prisma/schema.prisma`: add `WalletTopUpRequest`; add user relations; add optional request relation on `WalletTransaction`.
- Create migration with `npx prisma migrate dev --name wallet_topup_requests`.
- Create `src/lib/wallet-topups.ts`: validation, seller/admin list functions, create/approve/reject domain functions.
- Modify `src/lib/wallet.ts`: accept `TOPUP_CREDIT` display type in summaries; keep existing `recordWalletCredit()` for local QA seed compatibility.
- Create `src/app/api/wallet/topups/route.ts`: seller creates top-up requests.
- Create `src/app/api/admin/wallet-topups/[id]/approve/route.ts`: admin approves.
- Create `src/app/api/admin/wallet-topups/[id]/reject/route.ts`: admin rejects.
- Modify `src/app/dashboard/wallet/page.tsx`: active top-up request form, request status list, clearer local/real-money boundary.
- Modify `src/app/dashboard/page.tsx`: wallet banner button text/link reflects top-up request instead of disabled payment.
- Modify `src/app/admin/layout.tsx`: add admin top-up link.
- Create `src/app/admin/wallet-topups/page.tsx`: admin pending/recent top-up requests.
- Tests: add/modify `tests/wallet-topups.test.ts`, `tests/wallet.test.ts`.

---

### Task 1: Top-Up Request Model And Domain

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/lib/wallet-topups.ts`
- Modify: `src/lib/wallet.ts`
- Test: `tests/wallet-topups.test.ts`

**Interfaces:**
- Produces: `createWalletTopUpRequest(sellerId, input)`, `listSellerWalletTopUps(sellerId)`, `listAdminWalletTopUps()`, `approveWalletTopUpRequest(adminId, requestId, memo?)`, `rejectWalletTopUpRequest(adminId, requestId, reason)`
- Consumes: `prisma`, `ValidationError`, `getWalletSummary()`

- [ ] **Step 1: Add failing domain tests**

Create `tests/wallet-topups.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run tests/wallet-topups.test.ts`

Expected: FAIL because `WalletTopUpRequest` model and `src/lib/wallet-topups.ts` do not exist yet.

- [ ] **Step 3: Add Prisma schema**

Modify `prisma/schema.prisma`.

Add to `User`:

```prisma
  walletTopUpRequests          WalletTopUpRequest[] @relation("WalletTopUpSeller")
  processedWalletTopUpRequests WalletTopUpRequest[] @relation("WalletTopUpProcessor")
```

Add to `WalletTransaction`:

```prisma
  topUpRequest WalletTopUpRequest?
```

Add model:

```prisma
model WalletTopUpRequest {
  id                  String             @id @default(cuid())
  seller              User               @relation("WalletTopUpSeller", fields: [sellerId], references: [id], onDelete: Cascade)
  sellerId            String
  amountKrw           Int
  depositorName       String
  memo                String?
  status              String             @default("PENDING") // "PENDING" | "APPROVED" | "REJECTED"
  adminMemo           String?
  processedBy         User?              @relation("WalletTopUpProcessor", fields: [processedById], references: [id], onDelete: SetNull)
  processedById       String?
  walletTransaction   WalletTransaction? @relation(fields: [walletTransactionId], references: [id], onDelete: SetNull)
  walletTransactionId String?            @unique
  createdAt           DateTime           @default(now())
  processedAt         DateTime?

  @@index([sellerId])
  @@index([status])
  @@index([processedById])
}
```

Run: `npx prisma migrate dev --name wallet_topup_requests`

Expected: migration succeeds and Prisma Client regenerates.

- [ ] **Step 4: Implement domain functions**

Create `src/lib/wallet-topups.ts`:

```ts
import { ValidationError } from "./auth";
import { prisma } from "./db";

type TopUpInput = {
  amountKrw: number;
  depositorName: string;
  memo?: string | null;
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validateTopUpInput(input: TopUpInput) {
  const amountKrw = Number(input.amountKrw);
  if (!Number.isInteger(amountKrw) || amountKrw <= 0) {
    throw new ValidationError("충전 금액이 올바르지 않습니다");
  }
  const depositorName = cleanText(input.depositorName);
  if (!depositorName) throw new ValidationError("입금자명을 입력해 주세요");
  const memo = cleanText(input.memo ?? "");
  return { amountKrw, depositorName, memo: memo || null };
}

export async function createWalletTopUpRequest(sellerId: string, input: TopUpInput) {
  if (!sellerId) throw new ValidationError("로그인이 필요합니다");
  const data = validateTopUpInput(input);
  return prisma.walletTopUpRequest.create({
    data: { sellerId, ...data },
  });
}

export async function listSellerWalletTopUps(sellerId: string) {
  if (!sellerId) throw new ValidationError("로그인이 필요합니다");
  return prisma.walletTopUpRequest.findMany({
    where: { sellerId },
    orderBy: { createdAt: "desc" },
  });
}

export async function listAdminWalletTopUps() {
  return prisma.walletTopUpRequest.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { seller: { select: { email: true, contactName: true, companyName: true } } },
  });
}

export async function approveWalletTopUpRequest(adminId: string, requestId: string, memo?: string | null) {
  if (!adminId) throw new ValidationError("운영자 로그인이 필요합니다");
  if (!requestId) throw new ValidationError("충전 요청을 선택해 주세요");
  const adminMemo = cleanText(memo ?? "");

  return prisma.$transaction(async (tx) => {
    const request = await tx.walletTopUpRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new ValidationError("충전 요청을 찾을 수 없습니다");
    if (request.status !== "PENDING") throw new ValidationError("이미 처리된 충전 요청입니다");

    const update = await tx.walletTopUpRequest.updateMany({
      where: { id: request.id, status: "PENDING" },
      data: { status: "APPROVED", processedById: adminId, processedAt: new Date(), adminMemo: adminMemo || "입금 확인" },
    });
    if (update.count !== 1) throw new ValidationError("이미 처리된 충전 요청입니다");

    const transactions = await tx.walletTransaction.findMany({ where: { sellerId: request.sellerId } });
    const balanceKrw = transactions.reduce((sum, item) => sum + item.amountKrw, 0);
    const transaction = await tx.walletTransaction.create({
      data: {
        sellerId: request.sellerId,
        type: "TOPUP_CREDIT",
        amountKrw: request.amountKrw,
        balanceAfterKrw: balanceKrw + request.amountKrw,
        memo: adminMemo || `예치금 충전 승인: ${request.depositorName}`,
      },
    });

    return tx.walletTopUpRequest.update({
      where: { id: request.id },
      data: { walletTransactionId: transaction.id },
    });
  });
}

export async function rejectWalletTopUpRequest(adminId: string, requestId: string, reason: string) {
  if (!adminId) throw new ValidationError("운영자 로그인이 필요합니다");
  if (!requestId) throw new ValidationError("충전 요청을 선택해 주세요");
  const adminMemo = cleanText(reason);
  if (!adminMemo) throw new ValidationError("거절 사유를 입력해 주세요");

  const update = await prisma.walletTopUpRequest.updateMany({
    where: { id: requestId, status: "PENDING" },
    data: { status: "REJECTED", processedById: adminId, processedAt: new Date(), adminMemo },
  });
  if (update.count !== 1) throw new ValidationError("이미 처리된 충전 요청입니다");
  return prisma.walletTopUpRequest.findUniqueOrThrow({ where: { id: requestId } });
}
```

- [ ] **Step 5: Update wallet display labels**

Modify any wallet transaction label logic so `TOPUP_CREDIT` displays as `예치금 충전 승인`, while `TEST_CREDIT` remains local QA seed and `SHIPMENT_DEBIT` remains shipment debit.

- [ ] **Step 6: Run domain tests**

Run:

```bash
npx vitest run tests/wallet-topups.test.ts tests/wallet.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit Task 1**

```bash
git add prisma/schema.prisma prisma/migrations/*wallet_topup_requests*/migration.sql src/lib/wallet-topups.ts src/lib/wallet.ts tests/wallet-topups.test.ts tests/wallet.test.ts
git commit -m "feat: add wallet top-up requests"
```

---

### Task 2: Seller Top-Up Request API And Wallet Screen

**Files:**
- Create: `src/app/api/wallet/topups/route.ts`
- Modify: `src/app/dashboard/wallet/page.tsx`
- Modify: `src/app/dashboard/page.tsx`
- Test: `tests/wallet-topups.test.ts`

**Interfaces:**
- Consumes: `createWalletTopUpRequest()`, `listSellerWalletTopUps()`, `getWalletSummary()`
- Produces: seller form and JSON/form POST route for top-up requests

- [ ] **Step 1: Add failing route test**

Append to `tests/wallet-topups.test.ts`:

```ts
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
});
```

Also import `vi` at the top if the file does not already import it.

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run tests/wallet-topups.test.ts`

Expected: FAIL because seller top-up route does not exist.

- [ ] **Step 3: Implement seller route**

Create `src/app/api/wallet/topups/route.ts`:

```ts
import { NextResponse } from "next/server";
import { ValidationError } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { createWalletTopUpRequest } from "@/lib/wallet-topups";

function wantsJson(req: Request) {
  return req.headers.get("accept")?.includes("application/json") || req.headers.get("content-type")?.includes("application/json");
}

async function readInput(req: Request) {
  if (req.headers.get("content-type")?.includes("application/json")) {
    return req.json();
  }
  const form = await req.formData();
  return {
    amountKrw: Number(form.get("amountKrw")),
    depositorName: String(form.get("depositorName") ?? ""),
    memo: String(form.get("memo") ?? ""),
  };
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    if (wantsJson(req)) return NextResponse.json({ ok: false, error: "로그인이 필요합니다" }, { status: 401 });
    return NextResponse.redirect(new URL("/auth/login", req.url), 303);
  }

  try {
    const request = await createWalletTopUpRequest(session.userId, await readInput(req));
    if (wantsJson(req)) return NextResponse.json({ ok: true, request });
    return NextResponse.redirect(new URL("/dashboard/wallet?topup=requested", req.url), 303);
  } catch (e) {
    const message = e instanceof ValidationError ? e.message : "충전 요청 처리 중 오류가 발생했습니다";
    if (wantsJson(req)) return NextResponse.json({ ok: false, error: message }, { status: e instanceof ValidationError ? 400 : 500 });
    return NextResponse.redirect(new URL(`/dashboard/wallet?topupError=${encodeURIComponent(message)}`, req.url), 303);
  }
}
```

- [ ] **Step 4: Update seller wallet page**

Modify `src/app/dashboard/wallet/page.tsx` to:
- call `listSellerWalletTopUps(session.userId)`
- enable a `충전 요청` form posting to `/api/wallet/topups`
- keep clear copy: `실계좌·실입금 자동확인은 오픈 전 확정입니다. 지금은 운영자 확인용 요청만 접수합니다.`
- show request statuses:
  - `PENDING`: `충전 대기`
  - `APPROVED`: `충전 승인`
  - `REJECTED`: `충전 거절`
- show transaction labels:
  - `TOPUP_CREDIT`: `예치금 충전 승인`
  - `SHIPMENT_DEBIT`: `출고 요청 차감`
  - `TEST_CREDIT`: `로컬 QA 예치금`

- [ ] **Step 5: Update dashboard home wallet button**

Modify `src/app/dashboard/page.tsx` so the wallet banner primary link says `충전 요청` and links to `/dashboard/wallet`, while keeping the small boundary copy that real account/payment linkage is not active.

- [ ] **Step 6: Run seller tests and build**

Run:

```bash
npx vitest run tests/wallet-topups.test.ts tests/wallet.test.ts
npm run build
git diff --check
```

Expected: all PASS.

- [ ] **Step 7: Commit Task 2**

```bash
git add src/app/api/wallet/topups/route.ts src/app/dashboard/wallet/page.tsx src/app/dashboard/page.tsx tests/wallet-topups.test.ts
git commit -m "feat: add seller wallet top-up requests"
```

---

### Task 3: Admin Approval And Rejection

**Files:**
- Create: `src/app/api/admin/wallet-topups/[id]/approve/route.ts`
- Create: `src/app/api/admin/wallet-topups/[id]/reject/route.ts`
- Create: `src/app/admin/wallet-topups/page.tsx`
- Modify: `src/app/admin/layout.tsx`
- Test: `tests/wallet-topups.test.ts`

**Interfaces:**
- Consumes: `listAdminWalletTopUps()`, `approveWalletTopUpRequest()`, `rejectWalletTopUpRequest()`
- Produces: admin top-up queue and admin mutation routes

- [ ] **Step 1: Add failing admin route tests**

Append to `tests/wallet-topups.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run tests/wallet-topups.test.ts`

Expected: FAIL because admin routes do not exist.

- [ ] **Step 3: Implement admin routes**

Create approval/rejection route files. Both must:
- call `getSessionUser()`
- reject missing/non-admin with JSON 403 or redirect `/dashboard`
- parse JSON or form data
- call the domain function
- return JSON for JSON requests
- redirect to `/admin/wallet-topups?done=1` for form requests
- redirect with `?error=` on ValidationError for form requests

Use this shape for `approve/route.ts`:

```ts
import { NextResponse } from "next/server";
import { ValidationError } from "@/lib/auth";
import { getSessionUser } from "@/lib/session";
import { approveWalletTopUpRequest } from "@/lib/wallet-topups";

type RouteContext = { params: Promise<{ id: string }> };

function wantsJson(req: Request) {
  return req.headers.get("accept")?.includes("application/json") || req.headers.get("content-type")?.includes("application/json");
}

async function readMemo(req: Request) {
  if (req.headers.get("content-type")?.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    return String(body.memo ?? "");
  }
  const form = await req.formData();
  return String(form.get("memo") ?? "");
}

export async function POST(req: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    if (wantsJson(req)) return NextResponse.json({ ok: false, error: "운영자 권한이 필요합니다" }, { status: 403 });
    return NextResponse.redirect(new URL("/dashboard", req.url), 303);
  }

  const { id } = await context.params;
  try {
    const request = await approveWalletTopUpRequest(user.id, id, await readMemo(req));
    if (wantsJson(req)) return NextResponse.json({ ok: true, request });
    return NextResponse.redirect(new URL("/admin/wallet-topups?done=1", req.url), 303);
  } catch (e) {
    const message = e instanceof ValidationError ? e.message : "충전 요청 승인 중 오류가 발생했습니다";
    if (wantsJson(req)) return NextResponse.json({ ok: false, error: message }, { status: e instanceof ValidationError ? 400 : 500 });
    return NextResponse.redirect(new URL(`/admin/wallet-topups?error=${encodeURIComponent(message)}`, req.url), 303);
  }
}
```

Use the same structure for `reject/route.ts`, with `rejectWalletTopUpRequest(user.id, id, reason)`.

- [ ] **Step 4: Implement admin top-up page**

Create `src/app/admin/wallet-topups/page.tsx`:
- read admin user via layout guard
- call `listAdminWalletTopUps()`
- show seller email/contact, amount, depositor name, memo, status, created time
- for `PENDING`, show two forms:
  - approve: POST `/api/admin/wallet-topups/${request.id}/approve`, memo input, button `승인`
  - reject: POST `/api/admin/wallet-topups/${request.id}/reject`, reason input, button `거절`
- for processed requests, show processed memo and status.

Modify `src/app/admin/layout.tsx` to include:

```tsx
<Link href="/admin/wallet-topups" className="text-sm">예치금 확인</Link>
```

- [ ] **Step 5: Run admin tests and build**

Run:

```bash
npx vitest run tests/wallet-topups.test.ts tests/wallet.test.ts
npm run build
git diff --check
```

Expected: all PASS.

- [ ] **Step 6: Commit Task 3**

```bash
git add src/app/api/admin/wallet-topups/[id]/approve/route.ts src/app/api/admin/wallet-topups/[id]/reject/route.ts src/app/admin/wallet-topups/page.tsx src/app/admin/layout.tsx tests/wallet-topups.test.ts
git commit -m "feat: add admin wallet top-up approval"
```

---

### Task 4: Phase 10 Machine Check And Live QA

**Files:**
- Modify: `.harness/dubyeol2/phase-packets/phase-010/03-verification.md`
- Add screenshots under `.harness/dubyeol2/phase-packets/phase-010/screenshots/`

**Interfaces:**
- Consumes: completed Tasks 1-3
- Produces: Machine Check evidence package for Claude external audit

- [ ] **Step 1: Run full automated verification**

Run:

```bash
npx vitest run
npm run build
git diff --check
npx -y @google/design.md lint .harness/dubyeol2/design-system.md
```

Expected:
- Vitest PASS
- Next build PASS
- diff check PASS
- design lint errors 0; existing warnings acceptable if unchanged

- [ ] **Step 2: Run security/static guardrail check**

Run:

```bash
rg -n "process\\.env|SESSION_SECRET|passwordHash|cookie|secret|token|apiKey|account|bank|계좌|실입금|실결제|PG|payment" src/lib src/app/api src/app/dashboard src/app/admin scripts tests
```

Expected:
- No new real bank account, PG, API key, secret, or paid external API call.
- Expected matches may include session cookie, password hash tests, seed scripts, and boundary copy saying real bank/payment integration is not active.

- [ ] **Step 3: Run local browser QA**

Use local dev server and browser automation:

1. Start dev server on a free local port.
2. Use one host consistently, preferably `http://localhost:<port>`.
3. Seed admin with `scripts/seed-admin.ts`.
4. Register/login seller A.
5. Open `/dashboard/wallet`.
6. Submit 100,000원 top-up request with depositor name.
7. Verify seller wallet page shows request as `충전 대기` and balance remains 0원.
8. Login admin.
9. Open `/admin/wallet-topups`.
10. Approve the request.
11. Login seller A.
12. Verify wallet balance 100,000원, transaction `예치금 충전 승인`, request `충전 승인`.
13. Create a second request and reject it.
14. Verify rejected request does not change balance.
15. Register/login seller B and verify seller B cannot see seller A requests/transactions.
16. Capture screenshots:
    - seller wallet before request
    - seller top-up pending
    - admin top-up queue
    - admin top-up approved
    - seller wallet approved ledger
    - seller rejected request state

- [ ] **Step 4: Write `03-verification.md`**

Create `.harness/dubyeol2/phase-packets/phase-010/03-verification.md` with:
- Builder result summary
- Superpowers checklist
- Machine Check command results
- security/static guardrail results
- live QA summary and screenshots
- explicit out-of-scope list: real bank account, PG, bank API, automatic deposit matching, refund automation, tax invoice, packing list, package markers, deploy, push

- [ ] **Step 5: Prepare Claude external audit request**

Create `.harness/dubyeol2/external-audit/pending/request-phase-010.json` using Phase 9 request structure as the template. It must point at:
- `phase-packets/phase-010/00-customer-outcome.md`
- `phase-packets/phase-010/01-teamleader-intake.md`
- `phase-packets/phase-010/02-plan.md`
- `phase-packets/phase-010/03-verification.md`
- screenshots
- changed code/test files

- [ ] **Step 6: Commit Task 4 evidence**

```bash
git add .harness/dubyeol2/phase-packets/phase-010/03-verification.md .harness/dubyeol2/phase-packets/phase-010/screenshots .harness/dubyeol2/external-audit/pending/request-phase-010.json
git commit -m "docs: add phase 10 verification evidence"
```
