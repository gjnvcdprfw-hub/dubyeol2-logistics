# Phase 9 Implementation Plan

상태: Team Leader 작성 완료 (2026-07-06). Superpowers: `superpowers:writing-plans`

이 파일은 Team Leader가 `superpowers:writing-plans`로 작성한 구현 계획의 두별2 연결 문서다. 원본 계획은 `docs/superpowers/plans/2026-07-06-phase-009-sku-lines.md`에 둔다.

## 1. 원본 Superpowers Plan

- 원본 계획: `docs/superpowers/plans/2026-07-06-phase-009-sku-lines.md`
- 목표: 현재 주문 1건 한 줄 구조를 주문 묶음 -> 상품 라인 -> SKU 라인 구조로 바꿔 SKU별 작업·정산 근거를 남긴다.
- 구현 방식: 기존 `Order`는 주문 묶음으로 유지하고, `OrderProductLine`, `OrderSkuLine`을 추가해 기존 Phase 1~7 화면과 테스트가 호환되도록 한다.

## 2. Builder Task 요약

| Builder Task | 고객에게 생기는 변화 | 완료 기준 | 주요 파일 | 상태 |
|---|---|---|---|---|
| Task 1 — 데이터 모델·주문 정규화 | 한 주문 묶음 안에 상품 라인과 SKU 라인이 생긴다 | 기존 단건 주문은 SKU 1개짜리 주문으로 호환되고, 새 주문은 SKU 여러 개를 저장한다 | `prisma/schema.prisma`, `src/lib/order-lines.ts`, `src/lib/orders.ts`, `tests/orders.test.ts` | 준비 전 |
| Task 2 — SKU별 입고·검수 | 운영자가 SKU별 입고수량, 부족수량, 하자수량, 검수결과를 기록한다 | 빨강 50개 정상, 파랑 45개 입고/5개 부족 같은 결과가 SKU별로 남는다 | `src/lib/inbound.ts`, `src/app/api/admin/inbound/route.ts`, `src/app/admin/orders/[id]/page.tsx`, `tests/inbound.test.ts` | 준비 전 |
| Task 3 — SKU별 견적·정산 근거 | 셀러가 SKU별 상품가·수량·검수비·중국배송비 근거와 주문 묶음 합계를 본다 | SKU별 단가가 다른 경우에도 정산 근거가 주문 전체 한 줄로 뭉치지 않는다 | `src/lib/sku-quote.ts`, `src/app/api/admin/quote/route.ts`, `src/app/admin/orders/[id]/quote/page.tsx`, `src/app/dashboard/orders/[id]/page.tsx`, `tests/quote.test.ts` | 준비 전 |
| Task 4 — 셀러 다중 SKU 입력·회귀 검증 | 셀러가 여러 상품/SKU를 한 주문 묶음으로 접수한다 | 전체 테스트, build, `git diff --check`가 통과한다 | `src/app/dashboard/orders/new/page.tsx`, `src/app/dashboard/orders/page.tsx`, `src/app/dashboard/inbound/page.tsx` | 준비 전 |

## 3. 이번 Phase에서 하지 않는 것

- 포장단위 마커
- 박스별 무게/CBM
- 패킹리스트 생성
- 실송장 발급
- 예치금 충전
- 출고 상태 추적
- 장바구니·내상품·스마트오더
- 1688 외부 연동
- 정식 운영 전환

## 4. 검증 기준

- `npx vitest run`
- `npm run build`
- `git diff --check`
- UI가 있는 변경이므로 로컬 앱에서 주문 접수 -> 운영자 입고/검수 -> 운영자 견적 -> 셀러 주문 상세까지 실제 한 건을 확인한다.
- 다른 셀러의 SKU 데이터가 보이지 않는지 확인한다.

## 5. 다음 단계

- `superpowers:subagent-driven-development`로 Builder 서브에이전트에게 Task 1부터 배정한다.
- Task별 완료 후 Team Leader가 산출물을 수집하고 검토한다.
- 전체 Task 완료 후 Machine Check 결과를 `03-verification.md`에 작성한다.
