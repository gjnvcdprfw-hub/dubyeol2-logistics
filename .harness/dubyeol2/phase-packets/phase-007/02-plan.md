# Phase 7 구현 계획

상태: Team Leader plan 작성 완료 (2026-07-05). Superpowers: `superpowers:writing-plans`

## 1. 원본 계획

- `docs/superpowers/plans/2026-07-05-phase-007-seller-shipment-wallet.md`

## 2. Builder Task 요약

| Task | 고객 결과 | 주요 파일 | 검증 |
|---|---|---|---|
| Task 1 | 예치금 원장과 출고 요청 거래가 안전하게 저장된다 | `prisma/schema.prisma`, `src/lib/wallet.ts`, `tests/wallet.test.ts` | `npx vitest run tests/wallet.test.ts tests/orders.test.ts tests/quote.test.ts` |
| Task 2 | 셀러가 출고 요청을 API로 완료할 수 있다 | `src/app/api/shipments/request/route.ts`, `scripts/seed-wallet.ts` | JSON/form 요청 수동 확인 + wallet tests |
| Task 3 | 셀러 화면 4곳이 같은 예치금·출고 상태를 보여준다 | 주문 상세, 출고관리, 예치금, 대시보드 홈 | `npm run build`, 로컬 브라우저 QA |
| Task 4 | Machine Check와 외부감리 입력이 준비된다 | `03-verification.md`, `external-audit/request.json` | 테스트·빌드·브라우저 QA 증거 |

## 3. 담장

- 실계좌, 실입금, 실결제, 송장, 통관, 택배 추적 없음.
- 로컬 테스트 예치금 원장만 사용.
- Phase 6 감리 대기는 별도 유지.

