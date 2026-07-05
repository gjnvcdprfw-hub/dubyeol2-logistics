# Phase 5 Team Leader Intake

상태: Team Leader 작성 완료 (2026-07-05)

## 1~2. 입력·이해

- 받은 요청: 00-customer-outcome.md (대시보드 12메뉴). Superpowers: `superpowers:brainstorming`
- 반드시 지켜야 하는 결과: Feature 1 실동작 회귀 0(가장 민감 — 기존 대시보드 화면을 옮기면서 깨뜨리기 쉬움), 거짓 기능 0, 두리 카피 0

## 3. 범위 판단

- 판단: **적정** — Phase 4와 동급(화면 12~13장), 실증된 병렬 패턴 재사용. BT15(셸+홈, 선행 — 기존 layout 개편이라 기존 화면과 충돌 가능해 단독) → BT16·17·18 병렬(신규 디렉토리 분리)
- 고객 약속 변경: 없음. PM 재조정: 불요

## 4. 위험 점검

- 숨은 위험: ①dashboard/layout.tsx 개편이 기존 4화면(orders·orders/[id]·orders/new·warehouse-address)과 admin 리다이렉트에 영향 — BT15에서 기존 링크 경로 유지 필수 ②"구매대행 관리" 메뉴명과 기존 "내 주문"의 매핑 — 경로는 /dashboard/orders 유지하고 메뉴 라벨만 두리무역식(신규 경로 만들어 깨뜨리지 않기) ③현황 카드 집계 쿼리의 셀러 격리(sellerId 스코프)
- Phase 4 학습 반영: 착수 시점에 상태판·게이트 표 즉시 갱신(감리 FAIL 3회 재발 방지), 고객 노출 숫자는 처음부터 정본 파생
- PM에게 되돌릴 질문: 없음

## 5~6. 판정

- `superpowers:writing-plans` 진입: 가능
