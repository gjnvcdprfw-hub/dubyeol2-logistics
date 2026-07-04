# 두별2 Harness Version

- 현재 버전: v2.21
- 승격일: 2026-07-04
- v2.21 적용 범위: 외부감리 신뢰성 — ①감리 호출 명령에 격리 플래그(`--ephemeral --ignore-user-config -c approval_policy="never" -c model_reasoning_effort="high"`) 추가: 사람용 Codex 앱 설정(훅·플러그인·스킬·MCP)이 무인 감리에 끼어드는 것 차단(구독 인증·프로젝트 AGENTS.md 유지), ②감리 직전 프리플라이트 헬스체크(`"reply OK"` 60초 내, 실측 4초) 필수 — 실패는 FAIL 아님, "감리 불가/재시도", ③hang vs 느림 판별 세칙(result.json mtime 미변+0% CPU 10분+`SessionStart Failed` 3종 동시 = hang → 죽이고 재시도, "세션 로그 없음"만으로 판단 금지), ④훅 위생·app-server 클린, ⑤"approval never가 기본" 오류 문구 정정(실측 on-request). 계기: 대표님 실측 리포트(감리 hang, 근본 원인 session_start 훅 실패) + PM 통제 재현(구 명령 성공 2m43s / 격리 프리플라이트 4초·22k토큰 실측). v2.10 "오래 걸려도 죽이지 마라"는 유지, 정밀화만.
- v2.20 적용 범위: design-system.md를 Google DESIGN.md 규격으로 전면 전환(4곳) — 위 YAML 토큰(기계가 읽는 정확한 값)+아래 산문(이유). 라이브 문서(twostarhub·white7)는 본문 무손실로 토큰층만 추가(확정값만, 범위·미확정은 산문 유지), 중앙 템플릿·물류는 골격 신설. UI phase Machine Check에 `npx @google/design.md lint` 검증(errors 0) 편입. 계기: AI slop 방지 + 디자인 항목의 기계 검증 수단 부재(Phase 35 디자인 FAIL은 사람 눈으로만 잡았음).
- v2.19 적용 범위: Machine Check 확장 — ①보안 검토: 인증·결제·개인정보·권한·외부 연동·secret 터치 phase는 내장 `/security-review` 필수(심각 발견=Machine Check FAIL), ②실화면 QA: UI phase는 Playwright MCP(공식, user scope 등록·크로미움 실측 완료)로 로컬 앱 실구동 확인. 03-verification 템플릿에 3.1·3.2 칸 신설(비면 03 미완 → 기존 게이트 편승), Codex 감리 확인 목록에 2줄 추가. 계기: wshobson/agents가 드러낸 보안 게이트 공백 + Phase 46 "DOM 몰라 FAIL"(대표님이 실화면 확인 대행하던 실측). 담장: 브라우저는 로컬·개발 환경 한정, 외부 실서비스 조작 금지.
- v2.18 적용 범위: 디자인 트랙 정본화 — Claude Design을 두별2 디자인 경로로 연결. `design-flow.md` 신설(세 경로·디자인 브리프·핸드오프 수신 규칙·/design-sync 동기화 유지·담장), CLAUDE.md ⑦디자인 유형과 문서 등급에 연결. 핸드오프 번들은 빌드 게이트를 우회하지 않음.
- v2.17 적용 범위: 기능 단위 배치 진행 — phase별 대표님 머지 승인 폐지(외부감리 PASS 후 로컬 main 자동 머지·04-completion 기록), 같은 기능 약속 안 phase 자동 연속 진행, 쪼갠 페이즈 전부 완료·머지 후 기능 완료 보고 1회(새 게이트: 이 보고 없이 다음 기능 정렬 금지). 즉시 멈춤 3종(계약 밖·BLOCKED·3회 실패)·phase별 게이트·금지선(원격 push 등) 불변.
- v2.16 적용 범위: 정렬 게이트화 — L1~L5 골격을 CLAUDE.md에 상시 노출(한 턴 한 층), 00·feature 템플릿에 L1~L5 정렬 체크(대표님 발화 인용 필수, L4·L5 비면 팀리더 전환 불가). 대표님 발화 분류 7유형(⑥수정=PM 직접 수정 금지 ⑦디자인). 보고 헤더 단계 넘버링([단계 k/16]·[정렬 Lk/5]) + 모든 보고에 사용 Superpowers 명시. 자비스 프로젝트 폐기 표기. codex-plugin-cc 불채택(감리 본선은 기존 codex exec 배선 유지).
- v2.15 적용 범위: 상태판 갱신 게이트 편승 — phase-packet(00~04) 작성·완료 보고·main 반영·일시 정지 때 current-run 현재 위치/다음 행동을 함께 갱신(중간 상세는 packet에). 계기: 대표님 실측 "상태판이 업데이트가 안되잖아"(최근 결정 6/27 정지·다음 행동 Phase 8 시절 방치). 승인: "그러자"(A+ 선택).
- v2.14 적용 범위: 상태판(current-run) 원장 상한 규칙 — 최근 결정은 상태판에 최대 10줄, 초과분·phase 진행 이력은 approvals.md/changes.md 원장으로. twostarhub 상태판 다이어트(67KB→11.6KB, 이력 294건 무손실 이관) 후 재비대 방지를 템플릿·white7에 전파. 승인: 대표님 A안 + "정본, 화이트7에도 적용된거지?".
- 상태: 정본 (중앙 + twostarhub + white7 적용. 자비스는 프로젝트 폐기로 동기화 대상 제외)
- v2.13 적용 범위: 단정 전 검증 규칙 — 실행·디버깅 중 원인 판단은 검증 전 "가설"로 표기, 단정은 재현·로그·설정 확인 증거 확보 뒤에만. 버그·예상외 동작이면 즉흥 수정 전 `superpowers:systematic-debugging` 강제. 반례는 받고 접는 게 아니라 단정 전에 먼저 검토. thinking.md 6절(근거 수준)·5절(검증 가능하게)의 구체 적용. 계기: twostarhub 라이브 세션 실측("5273은 API가 없다" 검증 전 단정 → 대표님 반례 후 정정). 승인: 대표님 "그래 슈퍼파워 안에서 수정을 해야지 안되겠어, a로 하자".
- 적용 범위: 질문 담장 + 엔진 라벨 일괄 정합 + 라우터 포인터 삭제. (1) CLAUDE.md에 "대표님에게 묻는 것과 묻지 않는 것" 담장 신설 — 기술 선택·구현 방향·Phase 경계·팀리더 전환은 묻지 않고, 전환은 00-customer-outcome 닫히면 선언 후 자동 진행. `dubyeol2-pm` 스킬에 "전환은 선언, 질문 아님" 1줄. 계기: 대표님 실측("기술문제랑 팀리더 전환을 자꾸 물어봄"). (2) 규칙·템플릿류 스테일 라벨 일괄 정합 — thinking.md 전제(PM Codex→PM(Claude Code) 등), templates/phase-packet 03·04, phases.md 108-109, phases/README.md, PROJECT.md(템플릿), current-run.md·thinking.md 버전 표기 제거, rule-revision-process.md. (3) `$dubyeol2-router` 포인터 삭제(스킬 실존한 적 없음, 진입 판단은 파일 게이트가 수행. 재관찰 시 재검토 조건 revision에 명기).
- 승인 근거: 대표님 "그래"(묶음 승인) + "일단 정본하고 투스타허브까지만 적용해줘, 화이트7은 작업중이라서"(범위 확정).
- v2.11 적용 범위(이전): 중앙 report-format.md line 34 역드리프트 정정(+twostarhub 한 줄 동기화).
- v2.10 적용 범위(이전): 장시간 실행 오인 방지 규칙. `codex exec` 외부감리·Superpowers 실행은 장시간만으로 실패 판단 금지, 백그라운드로라도 완료 대기.
- v2.9 적용 범위(이전): 외부감리(Codex) 호출 메커니즘 명문화 + 스테일 라벨 정리. `codex exec`(gpt-5.5, read-only, --output-schema)로 명문화, `external-audit/result.schema.json` 신설.
- v2.9 적용 범위(이전): 외부감리(Codex) 호출 메커니즘 명문화 + 스테일 라벨 정리. `codex exec`(gpt-5.5, read-only, --output-schema)로 명문화, `external-audit/result.schema.json` 신설.
- v2.8 적용 범위(이전): 팀리더·빌더 스왑 — Team Leader·Builder = Codex → Claude Code. 빌드=Claude / 외부감리=Codex 분리 완성, 자가검수 인터림 해소.
- v2.7 적용 범위(이전): 역할 스왑 — PM = Codex → Claude Code, 외부감리 = Claude Code → Codex. `dubyeol2-pm` 스킬 신설, 감리 머신리 CLAUDE.md → AGENTS.md 이관.
- v2.6 적용 범위(이전): 두별2 사고법 문서 구조 개편, AGENTS.md/CLAUDE.md 경량화, `thinking.md` 사고법 정본화, `thinking-router.md` 적용 순서 분리, PM 구체화 동작 보강, 정렬 전 첫 답 최종안 확정 금지, 정렬된 고객 계약 안의 역할별 실행 책임 명시
- v2.6 적용 범위(이전): 두별2 사고법 문서 구조 개편, AGENTS.md/CLAUDE.md 경량화, `thinking.md` 사고법 정본화, `thinking-router.md` 적용 순서 분리, PM 구체화 동작 보강, 정렬 전 첫 답 최종안 확정 금지, 정렬된 고객 계약 안의 역할별 실행 책임 명시

