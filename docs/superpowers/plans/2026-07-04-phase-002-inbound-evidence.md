# Phase 2: 입고 증거 확인 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 운영자가 주문 건에 입고(사진 1~2장·외포장 이상)와 유료 검수 결과(수량·외관·하자)를 기록하면, 셀러가 대시보드에서 자기 주문의 입고 증거를 확인한다. 창고 주소+회원별 입고ID 제공.

**Architecture:** Phase 1 구조 위에 증분. 서비스 로직은 `src/lib/inbound.ts` 순수 함수로 두고 Vitest로 TDD. 운영자는 `role="ADMIN"` 사용자로 분리(가입 화면 노출 금지, 시드 스크립트로 생성), `/admin` 라우트 그룹에 역할 가드. 사진은 로컬 `public/uploads/`(gitignore) 저장 — 외부 스토리지 금지선 준수.

**Tech Stack:** 기존과 동일 (Next.js 16, Prisma+SQLite, iron-session, Vitest). 신규 의존성 없음.

**계약 문서:** `phase-packets/phase-002/00-customer-outcome.md` §3 / 벤치마크 `benchmark-duly.md` §2.8(창고주소) / UI 토큰 `design-system.md`

**금지선:** push·deploy·원격·실DB·유료 API 금지. `git add -A` 금지(명시 add만). 하네스 문서 수정 금지. TDD 순서 준수.

**고객 약속 하드라인:** ①증거-실기록 일치 ②셀러/운영자 권한 분리(셀러가 /admin 접근 불가) ③검수 미신청 건에 검수 결과 저장·표시 금지 ④타 셀러 오귀속 금지

---

## File Structure

```
prisma/schema.prisma            # User.role·inboundCode, Order 입고/검수 필드, InboundPhoto 추가
scripts/seed-admin.ts           # 운영자 계정 생성 (npx tsx 실행, 비번은 인자/환경변수)
src/lib/inbound.ts              # recordInbound / getWarehouseAddress+ensureInboundCode
src/lib/uploads.ts              # 업로드 파일 저장 (타입·크기 검증)
src/app/api/admin/inbound/route.ts        # POST multipart 입고 기록
src/app/admin/layout.tsx        # ADMIN 역할 가드 + 최소 셸
src/app/admin/orders/page.tsx   # 전체 주문 목록(운영자용, 입고 대기 중심)
src/app/admin/orders/[id]/page.tsx        # 입고 기록 폼(사진·외포장·검수)
src/app/dashboard/orders/[id]/page.tsx    # 셀러 주문 상세(입고 증거)
src/app/dashboard/warehouse-address/page.tsx  # 창고 주소+입고ID(복사)
tests/inbound.test.ts
```

수정: `src/lib/auth.ts`(role 반영 없음 — 기본값), `src/app/dashboard/orders/page.tsx`(상태 칩 확장+상세 링크), `src/app/dashboard/layout.tsx`(창고 주소 메뉴 활성), `.gitignore`(+`public/uploads/`)

---

### Task 1: 스키마 확장 + 운영자 시드

**Files:** Modify `prisma/schema.prisma`, Create `scripts/seed-admin.ts`, Modify `.gitignore`

- [ ] **Step 1: 스키마 변경**

`prisma/schema.prisma`의 User에 필드 추가:
```prisma
  role         String  @default("SELLER") // "SELLER" | "ADMIN"
  inboundCode  String? @unique            // 회원별 입고ID (8자 대문자영숫자)
```
Order에 입고/검수 필드 추가:
```prisma
  receivedAt        DateTime?
  outerIssue        Boolean?   // 외포장 이상 여부
  outerNote         String?
  inspCountActual   Int?       // 이하 4개는 유료 검수 신청 건만 기록
  inspAppearanceOk  Boolean?
  inspDefectCount   Int?
  inspNote          String?
  photos            InboundPhoto[]
```
새 모델:
```prisma
model InboundPhoto {
  id        String   @id @default(cuid())
  order     Order    @relation(fields: [orderId], references: [id])
  orderId   String
  path      String   // "/uploads/<파일명>"
  createdAt DateTime @default(now())
}
```
status 주석 갱신: `// "REQUESTED"(접수됨) | "RECEIVED"(입고완료)`

- [ ] **Step 2: 마이그레이션** — `npx prisma migrate dev --name inbound` (로컬 SQLite)

