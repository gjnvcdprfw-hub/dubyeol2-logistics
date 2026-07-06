status: DONE

changed files:
- prisma/schema.prisma
- prisma/migrations/20260705232433_order_sku_lines/migration.sql
- src/lib/order-lines.ts
- src/lib/orders.ts
- tests/orders.test.ts

commit hash: 60e6f3d41d9f1d0d5c1bc4a64eaec5640bfa05ed

tests run and exact result:
- npx vitest run tests/orders.test.ts (RED): exit 1; 1 failed file; 2 failed, 7 passed. Expected missing SKU line support.
- npx vitest run tests/orders.test.ts: exit 0; 1 passed file; 9 passed.
- npm run build: exit 0; Next.js compiled successfully and TypeScript finished successfully.
- git diff --check: exit 0; no output.
- git diff --cached --check: exit 0; no output before commit.

concerns:
- None for Task 1 scope.

## Fix — 2026-07-06

- status: DONE
- commit hash: c249066
- RED evidence:
  - `npx vitest run tests/orders.test.ts`
  - exit 1; `tests/orders.test.ts` 2 failed, 9 passed
  - failure 1: `items: []` expected `"상품을 1개 이상 입력해 주세요"`, received `"상품 링크 형식이 올바르지 않습니다"`
  - failure 2: whitespace-only SKU option expected `"기본"`, received `""`
- GREEN evidence:
  - `npx vitest run tests/orders.test.ts`
  - exit 0; `tests/orders.test.ts` 11 passed
- verification commands:
  - `npx vitest run tests/orders.test.ts` -> exit 0
  - `npm run build` -> exit 0
  - `git diff --check` -> exit 0
- concerns:
  - None for this fix scope.
