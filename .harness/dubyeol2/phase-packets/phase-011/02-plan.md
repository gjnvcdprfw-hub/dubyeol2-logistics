# Phase 11 Implementation Plan

상태: Team Leader 작성 완료 (2026-07-06). Superpowers: `superpowers:writing-plans`

이 파일은 Team Leader가 `superpowers:writing-plans`로 작성한 구현 계획의 두별2 연결 문서다. 원본 계획은 `docs/superpowers/plans/2026-07-06-phase-011-shipment-packages.md`에 둔다.

## 1. 원본 Superpowers Plan

- 원본 계획: `docs/superpowers/plans/2026-07-06-phase-011-shipment-packages.md`
- 목표: 운영자가 출고요청 주문의 SKU를 BOX-1/BOX-2 같은 포장단위로 나누고, 셀러가 같은 박스별 구성·무게·CBM·상태를 확인한다.
- 구현 방식: `Order` 아래에 포장단위 기록을 두고, 각 포장단위가 `OrderSkuLine`별 수량을 가진다. 저장 시 출고요청 상태, 주문 소속 SKU, SKU별 출고 가능 수량 초과 여부를 검증한다.

## 2. Builder Task 요약

| Builder Task | 고객에게 생기는 변화 | 완료 기준 | 주요 파일 | 상태 |
|---|---|---|---|---|
| Task 1 — 포장단위 모델·도메인 | 출고요청 주문에 박스별 SKU 구성, 무게, CBM, 상태가 데이터로 남는다 | 출고요청 주문만 저장 가능, SKU 총 배정량 초과 거부, 셀러별 조회 격리 | `prisma/schema.prisma`, `src/lib/order-lines.ts`, `src/lib/shipment-packages.ts`, `tests/shipment-packages.test.ts` | 준비 |
| Task 2 — 운영자 출고 처리 입력 | 운영자가 출고요청 주문을 보고 박스 단위 포장 구성을 저장한다 | 운영자만 저장 가능, JSON/form 저장 가능, 운영자 출고 처리 화면에서 박스 입력·목록 확인 | `src/app/api/admin/shipments/packages/route.ts`, `src/app/admin/shipments/page.tsx`, `src/app/admin/shipments/[id]/page.tsx`, `src/app/admin/layout.tsx` | 준비 |
| Task 3 — 셀러 출고 포장 표시 | 셀러가 출고관리와 주문 상세에서 박스별 구성을 확인한다 | 자기 주문의 BOX 마커, SKU 수량, 무게, CBM, 상태 표시. 다른 셀러 데이터 노출 없음 | `src/app/dashboard/shipment/page.tsx`, `src/app/dashboard/orders/[id]/page.tsx`, `tests/shipment-packages.test.ts` | 준비 |
| Task 4 — Phase 11 검증·감리 준비 | 실제 한 건으로 박스 배정과 셀러 확인을 증명한다 | 전체 테스트, build, diff check, 디자인 lint, live QA, 외부감리 request 준비 | `phase-packets/phase-011/03-verification.md`, `external-audit/pending/request-phase-011.json`, screenshots | 준비 |

## 3. 이번 Phase에서 하지 않는 것

- 정식 PDF 패킹리스트 자동 발행
- 실제 송장 발급
- 외부 배송조회 API
- 세관 API
- 택배사 API
- 자동 송장 동기화
- 실제 배송 완료 확정
- Phase 8 정식 운영 전환
- 실서비스 변경
- 유료 API 실호출

## 4. 검증 기준

- `npx vitest run tests/shipment-packages.test.ts tests/wallet.test.ts tests/orders.test.ts`
- `npx vitest run`
- `npm run build`
- `git diff --check`
- `npx -y @google/design.md lint .harness/dubyeol2/design-system.md`
- 로컬 앱에서 운영자가 출고요청 주문에 `BOX-1`과 `BOX-2`를 저장한 뒤 셀러 출고관리와 주문 상세에서 같은 박스별 SKU 구성·무게·CBM·상태를 확인한다.
- 다른 셀러가 해당 포장단위를 볼 수 없음을 확인한다.

## 5. 다음 단계

- `superpowers:subagent-driven-development`로 Builder 서브에이전트에게 Task 1부터 배정한다.
- Task별 완료 후 Team Leader가 산출물을 수집하고 리뷰한다.
- 전체 Task 완료 후 Machine Check 결과를 `03-verification.md`에 작성한다.