- [ ] **Step 3: 시드 스크립트** `scripts/seed-admin.ts`:
```ts
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const email = process.argv[2];
const password = process.argv[3];

async function main() {
  if (!email || !password || password.length < 8) {
    console.error("사용법: npx tsx scripts/seed-admin.ts <email> <password(8자+)>");
    process.exit(1);
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN" },
    create: { email, passwordHash, contactName: "운영자", role: "ADMIN" },
  });
  console.log(`운영자 준비 완료: ${email}`);
}
main().finally(() => prisma.$disconnect());
```
`npm i -D tsx` 후 로컬 확인: `npx tsx scripts/seed-admin.ts admin@local.test admin-local-1` → "운영자 준비 완료". (비밀번호를 코드·문서에 커밋하지 않는다 — 인자로만)

- [ ] **Step 4: .gitignore에 `public/uploads/` 추가, 빈 폴더 유지용 `public/uploads/.gitkeep` 커밋 예외(`!public/uploads/.gitkeep`)**

- [ ] **Step 5: `npm run build` 성공 확인 후 커밋** — `git add prisma/ scripts/ .gitignore public/uploads/.gitkeep package.json package-lock.json && git commit -m "feat: 입고·검수 스키마와 운영자 시드"`

### Task 2: 입고 기록 서비스 (TDD)

**Files:** Create `src/lib/inbound.ts`, `tests/inbound.test.ts`

- [ ] **Step 1: 실패하는 테스트** `tests/inbound.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "../src/lib/db";
import { registerSeller } from "../src/lib/auth";
import { createOrder } from "../src/lib/orders";
import { recordInbound, ensureInboundCode } from "../src/lib/inbound";

let seller: { id: string };
let orderInsp: { id: string }, orderPlain: { id: string };

beforeEach(async () => {
  await prisma.inboundPhoto.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
  seller = await registerSeller({ email: "s@s.com", password: "password1", contactName: "S" });
  orderInsp = await createOrder(seller.id, { productUrl: "https://a.com", productName: "검수품", quantity: 100, serviceType: "PURCHASE", inspectionRequested: true });
  orderPlain = await createOrder(seller.id, { productUrl: "https://b.com", productName: "일반품", quantity: 50, serviceType: "SHIPPING", inspectionRequested: false });
});

describe("recordInbound", () => {
  it("사진 경로·외포장 기록으로 입고완료 상태가 된다", async () => {
    const o = await recordInbound(orderPlain.id, {
      photoPaths: ["/uploads/a.jpg", "/uploads/b.jpg"], outerIssue: false,
    });
    expect(o.status).toBe("RECEIVED");
    expect(o.receivedAt).toBeTruthy();
    const photos = await prisma.inboundPhoto.findMany({ where: { orderId: orderPlain.id } });
    expect(photos).toHaveLength(2);
  });
  it("검수 신청 건은 검수 결과를 함께 기록한다", async () => {
    const o = await recordInbound(orderInsp.id, {
      photoPaths: ["/uploads/a.jpg"], outerIssue: false,
      inspection: { countActual: 97, appearanceOk: true, defectCount: 0, note: "3개 부족" },
    });
    expect(o.inspCountActual).toBe(97);
  });
  it("검수 미신청 건에 검수 결과를 넣으면 거부한다", async () => {
    await expect(recordInbound(orderPlain.id, {
      photoPaths: ["/uploads/a.jpg"], outerIssue: false,
      inspection: { countActual: 50, appearanceOk: true, defectCount: 0 },
    })).rejects.toThrow("검수를 신청하지 않은");
  });
  it("사진이 0장 또는 3장 이상이면 거부한다", async () => {
    await expect(recordInbound(orderPlain.id, { photoPaths: [], outerIssue: false }))
      .rejects.toThrow("사진");
    await expect(recordInbound(orderPlain.id, { photoPaths: ["/uploads/1.jpg","/uploads/2.jpg","/uploads/3.jpg"], outerIssue: false }))
      .rejects.toThrow("사진");
  });
  it("이미 입고완료된 주문은 재기록을 거부한다", async () => {
    await recordInbound(orderPlain.id, { photoPaths: ["/uploads/a.jpg"], outerIssue: false });
    await expect(recordInbound(orderPlain.id, { photoPaths: ["/uploads/c.jpg"], outerIssue: false }))
      .rejects.toThrow("이미 입고");
  });
  it("없는 주문이면 거부한다", async () => {
    await expect(recordInbound("nope", { photoPaths: ["/uploads/a.jpg"], outerIssue: false }))
      .rejects.toThrow("주문을 찾을 수 없습니다");
  });
});

describe("ensureInboundCode", () => {
  it("입고ID가 없으면 8자 코드를 생성해 저장하고, 있으면 그대로 반환한다", async () => {
    const c1 = await ensureInboundCode(seller.id);
    expect(c1).toMatch(/^[A-Z0-9]{8}$/);
    const c2 = await ensureInboundCode(seller.id);
    expect(c2).toBe(c1);
  });
});
```

