# Phase 1 Plan

상태: Team Leader 작성 완료 (2026-07-04)

이 파일은 Team Leader가 `superpowers:writing-plans` 후 작성한다. 원본 Superpowers plan은 그대로 두고, 이 파일에는 연결 정보와 Builder Task 요약만 둔다.

## 1. 연결 정보

- 연결된 고객 결과 요청: `00-customer-outcome.md` (§5 Phase 1 좁힌 완료 기준)
- Team Leader intake: `01-teamleader-intake.md`
- 사용한 Superpowers: `superpowers:writing-plans`
- 원본 Superpowers plan: `docs/superpowers/plans/2026-07-04-phase-001-order-intake.md`
- 계획 범위: Phase 전체
- Builder 실행 방식: `superpowers:subagent-driven-development` (동시 최대 3, 완료 즉시 슬롯 회수)

## 2. Builder Task

Plan의 Task 1~8을 아래 3개 Builder Task로 배정한다 (순차 의존: A → B → C).

| Builder Task | Plan Task | 고객에게 생기는 변화 | 완료 기준 | 검증 기준 | 상태 |
|---|---|---|---|---|---|
| Builder Task 1 (기반) | Task 1~2 | (기반) 사이트가 뜨고 디자인 토큰·DB 준비 | 스캐폴드 빌드 성공, 토큰 반영, 스키마 마이그레이션 | `npm run build` 성공 | 준비 전 |
| Builder Task 2 (인증) | Task 3~4 | 셀러가 가입·로그인·로그아웃한다 | 인증 TDD 5개 통과 + 화면 동작 | `npx vitest run tests/auth.test.ts` PASS | 준비 전 |
| Builder Task 3 (주문+랜딩) | Task 5~8 | 주문 접수·내 주문 목록(격리·검수 경계 문구)·랜딩 | 주문 TDD 4개 통과 + 화면 + 전체 빌드 | `npx vitest run && npm run build` PASS | 준비 전 |

## 3. 실행 제한

- 이번 계획에서 하지 않는 것: 입고·검수 기록(Phase 2), 견적(Phase 3), 소셜 로그인, 1688 연동, 예치금, 실결제
- 대표님 승인 없이는 넘지 않는 선: `git push`·deploy·원격 머지·실DB·유료 API 실호출·secret 커밋·파일 삭제(스캐폴드 생성물 제외)
