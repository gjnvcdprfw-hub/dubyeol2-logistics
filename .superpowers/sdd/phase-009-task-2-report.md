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
- Commit hash: `07d0da7`

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

## Fix After Second Task Review

- Status: done
- Commit hash: `2edcbb0`

### RED evidence

- Command: `npx vitest run tests/inbound.test.ts`
- Result: failed
- Key failure:
  - `유료 검수 SKU 주문은 SKU 검수 결과 없이 집계 검수만 넣으면 거부한다`
  - `AssertionError: promise resolved instead of rejecting`

### GREEN evidence

- Command: `npx vitest run tests/inbound.test.ts`
- Result: passed
- Summary: `Test Files 1 passed (1), Tests 13 passed (13)`

### Verification commands

- `npx vitest run tests/inbound.test.ts`
- `npm run build`
- `git diff --check`

### Verification results

- `npx vitest run tests/inbound.test.ts` -> pass
- `npm run build` -> pass
- `git diff --check` -> pass

### Concerns

- 이 코드베이스의 신규 주문은 기본 SKU row 1개도 함께 생성되므로, aggregate inspection fallback은 실제 legacy 상태처럼 `skuLines`가 없는 주문에서만 열리게 제한했다.
- route의 SKU `defectCount` 파싱은 더 이상 누락값을 `0`으로 보정하지 않고 `NaN`을 그대로 넘겨 `recordInbound()`의 SKU 수량 검증에서 `ValidationError`가 나도록 맞췄다.

## Fix After Third Task Review

- Status: done
- Commit hash: `pending final commit; see concerns`

### RED evidence

- Command: `npx vitest run tests/inbound.test.ts`
- Result: failed
- Key failure:
  - `tests/inbound.test.ts > admin inbound route > SKU 입고 수량 필드가 누락되면 400으로 거부한다`
  - `AssertionError: expected 303 to be 400`

### GREEN evidence

- Command: `npx vitest run tests/inbound.test.ts`
- Result: passed
- Summary: `Test Files 1 passed (1), Tests 14 passed (14)`

### Verification commands

- `npx vitest run tests/inbound.test.ts`
- `npm run build`
- `git diff --check`

### Verification results

- `npx vitest run tests/inbound.test.ts` -> pass
- `npm run build` -> pass
- `git diff --check` -> pass

### Concerns

- 이 보고서 파일 자체를 포함해 한 번에 커밋하므로, 이 섹션 안에 최종 커밋 hash를 미리 박으면 self-reference가 된다. 같은 이유로 hash를 맞추려고 커밋을 반복 수정하지 않았다.
- 이번 수정은 route에서 `sku[index][inboundQuantity]`, `sku[index][defectCount]`의 `form.has(...)`를 먼저 검사해 누락 필드를 `0`처럼 처리하지 않도록 막는 최소 범위 변경이다.
