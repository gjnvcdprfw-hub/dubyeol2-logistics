# Phase 2 Plan

상태: Team Leader 작성 완료 (2026-07-04)

## 1. 연결 정보

- 연결된 고객 결과 요청: `00-customer-outcome.md` (§5 확정)
- Team Leader intake: `01-teamleader-intake.md` (판단: 적정)
- 사용한 Superpowers: `superpowers:writing-plans`
- 원본 Superpowers plan: `docs/superpowers/plans/2026-07-04-phase-002-inbound-evidence.md`
- 계획 범위: Phase 전체
- Builder 실행 방식: `superpowers:subagent-driven-development` (순차 의존, 태스크당 스펙+품질 2단계 검토)

## 2. Builder Task

| Builder Task | Plan Task | 고객에게 생기는 변화 | 완료 기준 | 검증 기준 | 상태 |
|---|---|---|---|---|---|
| Builder Task 4 (스키마·시드) | Task 1 | (기반) 입고·검수 데이터 구조와 운영자 계정 준비 | 마이그레이션+시드 동작 | `npm run build` | 준비 전 |
| Builder Task 5 (입고 서비스) | Task 2 | (기반) 입고 기록 규칙 — 검수 미신청 거부·사진 1~2장·재기록 금지 | TDD 8케이스 통과 | `npx vitest run` 22/22 | 준비 전 |
| Builder Task 6 (운영자 영역) | Task 3 | 운영자가 입고·검수를 기록한다 (권한 분리) | 업로드+기록 폼 동작, ADMIN 가드 | build+vitest | 준비 전 |
| Builder Task 7 (셀러 표시) | Task 4~5 | 셀러가 입고 증거·창고주소/입고ID를 본다 | 상세·주소 화면, 검수 경계 표시 | build+vitest+lint | 준비 전 |

## 2.1 플랜 이탈 기록

| 날짜 | 이탈 | 사유 |
|---|---|---|
| 2026-07-04 | .gitignore `public/uploads/` → `public/uploads/*` | git은 디렉터리 exclude 시 하위 negation 무효 — check-ignore로 실증 후 변경, 플랜 의도 보존 (팀리더 사후 승인) |
| 2026-07-04 | 창고 주소 상수 = "오픈 전 확정" 자리표시 확정 | 대표님 결정("아니다 너말대로 오픈전 확정으로 하자") — 두리무역 실주소는 타사 자산이라 사용 불가 |
| 2026-07-04 | recordInbound에 compare-and-set(where status:"REQUESTED" + P2025 변환) 추가 | 플랜 결함 — HTML 폼 이중 제출 시 사진 4장·증거 덮어쓰기 race (품질 검토 I-1). Task 3 API 검수 수치 정수 검증도 전달 권고 반영 예정 |
| 2026-07-04 | admin 페이지 2개에 자체 권한 가드 추가 (layout 단독 의존 제거) | 플랜 보완 — Next.js layout은 유일한 인증 지점으로 부적합 (Task 3 품질 검토 I-1). QA에 "검수 신청 건에서 hasInspection 해제" 시나리오 추가 권고 접수 |
| 2026-07-04 | 주문 상세 검수 표시를 3분기로 (신청·미기록 건 별도 문구) | 플랜 결함 — 검수 신청+미기록 건이 "신청하지 않은 건"으로 오표시 (Task 7 품질 검토 Important, 하드라인 ①③ 위반) |

## 3. 실행 제한

- 이번 계획에서 하지 않는 것: 견적(Phase 3), 출고·배송, 알림, 바코드/WMS, 외부 스토리지, 두리무역식 입고 상태 5종 복제(입고대기→입고완료만)
- 대표님 승인 없이는 넘지 않는 선: push·deploy·원격·실DB·유료 API·secret 커밋·파일 삭제. 창고 실주소는 자리표시(대표님 확정 대기)
