status: DONE

files changed:
- prisma/schema.prisma
- prisma/migrations/20260706024316_shipment_packages/migration.sql
- src/lib/order-lines.ts
- src/lib/shipment-packages.ts
- tests/shipment-packages.test.ts

commit hash:
- 65f8709a31fcb4c3b420613e4a801d87bea99324

exact commands run and pass/fail output summary:
1. `sed -n '1,240p' /Users/twostars/.codex/plugins/cache/superpowers-marketplace/superpowers/6.1.1/skills/using-superpowers/SKILL.md`
   - PASS: Builder subtask 상황에서 skill precedence 확인.
2. `sed -n '1,240p' /Users/twostars/.codex/plugins/cache/superpowers-marketplace/superpowers/6.1.1/skills/test-driven-development/SKILL.md`
   - PASS: RED -> GREEN 순서 확인.
3. `sed -n '1,240p' /Users/twostars/.codex/plugins/cache/superpowers-marketplace/superpowers/6.1.1/skills/verification-before-completion/SKILL.md`
   - PASS: 완료 전 신선한 검증 요구 확인.
4. `sed -n '1,260p' /Users/twostars/.codex/plugins/cache/superpowers-marketplace/superpowers/6.1.1/skills/brainstorming/SKILL.md`
   - PASS: brief 우선의 좁은 구현 범위 확인.
5. `sed -n '1,260p' .superpowers/sdd/phase-011-task-1-brief.md`
   - PASS: Task 1 exact values 확인.
6. `git status --short`
   - PASS: 기존 dirty 파일 분리 확인.
7. `rg --files prisma src tests .superpowers/sdd | rg 'schema\\.prisma|order-lines\\.ts|shipment-packages|phase-011-task-1'`
   - PASS: 대상 파일 존재/부재 확인.
8. `git branch --show-current`
   - PASS: `phase-011-shipment-packages`.
9. `sed -n '1,260p' src/lib/order-lines.ts`
   - PASS: include 패턴 확인.
10. `sed -n '1,260p' prisma/schema.prisma`
    - PASS: Prisma 모델 구조 확인.
11. `rg -n "requestShipmentWithWallet|SHIPMENT_REQUESTED|createShipmentRequestedSkuOrder|firstSku|createQuotedOrderWithoutShipmentRequest|sellerA|sellerB" tests src`
    - PASS: 유사 테스트 및 도메인 경로 확인.
12. `sed -n '261,520p' .superpowers/sdd/phase-011-task-1-brief.md`
    - PASS: 구현 예시와 commit 규칙 확인.
13. `sed -n '1,260p' tests/wallet.test.ts`
    - PASS: 테스트 fixture 패턴 확인.
14. `sed -n '1,260p' src/lib/wallet.ts`
    - PASS: 출고 요청 상태 전환 로직 확인.
15. `rg -n "function registerSeller|const registerSeller|function createOrder|const createOrder|resetDb|beforeEach|prisma\\." tests src/lib`
    - PASS: 공통 helper 위치 확인.
16. `sed -n '1,260p' src/lib/orders.ts`
    - PASS: 주문 생성 include 구조 확인.
17. `sed -n '1,260p' src/lib/inbound.ts`
    - PASS: inbound/inspection validation 확인.
18. `sed -n '1,260p' src/lib/auth.ts`
    - PASS: seller fixture 생성 방식 확인.
19. `sed -n '1,260p' src/lib/sku-quote.ts`
    - PASS: quoted order 계산 fallback 확인.
20. `sed -n '1,260p' src/lib/quote.ts`
    - PASS: quote weight/volume validation 확인.
21. `npx vitest run tests/shipment-packages.test.ts`
    - FAIL(expected RED): `Cannot find module '../src/lib/shipment-packages'`.
22. `npx prisma migrate dev --name shipment_packages`
    - PASS: migration `20260706024316_shipment_packages` 생성 및 Prisma Client regenerate 완료.
23. `npx vitest run tests/shipment-packages.test.ts`
    - PASS: `Test Files  1 passed (1)`, `Tests  6 passed (6)`.
24. `git diff -- prisma/schema.prisma src/lib/order-lines.ts src/lib/shipment-packages.ts tests/shipment-packages.test.ts prisma/migrations/20260706024316_shipment_packages/migration.sql`
    - PASS: Task 1 diff만 검토.
25. `git add prisma/schema.prisma prisma/migrations/20260706024316_shipment_packages/migration.sql src/lib/order-lines.ts src/lib/shipment-packages.ts tests/shipment-packages.test.ts`
    - PASS: 지정 파일만 staging.
26. `git commit -m "feat: add shipment package domain"`
    - PASS: commit `65f8709a31fcb4c3b420613e4a801d87bea99324`.
27. `git rev-parse HEAD`
    - PASS: commit hash 확인.
28. `git show --stat --oneline --no-patch HEAD`
    - PASS: latest commit title 확인.

self-review notes:
- brief에 적힌 함수명, 상태값, 단위 변환(weightKg -> grams, volumeCbm -> cm3)을 그대로 반영했다.
- 테스트는 출고 요청 상태 게이트, 출고 가능 수량 초과 차단, seller/admin 조회 경계를 모두 포함한다.
- `orderWithLines.ts`에는 패키지 포함 조회 상수를 추가해 admin 상세 조회에서 재사용했다.
- 기존 dirty 파일은 staging/commit 하지 않았다.

concerns:
- 없음.

## fix review loop 1

- scope:
  - added regression coverage in `tests/shipment-packages.test.ts` for "same marker replacement" so `BOX-1` re-save must replace prior SKU composition instead of appending.
  - no source/domain file changes were needed because the new regression test passed against current implementation.

- commands:
  1. `npx vitest run tests/shipment-packages.test.ts`
     - PASS: `Test Files  1 passed (1)`, `Tests  7 passed (7)`.
     - Added assertion coverage for marker reuse updating status/weight/volume/memo and replacing old `ShipmentPackageItem` rows.
  2. `npx vitest run tests/orders.test.ts tests/wallet.test.ts tests/wallet-topups.test.ts tests/quote.test.ts tests/inbound.test.ts`
     - FAIL: `tests/wallet-topups.test.ts` beforeEach hits FK error at `prisma.order.deleteMany()` when run after prior suites in the same command.
     - Evidence: combined run result was `Test Files  1 failed | 4 passed (5)`, `Tests  15 failed | 70 passed (85)`.
  3. `npx vitest run tests/orders.test.ts`
     - PASS: `19 passed`.
  4. `npx vitest run tests/wallet.test.ts`
     - PASS: `11 passed`.
  5. `npx vitest run tests/wallet-topups.test.ts`
     - PASS: `15 passed`.
  6. `npx vitest run tests/quote.test.ts`
     - PASS: `19 passed`.
  7. `npx vitest run tests/inbound.test.ts`
     - PASS: `21 passed`.

- results:
  - same-marker replacement regression is now covered and green.
  - existing order / wallet / wallet-topups / quote / inbound suites still pass in isolation after the shipment package schema/domain change.
  - the required combined multi-file vitest command is still unstable because `tests/wallet-topups.test.ts` cleanup assumes prior suites left no dependent order rows; this is outside the allowed edit scope for this fixer loop.

- commit hash:
  - final fix commit is the current `HEAD` for `test: cover shipment package replacement`

- self-review:
  - the new regression test checks the exact reviewer concern: same marker, changed composition, changed status, changed measurements, changed memo, and no stale SKU item left behind.
  - I kept the change surgical: only `tests/shipment-packages.test.ts` plus this report file changed.
  - I did not change source code because the replacement behavior already works and the new test did not expose a domain failure.
