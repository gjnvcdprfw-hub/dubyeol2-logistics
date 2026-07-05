# handover.md — Claude Code → Codex 세션 인수인계 (2026-07-05)

이 문서는 Claude Code 세션이 컨텍스트 한계로 종료되며 작성한 인수인계 정본이고, Codex가 이어받아 모드 B 기준으로 보정했다. 새 세션은 `AGENTS.md` → `.harness/dubyeol2/engine.md` → 이 문서 → `current-run.md` 순서로 읽고 이어서 진행한다.

## 1. 지금 정확한 위치 (여기서부터 시작)

- 브랜치: **phase-006** (main 아님). 현재 인수인계 커밋: `f62c3b9`, r1 수정 커밋: `20df534`
- 현재 모드: **B — 빌드=Codex / 감리=Claude** (`engine.md`). Codex 자가감리 금지, 감리 PASS 전 `main` 머지 금지
- 상태: Phase 6이 대표님 지시로 재정렬됨 — **두리무역 1:1 비공개 기준판**. 공개 영역 기준판 Machine Check PASS, Claude 교차감리 대기
- **첫 작업**: Claude 교차감리 실행 (`external-audit/pending/request-phase-006.json`). Codex 자가감리 금지

## 2. 다음 순서

1. Claude 교차감리 실행
2. PASS 시 `04-completion.md` 작성 + 로컬 main 머지
3. FAIL 시 Team Leader가 분류하고 Builder에게 수정 배정
4. 다음 Phase: 우리 회사용 수정 또는 로그인 후 대시보드/돈 흐름 중 PM 재정렬

## 3. 프로젝트 전체 현황

- Feature 1 (주문 접수→입고 증거→항목별 견적): 완료·머지, 전부 실동작 (Phase 1~3, 감리 PASS)
- Feature 2 (두리무역 모든 화면 — 공개 23화면+대시보드 12메뉴): 완료·머지 (Phase 4~5)
- Feature 3 (두리무역 1:1 비공개 기준판): Phase 6 = Machine Check PASS, Claude 교차감리 대기
- 테스트 36개(vitest). 정본: `.harness/dubyeol2/` (PROJECT·feature·phases·current-run·benchmark-duly·gap-analysis-duly·design-system). 요율 정본: `src/lib/rates.ts`·`src/lib/pricing-data.ts`
- 데모: 셀러 `demo@demo.com`/`demo-1234`, 운영자 `admin@local.test`/`admin-local-1` (재생성: `npx tsx scripts/seed-admin.ts admin@local.test admin-local-1`). **vitest 실행 시마다 dev DB가 비워짐** — QA 전 재시드 필수, dev 서버 켠 채 vitest 돌리면 경합 flake

## 4. 외부감리 실행 세칙

- 현재 모드 B에서는 Codex가 감리를 실행하지 않는다.
- 기존 감리 입력은 PM 재정렬 전 "문구 전용" 계약 기준이므로 **무효화**됐다.
- 새 감리 입력은 `external-audit/request.json`과 `external-audit/pending/request-phase-006.json`에 작성 완료.
- FAIL이면: TL 분류 → Builder 수정 → run.id에 -r2 등 부여 → 재감리. 같은 Phase 3회 FAIL 시 대표님 보고

## 5. Phase 6 새 스펙 (두리무역 1:1 비공개 기준판)

- 범위: 로고, 이미지, 실주소, 전화번호, 계좌, 사업자정보만 제외하고 두리무역의 디자인, 기능, 구조, 문구, 버튼 흐름, 상태 문구, 아이콘/이모티콘 위치와 역할을 1:1 비공개 기준판으로 맞춘다
- 수집: 대표님 Chrome으로 두리무역 원본을 직접 열어 화면별로 확인한다
- 운영 담장: 고객 공개 금지, 검색 노출 금지, deploy·원격 push·원격 머지 금지, 실DB 쓰기·유료 API·실입금 금지
- 합격 예시: 대표님이 원본과 로컬 기준판을 나란히 봤을 때 제외 6종만 자리표시이고 나머지는 같은 역할로 대응한다

## 6. 지켜야 할 원칙 (이 세션 확립·대표님 승인)

- **기준판**: 현재 Feature 3에서는 비공개 1:1 기준판을 만든다. 단, 로고·이미지·실주소·전화번호·계좌·사업자정보는 코드 반입 금지. 정식 운영 전 우리 회사용으로 수정해야 한다
- **요율·수치**: rates.ts·pricing-data.ts 단일 정본 파생만 — **화면 라벨의 숫자도 파생**(하드코딩이 Phase 3·4 감리 FAIL 사유)
- **거짓 기능 금지**: 미구현은 "준비 중" 명시 (Phase 5 감리 FAIL 사유)
- **문서 정합**: Phase 착수·전환 시 current-run.md(§1·§2·§3 게이트 표·§4 실패 횟수) 즉시 갱신 (Phase 4 감리 FAIL 2회 사유)
- 금지선: push·deploy·원격 머지·실DB·유료 API·secret 커밋·파일 삭제. Builder 커밋은 명시 add(`git add -A` 금지 — 무관 파일 쓸려 들어간 사고 있었음)
- 실행: TL은 구현 금지, Builder 서브에이전트 위임(태스크별 스펙+품질 2단계 검토, 파일 분리 시 병렬 가능 — v2.22 상한 없음)

## 7. 대표님 확정 대기 값 (묻지 말고, 주시면 반영)

창고 실주소 · 입금 실계좌 · 요율 컷팅(rates.ts — 기견적 표시 소급 변동 주의) · 검품 단가 · 외관 추가 편집 · 약관 본문
