# handover.md — Claude Code → Codex 세션 인수인계 (2026-07-05)

이 문서는 Claude Code 세션이 컨텍스트 한계로 종료되며 작성한 인수인계 정본이다. 새 세션(Codex)은 `AGENTS.md` → 이 문서 → `current-run.md` 순서로 읽고 이어서 진행한다.

## 1. 지금 정확한 위치 (여기서부터 시작)

- 브랜치: **phase-006** (main 아님). 마지막 커밋: `20df534`
- 상태: Phase 6(전 화면 카피 밀착) — Machine Check PASS, **외부감리 r1 FAIL(창고주소 '자동 확인' 문구) → 수정 완료(20df534) → r2 재감리 직전에서 중단**
- **첫 작업**: ① `.harness/dubyeol2/external-audit/request.json`의 `run.id`를 `phase-006-copy-density-20260705-r2`로 변경, `changes.risk_notes` 맨 앞에 "r1 MAJOR 반영: 창고주소 '자동 확인' 문구를 실동작(운영자 입고 기록 후 표시)에 맞게 수정(20df534), '자동' 잔존 grep 0건, build 성공" 추가 → ② 프리플라이트 → ③ 재감리 (명령은 §4)

## 2. r2 PASS 이후 순서 (두별2 계약 14~16단계)

1. `phase-packets/phase-006/03-verification.md` §4에 r1 FAIL→수정→r2 PASS 기록, `changes.md` §1에 Phase 6 행 추가
2. `phase-packets/phase-006/04-completion.md` 작성 (Phase 4·5 것 참고)
3. packet 커밋 → `git checkout main && git merge --no-ff phase-006` → 머지 후 `npx vitest run`(36/36)·`npm run build` 확인
4. `current-run.md`·`phases.md`·`PROJECT.md`를 Phase 6 완료로 갱신
5. **Phase 7 (예치금 충전·결제) 착수** — Feature 3의 2/2, 스펙은 §5. packet(00~02)→Builder→Machine Check→감리→머지→**Feature 3 완료 보고**

## 3. 프로젝트 전체 현황

- Feature 1 (주문 접수→입고 증거→항목별 견적): 완료·머지, 전부 실동작 (Phase 1~3, 감리 PASS)
- Feature 2 (두리무역 모든 화면 — 공개 23화면+대시보드 12메뉴): 완료·머지 (Phase 4~5)
- Feature 3 (카피 밀착+예치금): Phase 6 = r2 감리 대기(§1), Phase 7 = 미착수
- 테스트 36개(vitest). 정본: `.harness/dubyeol2/` (PROJECT·feature·phases·current-run·benchmark-duly·gap-analysis-duly·design-system). 요율 정본: `src/lib/rates.ts`·`src/lib/pricing-data.ts`
- 데모: 셀러 `demo@demo.com`/`demo-1234`, 운영자 `admin@local.test`/`admin-local-1` (재생성: `npx tsx scripts/seed-admin.ts admin@local.test admin-local-1`). **vitest 실행 시마다 dev DB가 비워짐** — QA 전 재시드 필수, dev 서버 켠 채 vitest 돌리면 경합 flake

## 4. 외부감리 실행 세칙 (v2.21 + 이 세션 실측)

프리플라이트:
codex exec --sandbox read-only --skip-git-repo-check --model gpt-5.5 --ephemeral --ignore-user-config "reply OK"

본감리:
codex exec --sandbox read-only --skip-git-repo-check --model gpt-5.5 --ephemeral --ignore-user-config -c 'approval_policy="never"' -c 'model_reasoning_effort="high"' --output-schema .harness/dubyeol2/external-audit/result.schema.json -o .harness/dubyeol2/external-audit/result.json "두별2 외부감리. .harness/dubyeol2/external-audit/request.json 기준으로 PASS/FAIL/BLOCKED 판정. 코드 수정 금지, 판정만."

- **반드시 포그라운드 실행** — 백그라운드 셸에서 7회 연속 hang(CPU 0%) 실측. hang이면 kill 후 포그라운드 재시도(="감리 불가/재시도", FAIL 아님)
- FAIL이면: TL 분류 → Builder 수정 → run.id에 -r3 등 부여 → 재감리. 같은 Phase 3회 FAIL 시 대표님 보고

## 5. Phase 7 스펙 (예치금 — 두리무역 실물 그대로, gap-analysis-duly.md §5 + feature.md §4)

- 흐름: 충전 신청(금액 직접 입력+프리셋 1·5·10·20·50·100만원, 최소 ₩10,000, 입금자명 필수 7자 이내, 연락처 선택) → 무통장 입금 계좌 안내(**실계좌는 "오픈 전 확정" 자리표시** — 두리 계좌 복제 금지) → "충전 대기" 기록 → **운영자 입금 확인** → 잔액 반영 → **견적 결제**(잔액 차감, 부족 시 거부) → 거래 내역. 출금 불가 정책 명시
- 돈 규칙: 전부 정수(원), 잔액=거래 내역 합 불변식(TDD), sellerId 격리, 이중 처리 방지 CAS(참고: src/lib/inbound.ts recordInbound의 where+P2025 패턴), ValidationError 패턴(src/lib/auth.ts)
- 합격 예시(feature.md §4): 5만원 충전→₩442,700 결제 시도→잔액 부족 거부 / 50만원 충전→결제 성공→잔액 ₩107,300·거래 내역 2건
- 돈·권한 phase → Machine Check에 **보안 검토 필수**(내장 /security-review는 origin 부재로 불가 — 전담 서브에이전트 대체가 관례) + Playwright 실화면 QA

## 6. 지켜야 할 원칙 (이 세션 확립·대표님 승인)

- **카피**: 두리무역 원문 문장 복제 금지(원문 grep되면 감리 FAIL) — 같은 위치·내용·정보량으로 재작성. 원문은 benchmark-duly.md에 있고 대표님이 배포 전 직접 수정 예정("그래" 승인). 이미지·로고 금지, "두리/duly/실주소/전화/계좌/실적 숫자" 코드 반입 금지
- **요율·수치**: rates.ts·pricing-data.ts 단일 정본 파생만 — **화면 라벨의 숫자도 파생**(하드코딩이 Phase 3·4 감리 FAIL 사유)
- **거짓 기능 금지**: 미구현은 "준비 중" 명시 (Phase 5 감리 FAIL 사유)
- **문서 정합**: Phase 착수·전환 시 current-run.md(§1·§2·§3 게이트 표·§4 실패 횟수) 즉시 갱신 (Phase 4 감리 FAIL 2회 사유)
- 금지선: push·deploy·원격 머지·실DB·유료 API·secret 커밋·파일 삭제. Builder 커밋은 명시 add(`git add -A` 금지 — 무관 파일 쓸려 들어간 사고 있었음)
- 실행: TL은 구현 금지, Builder 서브에이전트 위임(태스크별 스펙+품질 2단계 검토, 파일 분리 시 병렬 가능 — v2.22 상한 없음)

## 7. 대표님 확정 대기 값 (묻지 말고, 주시면 반영)

창고 실주소 · 입금 실계좌 · 요율 컷팅(rates.ts — 기견적 표시 소급 변동 주의) · 검품 단가 · 외관 추가 편집 · 약관 본문
