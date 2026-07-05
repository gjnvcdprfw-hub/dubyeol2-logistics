Status: done

Changed files:
- `src/lib/inbound.ts`
- `src/app/api/admin/inbound/route.ts`
- `src/app/admin/orders/[id]/page.tsx`
- `tests/inbound.test.ts`

Commit hash: `90583ad`

RED evidence:
- Command: `npx vitest run tests/inbound.test.ts`
- Result: failed
- Key failure:
  - `tests/inbound.test.ts > recordInbound > SKU별 입고·부족·하자 수량을 기록한다`
  - `Error: 유료 검수 신청 건은 검수 결과를 함께 기록해야 합니다`

GREEN evidence:
- Command: `npx vitest run tests/inbound.test.ts`
- Result: passed
- Summary: `Test Files 1 passed (1), Tests 9 passed (9)`

Verification commands:
- `npx vitest run tests/inbound.test.ts`
- `npm run build`
- `git diff --check`

Verification results:
- `npx vitest run tests/inbound.test.ts` -> pass
- `npm run build` -> pass
- `git diff --check` -> pass

Concerns:
- 관리자 입고 화면은 SKU 라인이 있는 주문에서 SKU별 검수 입력을 우선 사용하고, 기존 집계 검수 입력은 SKU 라인이 없는 legacy 주문 fallback으로만 남겼다.
- route는 `sku[index][...]` 필드가 있을 때만 `skuResults`를 넘긴다.

## Fix After Task Review

- Status: done
- Commit hash: `e8e282e`

### RED evidence

- Command: `npx vitest run tests/inbound.test.ts`
- Result: failed
- Key failures:
  - `검수 미신청 SKU 주문에 SKU 검수 결과를 넣으면 거부한다`
  - `유료 검수 SKU 주문에 중복 SKU ID를 넣으면 거부한다`

### GREEN evidence

- Command: `npx vitest run tests/inbound.test.ts`
- Result: passed
- Summary: `Test Files 1 passed (1), Tests 11 passed (11)`

### Verification commands

- `npx vitest run tests/inbound.test.ts`
- `npm run build`
- `git diff --check`

### Verification results

- `npx vitest run tests/inbound.test.ts` -> pass
- `npm run build` -> pass
- `git diff --check` -> pass

### Concerns

- 관리자 입고 화면은 검수 미신청 주문에서 SKU별 수량/하자/통과/메모 입력을 숨기고, 사진과 외포장 상태만 기록한다는 안내만 보여준다.
- `recordInbound()`는 직접 요청이 들어와도 검수 미신청 주문의 `skuResults`를 거부하고, 유료 검수 주문에서는 중복 SKU ID를 막아 전체 SKU ID 집합 일치를 강제한다.
