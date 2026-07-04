# Phase 1: 셀러 주문 접수 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 셀러가 두리무역 외관을 벤치마킹한 사이트에서 가입·로그인하고, 주문(유료 검수 선택 포함)을 접수하고, 내 주문 목록·상태를 확인한다. 다른 셀러의 주문은 절대 보이지 않는다.

**Architecture:** Next.js App Router 단일 앱. 서버 로직은 route handler + 순수 서비스 함수(`src/lib/`)로 분리해 Vitest로 단위 테스트. DB는 Prisma+SQLite(로컬 파일, 실서비스 DB 아님). 세션은 iron-session 암호화 쿠키. UI 토큰은 `.harness/dubyeol2/design-system.md` YAML 값을 Tailwind 테마로 옮긴다.

**Tech Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Prisma + SQLite · iron-session · bcryptjs · Vitest + @testing-library/react

**계약 문서 (구현 전 필독):**
- 고객 결과·합격 기준: `.harness/dubyeol2/phase-packets/phase-001/00-customer-outcome.md` (§5 Phase 1 좁힌 완료 기준)
- 벤치마크(메뉴·기능·문구 패턴): `.harness/dubyeol2/benchmark-duly.md`
- UI 토큰(정확한 값, 벗어나면 안 됨): `.harness/dubyeol2/design-system.md`

**금지선:** `git push`·deploy·원격 머지·실DB·유료 API 실호출·secret 커밋 금지. 로컬 git 커밋은 필수.

---

## File Structure

```
물류/
├─ package.json / tsconfig.json / next.config.ts / vitest.config.ts
├─ prisma/schema.prisma          # User, Order 모델
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx / globals.css     # 폰트(DM Sans)·토큰
│  │  ├─ page.tsx                     # 랜딩(두리무역 외관 벤치)
│  │  ├─ auth/register/page.tsx       # 회원가입
│  │  ├─ auth/login/page.tsx          # 로그인
│  │  ├─ api/auth/register/route.ts
│  │  ├─ api/auth/login/route.ts
│  │  ├─ api/auth/logout/route.ts
│  │  ├─ api/orders/route.ts          # POST 접수 / GET 내 목록
│  │  └─ dashboard/
│  │     ├─ layout.tsx                # 사이드바 221px 셸 + 로그인 가드
│  │     ├─ page.tsx                  # 대시보드 홈(주문 현황 카드)
│  │     ├─ orders/page.tsx           # 내 주문 목록
│  │     └─ orders/new/page.tsx       # 주문 접수 폼
│  └─ lib/
│     ├─ db.ts                        # PrismaClient 싱글턴
│     ├─ session.ts                   # iron-session 설정·헬퍼
│     ├─ auth.ts                      # registerSeller / verifyLogin (순수 로직)
│     └─ orders.ts                    # createOrder / listOrdersBySeller
└─ tests/
   ├─ auth.test.ts
   └─ orders.test.ts
```

**책임 경계:** `lib/*`는 요청 객체를 모르는 순수 함수(입력→DB→출력)로 두고 여기만 단위 테스트한다. route handler는 파싱·세션·호출만 한다. 화면은 서버 컴포넌트에서 `lib/*`를 직접 호출한다.

---

### Task 1: 스캐폴드 + 디자인 토큰

**Files:**
- Create: 프로젝트 루트에 Next.js 스캐폴드 (`package.json`, `src/app/*`, `tsconfig.json` 등)
- Create: `vitest.config.ts`
- Modify: `src/app/globals.css` (디자인 토큰)

- [ ] **Step 1: git 초기화 및 기존 문서 커밋**

```bash
cd /Users/twostars/Documents/물류
git init -b main
printf 'node_modules/\n.next/\n*.db\n.env*\n.playwright-mcp/\n.DS_Store\n' > .gitignore
git add .gitignore AGENTS.md CLAUDE.md .harness/ docs/
git commit -m "chore: 두별2 하네스 문서 초기 커밋"
```