## 포함된 정본

| 항목 | 상태 | 근거 |
|---|---|---|
| 두별2 사고법 v2 | 정본 | `revisions/thinking-v2-20260628.md` |
| 두별2 사고법 v1 | 보존 | `archive/thinking-v1-20260628.md` |
| 운영 규칙 개정 프로세스 | 정본 | `rule-revision-process.md` |
| PM 실제 동작 테스트 | PASS | `dry-runs/thinking-v2-pm-dry-run-20260628.md` |
| Phase 경계 확정 방식 v2.1 | 정본 | `revisions/phase-boundary-teamleader-brainstorming-v2.1-20260628.md` |
| Phase 경계 확정 방식 v2.1 드라이런 | PASS | `dry-runs/phase-boundary-v2.1-dry-run-20260628.md` |
| 사고법 적용 라우터 v2.2 | 정본 | `revisions/thinking-router-v2.2-20260628.md` |
| 사고법 적용 라우터 v2.2 드라이런 | PASS | `dry-runs/thinking-router-v2.2-dry-run-20260628.md` |
| 플랫폼 독립 원칙 v2.3 | 정본 | `revisions/platform-independent-principle-v2.3-20260628.md` |
| 플랫폼 독립 원칙 v2.3 드라이런 | PASS | `dry-runs/platform-independent-principle-v2.3-dry-run-20260628.md` |
| 사고법 실행 계약 v2.4 | 정본 | `revisions/thinking-execution-contract-v2.4-20260629.md` |
| 사고법 실행 계약 v2.4 드라이런 | PASS | `dry-runs/thinking-execution-contract-v2.4-dry-run-20260629.md` |
| 사고법 계층 정리 v2.5 | 정본 | `revisions/thinking-hierarchy-v2.5-20260629.md` |
| 사고법 계층 정리 v2.5 드라이런 | PASS | `dry-runs/thinking-hierarchy-v2.5-dry-run-20260629.md` |
| 사고법 문서 구조 개편 v2.6 proposal | 승인 후 드라이런 | `revisions/thinking-structure-v2.6-proposal-20260629.md` |
| 사고법 문서 구조 개편 v2.6 드라이런 | PASS | `dry-runs/thinking-structure-v2.6-dry-run-20260629.md` |
| 사고법 행동 보강 v2.6 | 정본 | `revisions/thinking-behavior-v2.6-amendment-20260629.md` |
| 사고법 행동 보강 v2.6 드라이런 | PASS | `dry-runs/thinking-behavior-v2.6-dry-run-20260629.md` |
| 두별2 사고법 정본 | 정본 | `thinking.md` |
| 두별2 사고법 적용 라우터 | 정본 | `thinking-router.md` |
| 역할 스왑 v2.7 (PM=Claude, 외부감리=Codex) | 정본 (중앙만) | `revisions/role-swap-pm-claude-audit-codex-v2.7-20260630.md` |
| 역할 스왑 v2.7 드라이런 | PASS | `dry-runs/role-swap-v2.7-dry-run-20260630.md` |
| `dubyeol2-pm` PM 동작 스킬 | 정본 | `~/.claude/skills/dubyeol2-pm/SKILL.md` |
| 팀리더·빌더 스왑 v2.8 (빌드=Claude, 감리=Codex 분리 완성) | 정본 (중앙만) | `revisions/tl-builder-swap-v2.8-20260630.md` |
| 팀리더·빌더 스왑 v2.8 드라이런 | PASS | `dry-runs/tl-builder-swap-v2.8-dry-run-20260630.md` |
| 외부감리 호출 메커니즘 v2.9 (codex exec, 모델 gpt-5.5) | 정본 (중앙만) | `revisions/audit-invocation-v2.9-20260630.md` |
| 외부감리 호출 메커니즘 v2.9 드라이런 | PASS | `dry-runs/audit-invocation-v2.9-dry-run-20260630.md` |
| 외부감리 result JSON Schema | 정본 | `external-audit/result.schema.json` |
| 장시간 실행 오인 방지 규칙 v2.10 (codex exec·Superpowers) | 정본 (중앙만) | `revisions/longrun-rule-v2.10-20260630.md` |
| 장시간 실행 오인 방지 규칙 v2.10 드라이런 | PASS | `dry-runs/longrun-rule-v2.10-dry-run-20260630.md` |
| report-format line 34 역드리프트 정정 v2.11 | 정본 (중앙+twostarhub) | `revisions/reportfmt-line34-fix-v2.11-20260630.md` |
| report-format line 34 정정 v2.11 드라이런 | PASS | `dry-runs/reportfmt-line34-fix-v2.11-dry-run-20260630.md` |
| 질문 담장 + 라벨 정합 + 라우터 삭제 v2.12 | 정본 (중앙+twostarhub) | `revisions/guardrail-labels-v2.12-20260630.md` |
| 질문 담장 v2.12 드라이런 (should-NOT-ask) | PASS | `dry-runs/guardrail-labels-v2.12-dry-run-20260630.md` |
| 단정 전 검증 v2.13 (systematic-debugging 강제) | 정본 (중앙+twostarhub+white7) | `revisions/verify-before-assert-v2.13-20260702.md` |
| 단정 전 검증 v2.13 드라이런 (5273 사례 재현) | PASS | `dry-runs/verify-before-assert-v2.13-dry-run-20260702.md` |
| 상태판 원장 상한 v2.14 (최근 결정 10줄) | 정본 (중앙+twostarhub+white7) | `revisions/currentrun-cap-v2.14-20260703.md` |
| 상태판 갱신 게이트 편승 v2.15 | 정본 (중앙+twostarhub+white7) | `revisions/statusboard-update-v2.15-20260704.md` |
| 상태판 갱신 v2.15 드라이런 | PASS | `dry-runs/statusboard-update-v2.15-dry-run-20260704.md` |
| 정렬 게이트화 v2.16 (L1~L5·발화분류·넘버링·Superpowers 보고) | 정본 (중앙+twostarhub+white7) | `revisions/alignment-gates-v2.16-20260704.md` |
| 정렬 게이트화 v2.16 드라이런 (실발화 분류) | PASS | `dry-runs/alignment-gates-v2.16-dry-run-20260704.md` |
| 기능 단위 배치 진행 v2.17 | 정본 (중앙+twostarhub+white7) | `revisions/feature-batch-report-v2.17-20260704.md` |
| 기능 단위 배치 v2.17 드라이런 | PASS | `dry-runs/feature-batch-report-v2.17-dry-run-20260704.md` |
| 디자인 트랙 v2.18 (design-flow.md) | 정본 (중앙+twostarhub+white7) | `revisions/design-track-v2.18-20260704.md` |
| 디자인 트랙 v2.18 드라이런 | PASS | `dry-runs/design-track-v2.18-dry-run-20260704.md` |
| Machine Check 확장 v2.19 (보안·실화면 QA) | 정본 (중앙+twostarhub+white7+물류) | `revisions/machinecheck-plus-v2.19-20260704.md` |
| Machine Check 확장 v2.19 드라이런 (브라우저 실측) | PASS | `dry-runs/machinecheck-plus-v2.19-dry-run-20260704.md` |
| DESIGN.md 규격 전환 v2.20 | 정본 (중앙+twostarhub+white7+물류) | `revisions/designmd-format-v2.20-20260704.md` |
| DESIGN.md 규격 v2.20 드라이런 (lint 실측 4파일) | PASS | `dry-runs/designmd-format-v2.20-dry-run-20260704.md` |
| 외부감리 신뢰성 v2.21 (격리 호출·프리플라이트·hang 판별) | 정본 (중앙+twostarhub+white7+물류) | `revisions/audit-reliability-v2.21-20260704.md` |
| 외부감리 신뢰성 v2.21 드라이런 (신 명령 실감리·병렬 실측) | PASS | `dry-runs/audit-reliability-v2.21-dry-run-20260704.md` |

