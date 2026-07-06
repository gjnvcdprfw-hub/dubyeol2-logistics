# Phase 10 Implementation Plan

상태: Team Leader 작성 완료 (2026-07-06). Superpowers: `superpowers:writing-plans`

이 파일은 Team Leader가 `superpowers:writing-plans`로 작성한 구현 계획의 두별2 연결 문서다. 원본 계획은 `docs/superpowers/plans/2026-07-06-phase-010-wallet-topups.md`에 둔다.

## 1. 원본 Superpowers Plan

- 원본 계획: `docs/superpowers/plans/2026-07-06-phase-010-wallet-topups.md`
- 목표: 셀러가 예치금 충전을 요청하고, 운영자가 수동 승인/거절해 잔액과 원장과 화면 상태를 일치시킨다.
- 구현 방식: 기존 `WalletTransaction`은 잔액 원장으로 유지하고, `WalletTopUpRequest`를 충전 요청 workflow 기록으로 추가한다. 승인 시 한 Prisma transaction 안에서 요청 상태와 credit 원장을 함께 남긴다.

## 2. Builder Task 요약

| Builder Task | 고객에게 생기는 변화 | 완료 기준 | 주요 파일 | 상태 |
|---|---|---|---|---|
| Task 1 — 충전 요청 모델·도메인 | 충전 요청이 잔액과 분리되어 대기/승인/거절 상태로 남는다 | 승인 전 잔액 미반영, 승인 시 원장 1건, 중복 승인 차단, 거절 시 잔액 미변경 | `prisma/schema.prisma`, `src/lib/wallet-topups.ts`, `src/lib/wallet.ts`, `tests/wallet-topups.test.ts` | 완료 |
| Task 2 — 셀러 충전 요청 API·화면 | 셀러가 예치금 관리 화면에서 충전 요청을 남기고 상태를 본다 | 100,000원 요청 후 상태는 충전 대기, 잔액은 그대로, 자기 요청만 보임 | `src/app/api/wallet/topups/route.ts`, `src/app/dashboard/wallet/page.tsx`, `src/app/dashboard/page.tsx`, `tests/wallet-topups.test.ts` | 완료 |
| Task 3 — 운영자 승인/거절 API·화면 | 운영자가 충전 대기 요청을 승인/거절한다 | 승인 시 잔액·원장 증가, 거절 시 미증가, 운영자 아닌 사용자는 처리 불가 | `src/app/api/admin/wallet-topups/[id]/approve/route.ts`, `src/app/api/admin/wallet-topups/[id]/reject/route.ts`, `src/app/admin/wallet-topups/page.tsx`, `src/app/admin/layout.tsx`, `tests/wallet-topups.test.ts` | 완료 |
| Task 4 — Phase 10 검증·감리 준비 | 실제 화면 한 건으로 충전 요청→승인→원장 확인을 증명한다 | 전체 테스트, build, diff check, 디자인 lint, live QA, 외부감리 request 준비 | `phase-packets/phase-010/03-verification.md`, `external-audit/pending/request-phase-010.json`, screenshots | 완료 |

## 3. 이번 Phase에서 하지 않는 것

- 실계좌 실제값 노출
- PG/간편결제
- 은행 API
- 자동 입금 확인
- 실제 입금 매칭
- 환불 자동화
- 세금계산서
- 정식 운영 전환
- 포장단위 마커
- 패킹리스트 생성
- 1688 외부 연동

## 4. 검증 기준

- `npx vitest run tests/wallet-topups.test.ts tests/wallet.test.ts`
- `npx vitest run`
- `npm run build`
- `git diff --check`
- `npx -y @google/design.md lint .harness/dubyeol2/design-system.md`
- 로컬 앱에서 셀러 충전 요청 → 운영자 승인 → 셀러 잔액/원장 확인 → 거절 요청 잔액 미변경 → 다른 셀러 격리 확인.

## 5. 다음 단계

- `superpowers:subagent-driven-development`로 Builder 서브에이전트에게 Task 1부터 배정한다.
- Task별 완료 후 Team Leader가 산출물을 수집하고 리뷰한다.
- 전체 Task 완료 후 Machine Check 결과를 `03-verification.md`에 작성한다.