- [ ] **Step 2: Next.js 스캐폴드 (비대화형)**

```bash
npx -y create-next-app@latest . --ts --tailwind --app --src-dir --no-eslint --no-import-alias --use-npm --yes
npm i iron-session bcryptjs prisma @prisma/client
npm i -D vitest @vitejs/plugin-react @testing-library/react jsdom vite-tsconfig-paths bcryptjs @types/bcryptjs
```
Expected: `package.json` 생성, `npm run dev` 가능 상태. (기존 .harness/·docs/·AGENTS.md·CLAUDE.md는 건드리지 않는다. create-next-app이 비어있지 않다고 거부하면 임시 폴더에 생성 후 `rsync -a --ignore-existing` 로 복사한다.)

- [ ] **Step 3: vitest 설정**

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
});
```
`package.json` scripts에 추가: `"test": "vitest run"`

- [ ] **Step 4: 디자인 토큰을 globals.css에 반영** (design-system.md YAML 값 그대로)

`src/app/globals.css` 상단(기존 tailwind import 아래)에:
```css
@theme {
  --color-bg: #fafbfb;
  --color-surface: #ffffff;
  --color-surface-alt: #f9fafb;
  --color-heading: #101828;
  --color-body: #11142d;
  --color-secondary: #4a5565;
  --color-muted: #777e89;
  --color-accent: #f54a00;   /* 공개 영역 CTA */
  --color-brand: #cc0000;    /* 대시보드·브랜드 */
  --color-info: #0084d1;
  --color-success: #009966;
  --color-warning-tint: #fff2e4;
  --color-success-tint: #ebf8f2;
  --color-danger: #cc0000;
  --radius-card: 27px;
  --radius-cta: 12px;
  --radius-pill: 18px;
}
body { background: var(--color-bg); color: var(--color-body); }
```

- [ ] **Step 5: 빌드 확인 후 커밋**

```bash
npm run build
git add -A && git commit -m "feat: Next.js 스캐폴드 + 두리무역 벤치 디자인 토큰"
```
Expected: build 성공(오류 0).

### Task 2: Prisma 스키마 (User·Order)

**Files:**
- Create: `prisma/schema.prisma`, `src/lib/db.ts`

- [ ] **Step 1: 스키마 작성**

`prisma/schema.prisma`:
```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "sqlite"; url = "file:./dev.db" }

model User {
  id           String  @id @default(cuid())
  email        String  @unique
  passwordHash String
  companyName  String?
  contactName  String
  phone        String?
  createdAt    DateTime @default(now())
  orders       Order[]
}

model Order {
  id                  String  @id @default(cuid())
  seller              User    @relation(fields: [sellerId], references: [id])
  sellerId            String
  productUrl          String
  productName         String
  optionText          String?
  quantity            Int
  serviceType         String   // "PURCHASE"(구매대행) | "SHIPPING"(배송대행)
  inspectionRequested Boolean  @default(false) // 유료 검수 신청 여부
  memo                String?
  status              String   @default("REQUESTED") // Phase1: REQUESTED(접수됨)만 사용
  createdAt           DateTime @default(now())
}
```

- [ ] **Step 2: 클라이언트 싱글턴**

`src/lib/db.ts`:
```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 3: 마이그레이션 실행(로컬 SQLite 파일 — 실DB 아님)**

```bash
npx prisma migrate dev --name init
```
Expected: `prisma/dev.db` 생성, migration 폴더 생성.

- [ ] **Step 4: 커밋**

```bash
git add -A && git commit -m "feat: User·Order 프리즈마 스키마"
```

### Task 3: 인증 코어 (TDD)