## 동기화 대상

| 프로젝트 | 적용 버전 | 상태 | 검증 |
|---|---|---|---|
| 중앙 하네스 | v2.21 | 적용 | `AGENTS.md`, `CLAUDE.md`, `VERSION.md` 확인 |
| twostarhub | v2.21 | 동기화 완료 (2026-07-04) | 감리 명령 블록·approval 문구·hang 세칙 동기화, 라이브 파일 보존 |
| white7 | v2.21 | 동기화 완료 (2026-07-04) | 감리 명령 블록·approval 문구·hang 세칙 동기화, 라이브 파일 보존 |
| 물류 | v2.21 | 동기화 완료 (2026-07-04) | 감리 명령 블록·approval 문구·hang 세칙 동기화. PM 정렬 대기, git 미초기화 |
| 자비스 | — | **프로젝트 폐기 (2026-07-04, 대표님 지시)** | 동기화 대상 제외. 폴더는 보존(파일 삭제 금지선) |

> v2.7~v2.10은 역할 스왑(PM·팀리더·빌더=Claude, 외부감리=Codex)과 그 교차 엔진 호출 배선·운영 규칙이라 설치 프로젝트 전파 시 각 프로젝트의 두 엔진 동작이 동시에 바뀐다. 또한 v2.9~v2.10의 `codex exec` 호출은 각 설치 환경에 codex(gpt-5.5) 설치·인증이 전제다. v2.11은 report-format.md line 34 한 줄 정정(중앙+twostarhub 적용, white7 이미 보유). 자비스는 2026-07-04 프로젝트 폐기로 동기화 대상에서 제외됐다(폴더는 보존).

## 버전 규칙

- 운영 철학, 역할 경계, Phase gate, PM 사고법처럼 여러 프로젝트에 영향을 주는 규칙 변경은 하네스 버전을 올린다.
- 단일 프로젝트의 제품 맥락, 고객 약속, Phase 실행 결과는 하네스 버전을 올리지 않는다.
- 버전 승격 전에는 proposal, 대표님 승인, 기존 정본 archive, revision 기록을 남긴다.
- 버전 승격 후에는 설치 프로젝트에 동기화하고, PM이 실제 고객 흐름 -> 기능 약속 -> Phase 판단을 한 번 dry-run 한다.
