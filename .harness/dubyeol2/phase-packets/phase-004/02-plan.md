# Phase 4 Plan

상태: Team Leader 작성 완료 (2026-07-05)

## 1. 연결 정보

- 연결: `00-customer-outcome.md`(§5 확정) / `01-teamleader-intake.md`(너무 큼→4·5 분할)
- 사용한 Superpowers: `superpowers:writing-plans`, `superpowers:dispatching-parallel-agents`(BT12~14 병렬)
- 원본 plan: `docs/superpowers/plans/2026-07-05-phase-004-public-site.md`
- Builder 실행 방식: `superpowers:subagent-driven-development` — BT11 선행 → BT12·13·14 병렬(파일 겹침 없음, v2.22 상한 폐지)

## 2. Builder Task

| Builder Task | 내용 | 검증 기준 | 상태 |
|---|---|---|---|
| BT11 (선행) | 공용 셸(9메뉴 헤더·푸터·신뢰배너·CTA·준비중)+랜딩 풀+계산 lib TDD(quote 운임 추출 리팩터) | vitest 36+/build | 준비 전 |
| BT12 (병렬) | 서비스 소개 4종+1688 검색+배송조회 | build+벤치 섹션 구성 | 준비 전 |
| BT13 (병렬) | 계산기 허브+실계산 3종+준비 중 6종 | 손검산+build | 준비 전 |
| BT14 (병렬) | 회사소개·가이드 허브·요금(rates 파생)·부가서비스 | build+두리 실데이터 grep 0 | 준비 전 |

## 2.1 플랜 이탈 기록

| 날짜 | 이탈 | 사유 |
|---|---|---|
| 2026-07-05 | 플랜 형식: 화면은 전 코드 대신 섹션 구성 명세+benchmark 참조 | 화면 30장 규모 — 공용 컴포넌트·계산 lib·랜딩은 전 코드/명세 유지 (writing-plans 취지 내 조정, TL 승인) |
| 2026-07-05 | Task 15 grep 게이트를 "고객 노출(JSX 텍스트) 한정"으로 정밀화 | rates.ts·창고주소의 "두리무역" 주석은 요율/구조 출처 표기(사실 기록)라 유지 — 화면 노출만 금지 (TL 판단) |
| 2026-07-05 | 품질 검토를 태스크별 3회 대신 Phase 전체 diff 통합 1회 | BT12~14가 동질(정적 JSX 화면) — 스펙 검토는 태스크별 완료, 품질 관점(중복·토큰·구조)은 통합이 효율적 (TL 판단) |

## 3. 실행 제한

- 하지 않는 것: 외부 연동 일체, 대시보드(Phase 5), 모바일 최적화
- 넘지 않는 선: 두리무역 카피 원문·실데이터·실적 숫자 복제 금지, push·deploy 금지, Feature 1 회귀 금지
