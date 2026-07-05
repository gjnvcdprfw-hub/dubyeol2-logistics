# engine.md — 두별2 실행 엔진 모드

상태: 실행 엔진 역할 배정 정본 (v2.23 신설)

현재 모드: **B** (2026-07-05, 대표님 "지금 클로드 사용량이끝나서, 코덱스위주로 돌릴려고해")

## 모드 정의

| 모드 | PM·팀리더·빌더 (빌드 측) | 외부감리 | 쓰는 때 |
|---|---|---|---|
| **A (기본)** | Claude Code | Codex — `codex exec` 격리 호출(v2.21 배선) | 평상시 |
| **B** | Codex | Claude — `claude -p` 무인 호출(sonnet, 규칙 4), 사용량 소진 시 pending 큐 (교차 감리 유지, Codex 자가감리 금지) | Claude 사용량 소진 등 대표님 선언 시 |

## 규칙

1. **역할 배정 모드의 정본은 이 파일이다.** `CLAUDE.md`·`AGENTS.md`의 역할 서술은 모드 A 기준으로 쓰여 있다. 모드 B가 선언되면 빌드 측과 감리 측의 엔진 라벨만 서로 바꿔 읽는다. 운영 계약(단계 1~16), 게이트, 문서 계약, 금지선은 모드와 무관하게 동일하다 — 바뀌는 것은 실행 엔진뿐이다(플랫폼 독립 원칙).
2. **전환은 대표님 선언 한마디로 한다** ("모드 B로 전환" / "모드 A로 복귀"). 전환을 받은 세션은 이 파일의 "현재 모드"와 `current-run.md` 상태판에 모드·날짜·대표님 발화를 기록한다. 그 외 승인 절차는 없다.
3. **모드 B의 빌드 측(Codex)은 `CLAUDE.md` 운영 계약을 그대로 따른다.** Superpowers는 Codex에 설치된 스킬로 수행하고, 수행 불가한 스킬은 보고에 "확인 불가"로 명시한다(기존 보고 규칙 그대로).
4. **모드 B의 외부감리 — Claude 무인 호출(`claude -p`), Codex 자가감리 금지.** 빌드 측(Codex)이 Machine Check 통과 직후 `external-audit/pending/request-phase-{n}.json`을 쓰고, 아래 배선으로 Claude 감리를 무인 호출한다(교차 감리). 프리플라이트 실패(Claude 사용량 소진 등)면 감리를 시도하지 않고 pending 큐에 남긴 채 다음 phase로 진행한다 — 감리 PASS 전 로컬 main 머지 금지는 그대로다(머지만 지연, phase 진행은 feature 브랜치에서 계속).

   배선(2026-07-05 물류 Phase 6 실감리 PASS로 실측 확정):

   프리플라이트 — 60초 내 "OK"(실측 8초):
   ```
   echo "reply OK" | claude -p --model claude-sonnet-5
   ```
   본감리 — 프로젝트 루트에서:
   ```
   echo "두별2 외부감리. 너는 외부감리자다. .harness/dubyeol2/external-audit/pending/request-phase-{n}.json 을 읽고, 거기 명시된 고객 약속·금지선·기계검증 증거를 프로젝트 코드와 대조해 PASS/FAIL/BLOCKED 를 판정하라. 코드는 읽기만 하고 절대 수정하지 마라. 최종 출력은 .harness/dubyeol2/external-audit/result.schema.json 스키마를 정확히 따르는 JSON 오브젝트 하나만 출력하라 — 코드펜스, 설명문, 다른 텍스트 일절 금지."      | claude -p --model claude-sonnet-5 --allowedTools "Read,Glob,Grep"      > .harness/dubyeol2/external-audit/result-phase-{n}.json
   ```
   호출 후 검증: JSON 파싱 + result.schema.json required 필드 확인. 위반이면 1회 재시도, 재위반이면 "감리 불가/재시도"(FAIL/BLOCKED 아님). 감리 완료 건의 pending 파일은 `external-audit/request-phase-{n}.json`으로 옮겨 큐를 비운다(삭제 금지).

   주의(실측): `--allowedTools`는 가변 인자라 뒤에 오는 프롬프트를 도구 이름으로 삼킨다 — **프롬프트는 반드시 stdin(파이프)으로 준다**(인자 방식 실패 2회 실측). read-only는 `--allowedTools "Read,Glob,Grep"`(쓰기 도구 미허용)로 강제한다. 모델은 `claude-sonnet-5` 고정 — Opus 사용량 소진 중에도 가용하고(실측), 판정 품질은 Phase 6 실감리로 충분함을 확인했다. 시간·hang 판단은 v2.21 세칙을 준용한다(출력 파일 미갱신+0% CPU 지속만 hang, 오래 걸림 자체는 정상).
5. **감리 대기 큐 처리(fallback).** 프리플라이트 실패로 pending에 남은 건은 Claude 사용량 회복 시(모드 B 중이라도) 또는 모드 A 복귀 첫 세션이 위와 같은 배선으로 일괄 감리한다. PASS 순서대로 로컬 main 머지·04-completion·상태판 갱신(머지는 빌드 측 몫).
6. **모드 B 정렬 권고.** 새 기능의 L1~L5 정렬은 가급적 모드 A(Claude PM)에서 한다 — Codex PM의 정렬 약점은 과거 실측(v2.7 계기)이다. 모드 B에서는 이미 정렬이 닫힌 phase의 빌드 진행을 우선한다. 급한 정렬은 가능하되, 복귀 후 Claude PM이 정렬 체크 칸을 재확인한다.

## 전환 이력

| 날짜 | 모드 | 근거 |
|---|---|---|
| 2026-07-05 | (신설, 기본 A) | v2.23 — 대표님 "코덱스위주로 돌릴려고해, 언제든 스위치 될수있게" |
| 2026-07-05 | B 전환 | 대표님 "지금 클로드 사용량이끝나서, 코덱스위주로 돌릴려고해" — Claude 복귀 시 "모드 A로 복귀" 선언으로 되돌림 |