**Files:**
- Create: `src/lib/auth.ts`, `tests/auth.test.ts`, `src/lib/session.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/auth.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "../src/lib/db";
import { registerSeller, verifyLogin } from "../src/lib/auth";

beforeEach(async () => {
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
});

describe("registerSeller", () => {
  it("이메일·비밀번호·담당자명으로 가입하고 비밀번호는 해시로 저장한다", async () => {
    const user = await registerSeller({ email: "a@b.com", password: "secret123", contactName: "셀러A" });
    expect(user.email).toBe("a@b.com");
    const row = await prisma.user.findUnique({ where: { email: "a@b.com" } });
    expect(row!.passwordHash).not.toContain("secret123");
  });
  it("중복 이메일은 거부한다", async () => {
    await registerSeller({ email: "a@b.com", password: "secret123", contactName: "셀러A" });
    await expect(registerSeller({ email: "a@b.com", password: "x1234567", contactName: "B" }))
      .rejects.toThrow("이미 가입된 이메일");
  });
  it("8자 미만 비밀번호는 거부한다", async () => {
    await expect(registerSeller({ email: "c@d.com", password: "short", contactName: "C" }))
      .rejects.toThrow("비밀번호는 8자 이상");
  });
});

describe("verifyLogin", () => {
  it("올바른 자격이면 사용자를 반환한다", async () => {
    await registerSeller({ email: "a@b.com", password: "secret123", contactName: "셀러A" });
    const u = await verifyLogin("a@b.com", "secret123");
    expect(u?.email).toBe("a@b.com");
  });
  it("틀린 비밀번호면 null", async () => {
    await registerSeller({ email: "a@b.com", password: "secret123", contactName: "셀러A" });
    expect(await verifyLogin("a@b.com", "wrongpass")).toBeNull();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/auth.test.ts`
Expected: FAIL — `registerSeller` 미정의.

- [ ] **Step 3: 최소 구현**

`src/lib/auth.ts`:
```ts
import bcrypt from "bcryptjs";
import { prisma } from "./db";

export async function registerSeller(input: { email: string; password: string; contactName: string; companyName?: string; phone?: string; }) {
  if (input.password.length < 8) throw new Error("비밀번호는 8자 이상이어야 합니다");
  const exists = await prisma.user.findUnique({ where: { email: input.email } });
  if (exists) throw new Error("이미 가입된 이메일입니다");
  const passwordHash = await bcrypt.hash(input.password, 10);
  return prisma.user.create({
    data: { email: input.email, passwordHash, contactName: input.contactName, companyName: input.companyName, phone: input.phone },
  });
}

export async function verifyLogin(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run tests/auth.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: 세션 헬퍼 작성**

`src/lib/session.ts`:
```ts
import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionData = { userId?: string };

export const sessionOptions: SessionOptions = {
  // 로컬 개발 전용 시크릿. 배포 전 환경변수로 교체(금지선: secret 커밋 금지 — 이 값은 dev placeholder)
  password: process.env.SESSION_SECRET ?? "dev-only-secret-change-me-32chars!!",
  cookieName: "mulryu_session",
  cookieOptions: { secure: process.env.NODE_ENV === "production" },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}
