# Phase 5 Plan

상태: Team Leader 작성 완료 (2026-07-05)

## 1. 연결 정보

- 연결: `00-customer-outcome.md`(확정) / `01-teamleader-intake.md`(적정)
- Superpowers: `superpowers:writing-plans`, `superpowers:dispatching-parallel-agents`
- 원본 plan: `docs/superpowers/plans/2026-07-05-phase-005-dashboard.md`
- 실행: BT15 선행 → BT16·17·18 병렬

## 2. Builder Task

| Builder Task | 내용 | 검증 | 상태 |
|---|---|---|---|
| BT15 (선행) | 셸(12메뉴 사이드바)+홈(예치금 배너·현황 카드 5, 실집계 sellerId 스코프)+그림자 토큰 | vitest 36+기존 4경로 회귀 | 준비 전 |
| BT16 (병렬) | 장바구니·내 상품·스마트오더 (준비 중) | build | 준비 전 |
| BT17 (병렬) | 입고(실데이터 목록)·출고·반품·출장검품 | build+격리 | 준비 전 |
| BT18 (병렬) | 프로필(기본 실데이터)·예치금 | build | 준비 전 |

## 2.1 플랜 이탈 기록

| 날짜 | 이탈 | 사유 |
|---|---|---|
|  |  |  |

## 3. 실행 제한

- 하지 않는 것: 예치금 실충전·장바구니 실동작·출고/반품 실처리·운영자 개편·기존 파일 그림자 일괄 치환
- 넘지 않는 선: 기존 경로 삭제·이동 금지(Feature 1 회귀 0), 두리 카피 0, push 금지
