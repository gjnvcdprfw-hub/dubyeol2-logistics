# Phase 3 Plan

상태: Team Leader 작성 완료 (2026-07-04)

## 1. 연결 정보

- 연결된 고객 결과 요청: `00-customer-outcome.md` (§5 확정)
- Team Leader intake: `01-teamleader-intake.md` (판단: 적정)
- 사용한 Superpowers: `superpowers:writing-plans`
- 원본 Superpowers plan: `docs/superpowers/plans/2026-07-04-phase-003-itemized-quote.md`
- 계획 범위: Phase 전체
- Builder 실행 방식: `superpowers:subagent-driven-development`

## 2. Builder Task

| Builder Task | Plan Task | 고객에게 생기는 변화 | 완료 기준 | 검증 기준 | 상태 |
|---|---|---|---|---|---|
| Builder Task 8 (요율·계산) | Task 1 | (기반) 요율 단일 정의 + 항목별 계산 (정수 연산) | TDD 7케이스, QA 예시 숫자 일치 | `npx vitest run` 29/29 | 준비 전 |
| Builder Task 9 (운영자 견적) | Task 2 | 운영자가 견적을 입력한다 | RECEIVED 건 견적 저장, 403 가드 | build+vitest | 준비 전 |
| Builder Task 10 (셀러 표시) | Task 3 | 셀러가 항목별 견적(¥·₩ 병기·면책 문구)을 본다 | 견적 카드+배지, 검수 미신청 건 검수비 항목 없음 | build+vitest+lint | 준비 전 |

## 2.1 플랜 이탈 기록

| 날짜 | 이탈 | 사유 |
|---|---|---|
| 2026-07-04 | 청구중량 계산을 g 단위 정수 나눗셈으로 교체 | 플랜 코드의 float 경유가 100g 배수 무게에서 ¥1.8 과청구 (스펙 검토 발견, 전수 검사 1~100만g 중 100건) |

## 3. 실행 제한

- 하지 않는 것: 결제·예치금·실청구, 환율 자동 연동(유료 API 금지선), 관세 계산, LCL 요율, 견적 상태 전이
- 넘지 않는 선: push·deploy·원격·실DB·secret. 요율 값 변경은 대표님 컷팅 권한(rates.ts 단일 파일)