```

- [ ] **Step 6: 커밋**

```bash
git add -A && git commit -m "feat: 셀러 인증 코어(가입·로그인 검증·세션) TDD"
```

### Task 4: 인증 route + 화면

**Files:**
- Create: `src/app/api/auth/register/route.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/logout/route.ts`
- Create: `src/app/auth/register/page.tsx`, `src/app/auth/login/page.tsx`

- [ ] **Step 1: route handler 3종**

`src/app/api/auth/register/route.ts`:
```ts
import { NextResponse } from "next/server";
import { registerSeller } from "@/lib/auth";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  const body = await req.json();
  try {
    const user = await registerSeller(body);
    const session = await getSession();
    session.userId = user.id;
    await session.save();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 400 });
  }
}
```

`src/app/api/auth/login/route.ts`:
```ts
import { NextResponse } from "next/server";
import { verifyLogin } from "@/lib/auth";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const user = await verifyLogin(email, password);
  if (!user) return NextResponse.json({ ok: false, error: "이메일 또는 비밀번호가 올바르지 않습니다" }, { status: 401 });
  const session = await getSession();
  session.userId = user.id;
  await session.save();
  return NextResponse.json({ ok: true });
}
```

`src/app/api/auth/logout/route.ts`:
```ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST() {
  const session = await getSession();
  session.destroy();
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: 가입/로그인 화면** (두리무역 로그인 화면 벤치: 중앙 카드, 이메일+비밀번호, 링크 상호 이동. 간편 로그인 버튼은 Phase 1 제외 — benchmark-duly.md §1 로그인 참고. 소셜 로그인은 "이번에 안 하는 것")

`src/app/auth/login/page.tsx`:
```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.ok) router.push("/dashboard");
    else setError(data.error);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg">
      <form onSubmit={submit} className="w-full max-w-md bg-surface rounded-[16px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-8 space-y-4">
        <h1 className="text-2xl font-semibold text-heading">고객 로그인</h1>
        <p className="text-sm text-secondary">서비스를 이용하시려면 로그인해주세요</p>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일" className="w-full border border-black/10 rounded-lg px-3 py-2" />
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호" className="w-full border border-black/10 rounded-lg px-3 py-2" />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button type="submit" className="w-full bg-accent text-white font-semibold rounded-[12px] py-3">로그인</button>
        <p className="text-sm text-secondary">처음이신가요? <Link href="/auth/register" className="text-accent font-medium">회원가입</Link></p>
      </form>
    </main>
  );
}
```

`src/app/auth/register/page.tsx` (같은 카드 패턴, 필드: 이메일·비밀번호·담당자명·회사명(선택)·연락처(선택), `/api/auth/register` 호출, 성공 시 `/dashboard`):
```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({ email: "", password: "", contactName: "", companyName: "", phone: "" });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.ok) router.push("/dashboard");
    else setError(data.error);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg">
      <form onSubmit={submit} className="w-full max-w-md bg-surface rounded-[16px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-8 space-y-4">
        <h1 className="text-2xl font-semibold text-heading">회원가입</h1>
        <input type="email" required placeholder="이메일" value={form.email} onChange={set("email")} className="w-full border border-black/10 rounded-lg px-3 py-2" />
        <input type="password" required placeholder="비밀번호 (8자 이상)" value={form.password} onChange={set("password")} className="w-full border border-black/10 rounded-lg px-3 py-2" />
        <input required placeholder="담당자명" value={form.contactName} onChange={set("contactName")} className="w-full border border-black/10 rounded-lg px-3 py-2" />
        <input placeholder="회사명 (선택)" value={form.companyName} onChange={set("companyName")} className="w-full border border-black/10 rounded-lg px-3 py-2" />
        <input placeholder="연락처 (선택)" value={form.phone} onChange={set("phone")} className="w-full border border-black/10 rounded-lg px-3 py-2" />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button type="submit" className="w-full bg-accent text-white font-semibold rounded-[12px] py-3">가입하기</button>
        <p className="text-sm text-secondary">이미 회원이신가요? <Link href="/auth/login" className="text-accent font-medium">로그인</Link></p>
      </form>
    </main>
  );
}
```

- [ ] **Step 3: 수동 확인**

```bash
npm run dev &
sleep 5 && curl -s -X POST localhost:3000/api/auth/register -H 'Content-Type: application/json' -d '{"email":"t@t.com","password":"secret123","contactName":"T"}'
```
Expected: `{"ok":true}`. 이후 dev 서버 종료.

- [ ] **Step 4: 커밋**

```bash
git add -A && git commit -m "feat: 가입·로그인·로그아웃 route와 화면"
```

### Task 5: 주문 서비스 (TDD — 격리 포함)

**Files:**
- Create: `src/lib/orders.ts`, `tests/orders.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/orders.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "../src/lib/db";
import { registerSeller } from "../src/lib/auth";
import { createOrder, listOrdersBySeller } from "../src/lib/orders";

let sellerA: { id: string }, sellerB: { id: string };

beforeEach(async () => {
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
  sellerA = await registerSeller({ email: "a@a.com", password: "password1", contactName: "A" });
  sellerB = await registerSeller({ email: "b@b.com", password: "password1", contactName: "B" });
});

describe("createOrder", () => {
  it("링크·상품명·수량·구분·검수 선택으로 접수되고 상태는 REQUESTED", async () => {
    const o = await createOrder(sellerA.id, {
      productUrl: "https://detail.1688.com/offer/123.html",
      productName: "미니가전", optionText: "화이트", quantity: 100,
      serviceType: "PURCHASE", inspectionRequested: true,
    });
    expect(o.status).toBe("REQUESTED");
    expect(o.inspectionRequested).toBe(true);
  });
  it("수량 1 미만은 거부", async () => {
    await expect(createOrder(sellerA.id, {
      productUrl: "https://x.com", productName: "x", quantity: 0, serviceType: "PURCHASE", inspectionRequested: false,
    })).rejects.toThrow("수량");
  });
  it("URL 형식이 아니면 거부", async () => {
    await expect(createOrder(sellerA.id, {
      productUrl: "not-a-url", productName: "x", quantity: 1, serviceType: "SHIPPING", inspectionRequested: false,
    })).rejects.toThrow("상품 링크");
  });
});

describe("listOrdersBySeller — 데이터 격리(절대 실패 금지)", () => {
  it("셀러 A는 자기 주문만 본다", async () => {
    await createOrder(sellerA.id, { productUrl: "https://a.com", productName: "A상품", quantity: 1, serviceType: "PURCHASE", inspectionRequested: false });
    await createOrder(sellerB.id, { productUrl: "https://b.com", productName: "B상품", quantity: 2, serviceType: "SHIPPING", inspectionRequested: false });
    const listA = await listOrdersBySeller(sellerA.id);
    expect(listA).toHaveLength(1);
    expect(listA[0].productName).toBe("A상품");
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/orders.test.ts`
Expected: FAIL — `createOrder` 미정의.

- [ ] **Step 3: 최소 구현**

`src/lib/orders.ts`:
```ts
import { prisma } from "./db";

export type NewOrder = {
  productUrl: string; productName: string; optionText?: string;
  quantity: number; serviceType: "PURCHASE" | "SHIPPING";
  inspectionRequested: boolean; memo?: string;
};

export async function createOrder(sellerId: string, input: NewOrder) {
  if (!/^https?:\/\/.+/.test(input.productUrl)) throw new Error("상품 링크 형식이 올바르지 않습니다");
  if (!Number.isInteger(input.quantity) || input.quantity < 1) throw new Error("수량은 1 이상이어야 합니다");
  return prisma.order.create({ data: { ...input, sellerId } });
}

export async function listOrdersBySeller(sellerId: string) {
  return prisma.order.findMany({ where: { sellerId }, orderBy: { createdAt: "desc" } });
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run`
Expected: PASS (auth 5 + orders 4 = 9 tests).

- [ ] **Step 5: 커밋**

```bash
git add -A && git commit -m "feat: 주문 접수·목록 서비스 TDD (셀러 격리 포함)"
```

### Task 6: 대시보드 셸 + 주문 화면

**Files:**
- Create: `src/app/dashboard/layout.tsx`, `src/app/dashboard/page.tsx`, `src/app/dashboard/orders/page.tsx`, `src/app/dashboard/orders/new/page.tsx`, `src/app/api/orders/route.ts`

- [ ] **Step 1: orders API route**

`src/app/api/orders/route.ts`:
```ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createOrder, listOrdersBySeller } from "@/lib/orders";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ ok: false, error: "로그인이 필요합니다" }, { status: 401 });
  try {
    const order = await createOrder(session.userId, await req.json());
    return NextResponse.json({ ok: true, order });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 400 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ ok: false, error: "로그인이 필요합니다" }, { status: 401 });
  return NextResponse.json({ ok: true, orders: await listOrdersBySeller(session.userId) });
}
```

- [ ] **Step 2: 대시보드 레이아웃(사이드바 221px, 미로그인 리다이렉트)** — benchmark-duly.md §1 사이드바 구조. Phase 1 활성 메뉴: 마이페이지·주문 접수·내 주문. 나머지 메뉴는 회색 비활성 표기(추후 Phase)

`src/app/dashboard/layout.tsx`:
```tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session.userId) redirect("/auth/login");
  return (
    <div className="min-h-screen flex bg-bg">
      <aside className="w-[221px] shrink-0 bg-surface border-r border-black/5 p-4 space-y-6">
        <Link href="/" className="block font-bold text-brand text-lg">물류</Link>
        <nav className="space-y-4 text-[15px]">
          <div>
            <p className="text-[12px] font-bold uppercase text-muted mb-2">🏠 마이페이지</p>
            <Link href="/dashboard" className="block py-1.5 text-body">마이페이지</Link>
          </div>
          <div>
            <p className="text-[12px] font-bold uppercase text-muted mb-2">🛒 주문</p>
            <Link href="/dashboard/orders/new" className="block py-1.5 text-body">주문 접수</Link>
            <Link href="/dashboard/orders" className="block py-1.5 text-body">내 주문</Link>
          </div>
          <div>
            <p className="text-[12px] font-bold uppercase text-muted mb-2">📦 배송대행</p>
            <span className="block py-1.5 text-muted/50">입고 관리 (준비 중)</span>
            <span className="block py-1.5 text-muted/50">견적 (준비 중)</span>
          </div>
        </nav>
        <form action="/api/auth/logout" method="post"><button className="text-sm text-muted">로그아웃</button></form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: 대시보드 홈(현황 카드)** — 두리무역 "구매대행 진행 현황" 카드 패턴(제목+n건+상태 칩), Phase 1은 접수됨 1칩만

`src/app/dashboard/page.tsx`:
```tsx
import Link from "next/link";
import { getSession } from "@/lib/session";
import { listOrdersBySeller } from "@/lib/orders";

export default async function DashboardHome() {
  const session = await getSession();
  const orders = await listOrdersBySeller(session.userId!);
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-heading">마이페이지</h1>
      <section className="bg-surface rounded-[27px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[14px] font-semibold text-heading">주문 진행 현황 <span className="ml-1 rounded-full bg-warning-tint text-brand text-xs px-2 py-0.5">{orders.length}건</span></h2>
          <Link href="/dashboard/orders" className="text-brand text-sm font-medium">전체보기</Link>
        </div>
        <div className="flex gap-3">
          <div className="rounded-[22.5px] bg-warning-tint/60 px-6 py-4 text-center">
            <p className="text-[12.8px] text-muted">접수됨</p>
            <p className="text-lg font-semibold text-accent">{orders.filter(o => o.status === "REQUESTED").length}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: 주문 접수 폼** — 필드: 상품 링크·상품명·옵션·수량·구분(구매/배송대행)·**유료 검수 신청 체크(요금 안내 문구 포함)**·메모. 검수 경계 문구는 고객 피해 방지 기준(00 §3)이므로 반드시 노출

`src/app/dashboard/orders/new/page.tsx`:
```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewOrderPage() {
  const [form, setForm] = useState({ productUrl: "", productName: "", optionText: "", quantity: 1, serviceType: "PURCHASE", inspectionRequested: false, memo: "" });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, quantity: Number(form.quantity) }) });
    const data = await res.json();
    if (data.ok) router.push("/dashboard/orders");
    else setError(data.error);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-heading">주문 접수</h1>
      <form onSubmit={submit} className="bg-surface rounded-[27px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-6 space-y-4">
        <label className="block text-sm text-secondary">상품 링크
          <input required value={form.productUrl} onChange={(e) => setForm({ ...form, productUrl: e.target.value })} placeholder="https://detail.1688.com/offer/..." className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
        </label>
        <label className="block text-sm text-secondary">상품명
          <input required value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm text-secondary">옵션
            <input value={form.optionText} onChange={(e) => setForm({ ...form, optionText: e.target.value })} className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
          </label>
          <label className="block text-sm text-secondary">수량
            <input type="number" min={1} required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
          </label>
        </div>
        <fieldset className="text-sm text-secondary space-x-4">
          <label><input type="radio" checked={form.serviceType === "PURCHASE"} onChange={() => setForm({ ...form, serviceType: "PURCHASE" })} /> 구매대행 (수수료 5% + VAT)</label>
          <label><input type="radio" checked={form.serviceType === "SHIPPING"} onChange={() => setForm({ ...form, serviceType: "SHIPPING" })} /> 배송대행 (수수료 0%)</label>
        </fieldset>
        <div className="rounded-lg bg-surface-alt p-4 text-sm">
          <label className="font-medium text-body"><input type="checkbox" checked={form.inspectionRequested} onChange={(e) => setForm({ ...form, inspectionRequested: e.target.checked })} /> 유료 검수 신청 (수량·외관·하자 확인)</label>
          <p className="mt-1 text-muted">기본 제공(무료): 입고 사진 1~2장 + 외포장 이상 안내. 수량·외관·하자 확인은 유료 검수를 신청한 건에만 제공됩니다.</p>
        </div>
        <label className="block text-sm text-secondary">요청 메모 (선택)
          <textarea value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
        </label>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button type="submit" className="bg-accent text-white font-semibold rounded-[12px] px-6 py-3">접수하기</button>
      </form>
    </div>
  );
}
```

- [ ] **Step 5: 내 주문 목록** — 상태 칩 + 빈 상태 문구(두리무역 패턴) + **검수 미신청 건 "수량 미확인" 배지**

`src/app/dashboard/orders/page.tsx`:
```tsx
import Link from "next/link";
import { getSession } from "@/lib/session";
import { listOrdersBySeller } from "@/lib/orders";

const STATUS_LABEL: Record<string, string> = { REQUESTED: "접수됨" };

export default async function OrdersPage() {
  const session = await getSession();
  const orders = await listOrdersBySeller(session.userId!);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-heading">내 주문</h1>
        <Link href="/dashboard/orders/new" className="bg-accent text-white text-sm font-semibold rounded-[12px] px-4 py-2">주문 접수</Link>
      </div>
      {orders.length === 0 ? (
        <div className="bg-surface rounded-[27px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-12 text-center text-muted">
          해당 상태의 주문이 없습니다. <Link href="/dashboard/orders/new" className="text-accent font-medium">첫 주문을 접수해 보세요</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="bg-surface rounded-[16px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-body">{o.productName} <span className="text-muted">× {o.quantity}</span></p>
                <p className="text-sm text-muted">{o.serviceType === "PURCHASE" ? "구매대행" : "배송대행"} · {new Date(o.createdAt).toLocaleDateString("ko-KR")}</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {o.inspectionRequested
                  ? <span className="rounded-full bg-success-tint text-success px-2 py-1">유료 검수 신청됨</span>
                  : <span className="rounded-full bg-surface-alt text-muted px-2 py-1">수량 미확인 (검수 미신청)</span>}
                <span className="rounded-full bg-warning-tint text-accent px-2 py-1">{STATUS_LABEL[o.status] ?? o.status}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 6: 빌드·테스트 확인 후 커밋**

```bash
npm run build && npx vitest run
git add -A && git commit -m "feat: 대시보드 셸·주문 접수·내 주문 목록"
```

### Task 7: 랜딩 페이지 (두리무역 외관 벤치)

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: 랜딩 구현** — benchmark-duly.md §5 랜딩 구성 순서 따름(히어로 2줄 제목+둘째 줄 accent, CTA, 신뢰 뱃지 3, 서비스 소개 3카드, 검수 정책 안내, 푸터). 카피는 우리 서비스 문구로 새로 쓴다(두리무역 원문 복제 금지). 히어로 제목은 데스크톱 72~96px 반응형

```tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-bg text-body">
      <header className="sticky top-0 bg-white/90 backdrop-blur border-b border-black/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <span className="font-bold text-brand text-lg">물류</span>
          <nav className="flex items-center gap-6 text-sm text-[#666666]">
            <Link href="/auth/login">로그인</Link>
            <Link href="/auth/register" className="bg-accent text-white font-semibold rounded-[12px] px-4 py-2">무료 가입하기</Link>
          </nav>
        </div>
      </header>
      <section className="max-w-6xl mx-auto px-6 py-24">
        <h1 className="text-[56px] md:text-[96px] leading-none font-semibold text-heading">
          중국 소싱 물류,<br /><span className="text-accent">투명하게.</span>
        </h1>
        <p className="mt-6 text-lg text-secondary">주문 접수부터 입고 확인, 항목별 견적까지. 사업자 셀러를 위한 중국→한국 통합 물류.</p>
        <div className="mt-8 flex gap-4">
          <Link href="/auth/register" className="bg-accent text-white text-lg font-semibold rounded-[12px] px-8 py-4">무료 가입하기</Link>
          <Link href="/auth/login" className="text-heading text-lg font-semibold px-4 py-4">로그인 →</Link>
        </div>
        <ul className="mt-10 flex gap-6 text-sm text-secondary">
          <li>✓ 입고 사진 기본 제공</li>
          <li>✓ 항목별 투명 견적</li>
          <li>✓ 사업자 셀러 전용</li>
        </ul>
      </section>
      <section className="bg-surface border-t border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">
          {[
            ["주문 접수", "상품 링크와 수량만 입력하면 접수 완료. 구매대행·배송대행 중 선택합니다."],
            ["입고 확인", "중국 창고 도착 시 입고 사진 1~2장과 외포장 이상 여부를 기본 제공합니다. 수량·외관·하자 확인은 유료 검수 옵션입니다."],
            ["투명 견적", "상품가, 수수료, 검수비, 예상 국제운임을 항목별로 보여드립니다. 숨은 비용이 없습니다."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-[16px] bg-bg p-6">
              <h3 className="font-semibold text-heading mb-2">{t}</h3>
              <p className="text-sm text-secondary">{d}</p>
            </div>
          ))}
        </div>
      </section>
      <footer className="max-w-6xl mx-auto px-6 py-10 text-xs text-muted">
        © 2026 물류. 요율·검수 정책은 서비스 준비 중 기준이며 변경될 수 있습니다.
      </footer>
    </main>
  );
}
```

- [ ] **Step 2: 빌드 확인 후 커밋**

```bash
npm run build
git add -A && git commit -m "feat: 랜딩 페이지 (두리무역 외관 벤치마킹)"
```

### Task 8: 마무리 검증

- [ ] **Step 1: 전체 테스트·빌드**

Run: `npx vitest run && npm run build`
Expected: 테스트 9개 전체 PASS, 빌드 오류 0.

- [ ] **Step 2: design lint**

Run: `npx -y @google/design.md lint .harness/dubyeol2/design-system.md`
Expected: errors 0.

- [ ] **Step 3: 커밋**

```bash
git add -A && git commit -m "chore: Phase 1 마무리 검증"
```

---

## Self-Review 결과

- 스펙 커버리지: 00 §5 Phase 1 완료 기준(가입→접수→목록·격리) ↔ Task 3~6. 외관 벤치 ↔ Task 1(토큰)·7(랜딩). 검수 경계 문구 ↔ Task 6 Step 4·5. — 갭 없음
- 플레이스홀더: 없음 (모든 코드 스텝에 실제 코드 포함)
- 타입 일관성: `NewOrder`·`SessionData`·라우트 응답 `{ok, error?}` 통일 확인
- Machine Check(별도, Team Leader 수행): Playwright로 QA 시나리오(가입→접수→목록, 격리) + 인증 도입이므로 `/security-review` 실행