- [ ] **Step 2: 실패 확인** — `npx vitest run tests/inbound.test.ts` → FAIL(모듈 없음)

- [ ] **Step 3: 구현** `src/lib/inbound.ts`:
```ts
import { randomBytes } from "crypto";
import { prisma } from "./db";
import { ValidationError } from "./auth";

export type InboundInput = {
  photoPaths: string[];
  outerIssue: boolean;
  outerNote?: string;
  inspection?: { countActual: number; appearanceOk: boolean; defectCount: number; note?: string };
};

export async function recordInbound(orderId: string, input: InboundInput) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new ValidationError("주문을 찾을 수 없습니다");
  if (order.status !== "REQUESTED") throw new ValidationError("이미 입고 처리된 주문입니다");
  if (input.photoPaths.length < 1 || input.photoPaths.length > 2)
    throw new ValidationError("입고 사진은 1~2장이어야 합니다");
  if (input.inspection && !order.inspectionRequested)
    throw new ValidationError("검수를 신청하지 않은 주문에는 검수 결과를 기록할 수 없습니다");
  const insp = input.inspection;
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "RECEIVED",
      receivedAt: new Date(),
      outerIssue: input.outerIssue,
      outerNote: input.outerNote,
      inspCountActual: insp?.countActual,
      inspAppearanceOk: insp?.appearanceOk,
      inspDefectCount: insp?.defectCount,
      inspNote: insp?.note,
      photos: { create: input.photoPaths.map((path) => ({ path })) },
    },
  });
  return updated;
}

export async function ensureInboundCode(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ValidationError("로그인이 필요합니다");
  if (user.inboundCode) return user.inboundCode;
  const code = randomBytes(6).toString("base64url").replace(/[^A-Za-z0-9]/g, "").slice(0, 8).toUpperCase().padEnd(8, "0");
  await prisma.user.update({ where: { id: userId }, data: { inboundCode: code } });
  return code;
}
```

- [ ] **Step 4: 통과 확인** — `npx vitest run` 전체 (기존 14 + 신규 7 = 21)

- [ ] **Step 5: 커밋** — `git add tests/inbound.test.ts src/lib/inbound.ts && git commit -m "feat: 입고 기록·입고ID 서비스 TDD"`

### Task 3: 업로드 처리 + 운영자 영역

**Files:** Create `src/lib/uploads.ts`, `src/app/api/admin/inbound/route.ts`, `src/app/admin/layout.tsx`, `src/app/admin/orders/page.tsx`, `src/app/admin/orders/[id]/page.tsx`

- [ ] **Step 1: 업로드 저장** `src/lib/uploads.ts`:
```ts
import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { ValidationError } from "./auth";

const ALLOWED = new Map([["image/jpeg", ".jpg"], ["image/png", ".png"], ["image/webp", ".webp"]]);
const MAX_BYTES = 10 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function saveInboundPhoto(file: File): Promise<string> {
  const ext = ALLOWED.get(file.type);
  if (!ext) throw new ValidationError("사진은 JPG/PNG/WebP만 가능합니다");
  if (file.size > MAX_BYTES) throw new ValidationError("사진은 10MB 이하여야 합니다");
  const name = `${Date.now()}-${randomBytes(8).toString("hex")}${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}
```
(파일명은 서버 생성 난수 — 사용자 입력 파일명을 경로에 쓰지 않아 경로 조작 차단)

- [ ] **Step 2: 운영자 판별 헬퍼** — `src/lib/session.ts`에 추가:
```ts
import { prisma } from "./db";

