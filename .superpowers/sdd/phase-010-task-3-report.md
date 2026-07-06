status: DONE

changed files
- src/app/api/admin/wallet-topups/[id]/approve/route.ts
- src/app/api/admin/wallet-topups/[id]/reject/route.ts
- src/app/admin/wallet-topups/page.tsx
- src/app/admin/layout.tsx
- tests/wallet-topups.test.ts

commit hash
- `6e3c80b`

RED evidence
- command: `npx vitest run tests/wallet-topups.test.ts`
- exact result:
  - `3 failed | 10 passed (13)`
  - failure: `Cannot find module '/src/app/api/admin/wallet-topups/[id]/approve/route'`
  - failure: `Cannot find module '/src/app/api/admin/wallet-topups/[id]/reject/route'`

GREEN evidence
- command: `npx vitest run tests/wallet-topups.test.ts tests/wallet.test.ts`
- exact result:
  - `Test Files  2 passed (2)`
  - `Tests  24 passed (24)`

verification commands and exact results
- `npx vitest run tests/wallet-topups.test.ts`
  - exit code: 1
  - `3 failed | 10 passed (13)`
- `npx vitest run tests/wallet-topups.test.ts tests/wallet.test.ts`
  - exit code: 0
  - `Test Files  2 passed (2)`
  - `Tests  24 passed (24)`
- `npm run build`
  - exit code: 0
  - `Compiled successfully`
  - `Finished TypeScript`
  - `Route (app)` includes `/admin/wallet-topups`, `/api/admin/wallet-topups/[id]/approve`, `/api/admin/wallet-topups/[id]/reject`
- `git diff --check`
  - exit code: 0
  - no output

concerns
- admin queue page는 server component 기준 확인만 했고, 브라우저 실화면 QA는 이 Task 범위에서 별도 수행하지 않았습니다.

---

fix status
- DONE

commit hash
- `c4422ea`

RED evidence
- added regression: `tests/wallet-topups.test.ts` 동시 승인 회귀 테스트
- command: `npx vitest run tests/wallet-topups.test.ts`
- exact result:
  - `Test Files  1 failed (1)`
  - `Tests  1 failed | 13 passed (14)`
  - failure: `AssertionError: expected 250000 to be 350000`
  - failing assertion: `expect(Math.max(...balances)).toBe(350000)`

GREEN evidence
- command: `npx vitest run tests/wallet-topups.test.ts tests/wallet.test.ts`
  - `Test Files  2 passed (2)`
  - `Tests  25 passed (25)`
- command: `npx vitest run`
  - `Test Files  7 passed (7)`
  - `Tests  95 passed (95)`
- command: `npm run build`
  - `Compiled successfully`
  - `Finished TypeScript`

Verification commands/results
- `npx prisma migrate dev --create-only --name wallet_balance_krw`
  - exit code: 0
  - created migration `20260706014231_wallet_balance_krw`
- `npx prisma migrate dev`
  - exit code: 0
  - applied migration `20260706014231_wallet_balance_krw`
  - `Generated Prisma Client (v6.19.3)`
- `npx vitest run tests/wallet-topups.test.ts`
  - exit code: 1 before fix
  - `Tests  1 failed | 13 passed (14)`
- `npx vitest run tests/wallet-topups.test.ts tests/wallet.test.ts`
  - exit code: 0 after fix
  - `Tests  25 passed (25)`
- `npx vitest run`
  - exit code: 0
  - `Tests  95 passed (95)`
- `npm run build`
  - exit code: 0
  - `Compiled successfully`
- `git diff --check -- prisma/schema.prisma prisma/migrations/20260706014231_wallet_balance_krw/migration.sql src/lib/wallet.ts src/lib/wallet-topups.ts tests/wallet-topups.test.ts tests/wallet.test.ts`
  - exit code: 0
  - no output

Concerns
- SQLite 실DB 경로에서는 쓰기 직렬화 때문에 단순 `Promise.all()`만으로는 stale snapshot이 바로 드러나지 않았습니다. 회귀 테스트는 같은 공개 도메인 함수 호출을 유지한 채 `$transaction` 스케줄을 제어해 pre-fix 취약 경로를 고정 재현합니다.
