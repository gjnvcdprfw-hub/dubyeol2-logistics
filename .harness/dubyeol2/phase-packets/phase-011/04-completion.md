# Phase 11 Completion

상태: PM 작성 완료 (2026-07-06) — **Feature 5 완료**

## 1. 고객에게 생긴 변화

- 운영자가 출고요청 주문을 BOX-1, BOX-2 같은 포장단위로 나눌 수 있다.
- 각 포장단위에는 상태, 무게, CBM, 메모, SKU별 구성과 수량이 남는다.
- 같은 SKU는 출고 가능한 수량보다 더 많이 포장단위에 배정되지 않는다.
- 셀러는 출고관리와 주문 상세에서 자기 주문의 박스별 구성과 포장 상태를 본다.
- 다른 셀러의 박스 구성과 출고 상태는 보이지 않는다.
- 화면은 정식 PDF 패킹리스트와 실제 배송조회가 아직 연결되지 않았음을 명확히 안내한다.

## 2. 완료 범위

- `ShipmentPackage`, `ShipmentPackageItem` 모델.
- 박스 마커, 상태(`PACKING`, `PACKED`, `READY`), 무게 g, 부피 cm3, 메모 저장.
- 박스별 `OrderSkuLine` 수량 저장.
- 출고 요청 상태 주문만 포장단위 배정 가능.
- SKU 출고 가능 수량 초과 차단.
- 운영자 출고 처리 목록과 상세 입력 화면.
- 운영자 포장단위 저장 route의 JSON/form 처리와 관리자 권한 가드.
- 셀러 출고관리 포장단위 요약.
- 셀러 주문 상세의 포장단위/패킹리스트 기초 섹션.
- 하지 않은 것: 정식 PDF 패킹리스트 자동 발행, 실제 송장 발급, 외부 배송조회 API, 세관 API, 택배사 API, 자동 송장 동기화, 실제 배송 완료 확정, Phase 8 정식 운영 전환.

## 3. 검증 결과

- Machine Check: **PASS** — `03-verification.md`.
- Claude 교차 외부감리: **PASS** — `external-audit/result-phase-011.json`.
- 외부감리 findings: 0건.
- Fresh verification:
  - `npx vitest run tests/shipment-packages.test.ts tests/wallet.test.ts tests/orders.test.ts`: PASS — 3 files, 47 tests.
  - `npx vitest run`: PASS — 8 files, 113 tests.
  - `npm run build`: PASS — static pages/routes 53.
  - `git diff --check`: PASS.
  - `npx -y @google/design.md lint .harness/dubyeol2/design-system.md`: PASS — errors 0, warnings 26, infos 1.
- Fresh live QA:
  - seller A `phase11-seller-a-1783311037422@test.local`.
  - seller B `phase11-seller-b-1783311037422@test.local`.
  - `BOX-1`: 빨강 2개, 파랑 1개, 12.5kg, 0.08CBM, 포장완료.
  - `BOX-2`: 파랑 1개, L 3개, 18.2kg, 0.13CBM, 포장완료.
  - seller B 출고요청 0건, BOX-1/BOX-2 미노출.
  - Playwright console error 0, warning 0.
- 화면 증거:
  - `phase-packets/phase-011/screenshots/01-admin-shipment-queue.png`
  - `phase-packets/phase-011/screenshots/02-admin-package-form.png`
  - `phase-packets/phase-011/screenshots/03-admin-packages-saved.png`
  - `phase-packets/phase-011/screenshots/04-seller-shipment-packages.png`
  - `phase-packets/phase-011/screenshots/05-seller-order-package-detail.png`
  - `phase-packets/phase-011/screenshots/06-seller-b-isolated.png`

## 4. Superpowers

- 사용: `superpowers:using-superpowers`, `superpowers:brainstorming`, `superpowers:writing-plans`, `superpowers:subagent-driven-development`, `superpowers:test-driven-development`, `superpowers:systematic-debugging`, `superpowers:requesting-code-review`, `superpowers:receiving-code-review`, `superpowers:verification-before-completion`, `superpowers:finishing-a-development-branch`.
- 확인 불가: 없음.

## 5. 외부감리 결과와 남은 위험

- Claude 교차 외부감리 summary: 박스별 SKU 수량은 출고 가능 수량을 넘지 못하게 트랜잭션으로 막혀 있고, sellerId 스코프 격리와 ADMIN 세션 가드가 구현되어 있다. 셀러/운영자 화면은 같은 DB 값을 표시하고, PDF 패킹리스트·실송장·배송조회·세관/택배사 API는 연결되어 있지 않다.
- findings: 없음.
- 남은 위험: 정식 패킹리스트 PDF, 실송장, 외부 배송조회, 세관/택배사 API는 아직 없다. Phase 11은 패킹리스트 기초 데이터까지만 닫는다.
- 남은 위험: `vitest` 실행 후 dev DB가 비워지므로 live QA를 다시 할 때는 QA seed를 다시 만들어야 한다.
- 남은 위험: Phase 8 정식 운영 전환은 대표님 지시대로 계속 보류다.

## 6. 다음 행동

- 로컬 main 반영: 두별2 계약상 외부감리 PASS 후 자동 진행.
- Feature 5 완료 보고: Phase 9 SKU 라인 구조, Phase 10 예치금 충전 신청/확인, Phase 11 출고 포장단위/패킹리스트 기초를 묶어 대표님에게 보고한다.
- 다음 기능/Phase: 대표님이 다시 정렬하기 전까지 Phase 8 정식 운영 전환은 시작하지 않는다.
- 머지 승인: 불요. 외부감리 PASS 후 로컬 main 자동 머지 계약. 원격 push, deploy, 원격 머지는 하지 않는다.