export async function getSessionUser() {
  const session = await getSession();
  if (!session.userId) return null;
  return prisma.user.findUnique({ where: { id: session.userId } });
}
```

- [ ] **Step 3: 입고 기록 API** `src/app/api/admin/inbound/route.ts`:
```ts
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { ValidationError } from "@/lib/auth";
import { saveInboundPhoto } from "@/lib/uploads";
import { recordInbound } from "@/lib/inbound";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN")
    return NextResponse.json({ ok: false, error: "권한이 없습니다" }, { status: 403 });
  try {
    const form = await req.formData();
    const orderId = String(form.get("orderId") ?? "");
    const files = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length < 1 || files.length > 2) throw new ValidationError("입고 사진은 1~2장이어야 합니다");
    const photoPaths: string[] = [];
    for (const f of files) photoPaths.push(await saveInboundPhoto(f));
    const hasInsp = form.get("hasInspection") === "on";
    await recordInbound(orderId, {
      photoPaths,
      outerIssue: form.get("outerIssue") === "on",
      outerNote: String(form.get("outerNote") ?? "") || undefined,
      inspection: hasInsp ? {
        countActual: Number(form.get("countActual")),
        appearanceOk: form.get("appearanceOk") === "on",
        defectCount: Number(form.get("defectCount") ?? 0),
        note: String(form.get("inspNote") ?? "") || undefined,
      } : undefined,
    });
    return NextResponse.redirect(new URL("/admin/orders?done=1", req.url), 303);
  } catch (e) {
    if (e instanceof ValidationError)
      return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    console.error("inbound error:", e);
    return NextResponse.json({ ok: false, error: "입고 처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}
```

- [ ] **Step 4: 운영자 셸+목록+기록 폼** (design-system 토큰, brand red 계열 헤더로 셀러 화면과 시각 구분)

`src/app/admin/layout.tsx`:
```tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/dashboard");
  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-brand text-white px-6 h-14 flex items-center gap-6">
        <span className="font-bold">물류 운영자</span>
        <Link href="/admin/orders" className="text-sm">주문·입고</Link>
      </header>
      <main className="max-w-5xl mx-auto p-8">{children}</main>
    </div>
  );
}
```

`src/app/admin/orders/page.tsx` — 전체 주문 테이블(셀러 이메일·상품·수량·검수 신청 여부·상태), REQUESTED 건에 [입고 기록] 링크:
```tsx
import Link from "next/link";
import { prisma } from "@/lib/db";

const STATUS_LABEL: Record<string, string> = { REQUESTED: "접수됨", RECEIVED: "입고완료" };

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { seller: { select: { email: true } } },
  });
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-heading">주문·입고 관리</h1>
      <table className="w-full bg-surface rounded-[16px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] text-sm">
        <thead><tr className="text-left text-muted">
          <th className="p-3">셀러</th><th className="p-3">상품</th><th className="p-3">수량</th><th className="p-3">검수</th><th className="p-3">상태</th><th className="p-3"></th>
        </tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t border-black/5">
              <td className="p-3 text-secondary">{o.seller.email}</td>
              <td className="p-3 text-body">{o.productName}</td>
              <td className="p-3">{o.quantity}</td>
              <td className="p-3">{o.inspectionRequested ? "유료 검수" : "-"}</td>
              <td className="p-3">{STATUS_LABEL[o.status] ?? o.status}</td>
              <td className="p-3">{o.status === "REQUESTED" && (
                <Link href={`/admin/orders/${o.id}`} className="text-brand font-medium">입고 기록</Link>
              )}</td>
            </tr>
          ))}
          {orders.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted">주문이 없습니다</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
```

`src/app/admin/orders/[id]/page.tsx` — 입고 기록 폼(HTML form → POST /api/admin/inbound, multipart). 검수 신청 건에만 검수 섹션 렌더:
```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function AdminInboundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { seller: { select: { email: true } } } });
  if (!order || order.status !== "REQUESTED") notFound();
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-heading">입고 기록 — {order.productName} × {order.quantity}</h1>
      <p className="text-sm text-secondary">셀러: {order.seller.email} · {order.inspectionRequested ? "유료 검수 신청 건" : "검수 미신청 건 (검수 결과 기록 불가)"}</p>
      <form action="/api/admin/inbound" method="post" encType="multipart/form-data"
        className="bg-surface rounded-[16px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-6 space-y-4">
        <input type="hidden" name="orderId" value={order.id} />
        <label className="block text-sm text-secondary">입고 사진 (1~2장, JPG/PNG/WebP)
          <input type="file" name="photos" accept="image/jpeg,image/png,image/webp" multiple required className="mt-1 block" />
        </label>
        <label className="block text-sm text-body">
          <input type="checkbox" name="outerIssue" /> 외포장 이상 있음
        </label>
        <label className="block text-sm text-secondary">외포장 메모
          <input name="outerNote" className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
        </label>
        {order.inspectionRequested && (
          <fieldset className="rounded-lg bg-surface-alt p-4 space-y-3 text-sm">
            <label className="block font-medium text-body"><input type="checkbox" name="hasInspection" defaultChecked /> 검수 결과 기록</label>
            <label className="block text-secondary">실입고 수량
              <input type="number" name="countActual" min={0} required className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
            </label>
            <label className="block text-body"><input type="checkbox" name="appearanceOk" defaultChecked /> 외관 정상</label>
            <label className="block text-secondary">하자 수량
              <input type="number" name="defectCount" min={0} defaultValue={0} className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
            </label>
            <label className="block text-secondary">검수 메모
              <input name="inspNote" className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
            </label>
          </fieldset>
        )}
        <button type="submit" className="bg-brand text-white font-semibold rounded-[12px] px-6 py-3">입고 완료 처리</button>
      </form>
    </div>
  );
}
```

- [ ] **Step 5: `npm run build && npx vitest run` 확인 후 커밋** — `git add src/lib/uploads.ts src/lib/session.ts src/app/api/admin/ src/app/admin/ && git commit -m "feat: 운영자 입고 기록 영역(권한 가드·사진 업로드)"`

### Task 4: 셀러 입고 증거 표시 + 창고 주소

**Files:** Create `src/app/dashboard/orders/[id]/page.tsx`, `src/app/dashboard/warehouse-address/page.tsx`; Modify `src/app/dashboard/orders/page.tsx`, `src/app/dashboard/layout.tsx`

- [ ] **Step 1: 주문 상세(입고 증거)** `src/app/dashboard/orders/[id]/page.tsx`:
```tsx
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

