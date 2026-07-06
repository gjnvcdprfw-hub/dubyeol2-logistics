# Phase 9 Review Fix Report

## 범위

- 목표: Phase 9 전체 리뷰에서 나온 SKU/정산/입고 경계 blocking gaps 해소.
- 고객 결과: 상품/SKU마다 작업·검수·견적 근거가 갈라지고, 출고요청 차감액과 셀러 화면의 SKU 근거가 서로 모순되지 않는다.
- 금지선 준수: 원격 push/deploy 없음. 파일 삭제 없음. secret 출력 없음. schema migration 없음.

## 핵심 판단

1. SKU 견적 금액 누락/공백은 `Number(null) === 0`, `Number("") === 0` 경계 때문에 저장 전 필드 존재와 공백을 직접 검증하도록 수정했다.
2. SKU별 상품가 합계가 주문 수량으로 나누어떨어지지 않는 경우, 주문 단가 반올림값을 정산 source of truth로 쓰면 상품가·수수료·VAT·출고 차감액이 갈라진다. `productLines.skuLines`의 quote fields가 완성된 주문은 SKU 합산 상품가와 중국배송비를 `computeQuote`에 넘겨 같은 산식으로 계산한다.
3. 반올림 차이를 중국배송비로 숨기지 않았다. 상품가 정확 합계를 `productTotalFen`으로 분리해 수수료와 VAT 기준도 SKU 근거 상품가를 따른다.
4. 입고 사진 잔재 문제는 파일 삭제 없이 해결했다. `saveInboundPhoto` 전에 주문 상태, SKU ID, SKU 수량/하자 수량, SKU 전체 제출 여부를 검증한다.
5. 셀러 주문 상세의 SKU 작업 현황에 검수 합격/보류와 검수 메모를 표시하고, 견적 블록 합계 문구를 `SKU 근거 합계`로 바꿨다.

## 변경 파일

- `src/app/api/admin/quote/route.ts`
- `src/lib/quote.ts`
- `src/lib/sku-quote.ts`
- `src/lib/wallet.ts`
- `src/lib/order-lines.ts`
- `src/app/api/admin/inbound/route.ts`
- `src/app/dashboard/orders/[id]/page.tsx`
- `tests/quote.test.ts`
- `tests/orders.test.ts`
- `tests/inbound.test.ts`
- `tests/wallet.test.ts`
- `.superpowers/sdd/phase-009-review-fix-report.md`

## TDD 증거

- RED: `npx vitest run tests/quote.test.ts tests/orders.test.ts tests/inbound.test.ts tests/wallet.test.ts`
  - 결과: 10 failed, 52 passed.
  - 실패 항목: SKU 금액 누락/공백, exact SKU 상품가 미사용, malformed order input, 입고 저장 선행, 셀러 상세 검수/문구 누락.
- GREEN: `npx vitest run tests/quote.test.ts tests/orders.test.ts tests/inbound.test.ts tests/wallet.test.ts`
  - 결과: 4 files passed, 62 tests passed.

## 최종 검증

- `npx vitest run tests/quote.test.ts tests/orders.test.ts tests/inbound.test.ts tests/wallet.test.ts`
  - PASS: 4 files, 62 tests.
- `npx vitest run`
  - PASS: 6 files, 73 tests.
- `npm run build`
  - PASS: Next.js production build and TypeScript.
- `git diff --check`
  - PASS.

## 남은 위험

- SKU 견적이 없는 legacy 주문은 기존 주문 단가 기반 산식을 계속 사용한다. 이번 수정은 Phase 9 SKU quote fields가 완성된 주문의 모순 해소가 범위다.
- 관리자 입고 라우트와 `recordInbound`에 일부 검증 로직 중복이 생겼다. 파일 저장 전 검증을 위해 의도한 중복이며, 이후 공용 dry-run validator로 정리할 수 있다.