const STATUS_LABEL: Record<string, string> = { REQUESTED: "접수됨", RECEIVED: "입고완료" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) redirect("/auth/login");
  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, sellerId: session.userId },  // 격리: sellerId 스코프 필수
    include: { photos: true },
  });
  if (!order) notFound();
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-heading">{order.productName} × {order.quantity}</h1>
      <p className="text-sm text-muted">{order.serviceType === "PURCHASE" ? "구매대행" : "배송대행"} · 상태: {STATUS_LABEL[order.status] ?? order.status}</p>
      {order.status === "RECEIVED" ? (
        <section className="bg-surface rounded-[27px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-6 space-y-4">
          <h2 className="text-[14px] font-semibold text-heading">입고 증거</h2>
          <div className="flex gap-3">
            {order.photos.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.id} src={p.path} alt="입고 사진" className="w-40 h-40 object-cover rounded-[12px] border border-black/5" />
            ))}
          </div>
          <p className="text-sm text-body">외포장: {order.outerIssue ? <span className="text-danger">이상 있음{order.outerNote ? ` — ${order.outerNote}` : ""}</span> : "정상"}</p>
          {order.inspectionRequested && order.inspCountActual !== null ? (
            <div className="rounded-lg bg-success-tint p-4 text-sm space-y-1">
              <p className="font-medium text-success">유료 검수 결과</p>
              <p className="text-body">실입고 수량: {order.inspCountActual}/{order.quantity}</p>
              <p className="text-body">외관: {order.inspAppearanceOk ? "정상" : "이상"} · 하자: {order.inspDefectCount ?? 0}건</p>
              {order.inspNote && <p className="text-secondary">{order.inspNote}</p>}
            </div>
          ) : (
            <div className="rounded-lg bg-surface-alt p-4 text-sm text-muted">
              수량 미확인 — 유료 검수를 신청하지 않은 건입니다. 기본 제공은 입고 사진과 외포장 이상 안내입니다.
            </div>
          )}
        </section>
      ) : (
        <div className="bg-surface rounded-[27px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-8 text-muted text-sm">
          아직 중국 창고에 입고되지 않았습니다. 입고되면 사진과 함께 표시됩니다.
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 목록에서 상세 링크·상태 칩 확장** — `src/app/dashboard/orders/page.tsx`의 `STATUS_LABEL`에 `RECEIVED: "입고완료"` 추가, 각 li의 상품명 블록을 `<Link href={\`/dashboard/orders/${o.id}\`}>`로 감싸기(스타일 유지)

- [ ] **Step 3: 창고 주소 페이지** `src/app/dashboard/warehouse-address/page.tsx` (벤치마크 §2.8 구조. 실제 창고 주소는 사업 값 미확정 — placeholder 상수로 두고 화면에 "오픈 전 확정" 뱃지 표시):
```tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ensureInboundCode } from "@/lib/inbound";
import CopyButton from "./copy-button";

// 창고 실주소는 오픈 전 확정 (대표님 결정 2026-07-04). 실제 창고 계약 후 값만 교체.
// 화면 구조·복사 UX는 두리무역 벤치(benchmark-duly.md §2.8) 그대로.
const WAREHOUSE = {
  receiver: "물류창고 (오픈 전 확정)",
  phone: "000-0000-0000",
  address: "山东省威海市 ○○物流园 (창고 주소 오픈 전 확정)",
};

export default async function WarehouseAddressPage() {
  const session = await getSession();
  if (!session.userId) redirect("/auth/login");
  const code = await ensureInboundCode(session.userId);
  const full = `${WAREHOUSE.address} 入库ID:${code}`;
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-heading">중국 창고 주소</h1>
      <p className="text-sm text-secondary">1688/타오바오 주문 시 배송지로 사용하세요. 주소 끝의 입고ID로 상품을 구분합니다.</p>
      <section className="bg-surface rounded-[27px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-6 space-y-3 text-sm">
        <p className="text-muted">나의 입고ID: <span className="font-semibold text-brand">{code}</span></p>
        <p className="text-body">수령인: {WAREHOUSE.receiver}</p>
        <p className="text-body">연락처: {WAREHOUSE.phone}</p>
        <p className="text-body">주소: {full}</p>
        <CopyButton text={`${WAREHOUSE.receiver}\n${WAREHOUSE.phone}\n${full}`} />
        <p className="text-xs text-muted">⚠️ 창고 실주소는 오픈 전 확정됩니다 (현재 표시값은 자리표시)</p>
      </section>
    </div>
  );
}
```
`src/app/dashboard/warehouse-address/copy-button.tsx`:
```tsx
"use client";
import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); }}
      className="bg-accent text-white text-sm font-semibold rounded-[12px] px-4 py-2">
      {copied ? "복사됨 ✓" : "원클릭 복사"}
    </button>
  );
}
```

- [ ] **Step 4: 사이드바 활성화** — `src/app/dashboard/layout.tsx`의 "📦 배송대행" 그룹에서 `입고 관리 (준비 중)` 줄을 삭제하지 말고 아래처럼 교체: `<Link href="/dashboard/warehouse-address" className="block py-1.5 text-body">창고 주소</Link>` 추가, "입고 관리 (준비 중)"은 유지(입고 목록 화면은 내 주문 상세로 대체 — Phase 2 범위)

- [ ] **Step 5: 전체 검증 후 커밋** — `npx vitest run && npm run build` → `git add src/app/dashboard/ && git commit -m "feat: 셀러 입고 증거 상세·창고 주소(입고ID)"`

### Task 5: 마무리 검증
1. `npx vitest run && npm run build` — 21개 PASS, 빌드 0오류
2. `npx -y @google/design.md lint .harness/dubyeol2/design-system.md` — errors 0
3. 빌드 부산물만 dirty면 커밋 `chore: Phase 2 마무리 검증`

---

## Self-Review 결과
- 스펙 커버리지: 00 §3(창고주소/입고ID ↔ Task 4, 운영자 기록 ↔ Task 3, 셀러 증거 ↔ Task 4, 권한 분리 ↔ admin layout+API 403, 검수 미신청 거부 ↔ Task 2 테스트) — 갭 없음
- 플레이스홀더: 창고 실주소는 의도된 사업값 자리표시(화면에 명시) — 코드 플레이스홀더 아님
- 타입 일관성: InboundInput·ensureInboundCode·getSessionUser 서명 일치 확인
- Machine Check(TL): Playwright QA(운영자 입고 기록→셀러 증거 확인·격리·검수 경계) + 보안 검토(파일 업로드·권한) 필수
