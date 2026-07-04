# report-format.md

두별2 하네스 진행 보고는 기본 3~5줄이다. 대표님에게는 고객이 겪는 일 언어만 쓴다. 평상시 일반 대화, 단순 질문 답변, 짧은 확인에는 이 형식을 붙이지 않는다.

이 파일은 보고 형식 원문이다. 기본 보고 형식은 `current-run.md`에도 요약되어 있으므로, 새 세션에서 매번 이 파일을 읽지 않는다. 보고 형식 변경이나 감사가 필요할 때만 연다.

두별2 하네스 진행 보고, 단계 전환, 감리, 기능 완료 보고는 첫 줄에 현재 담당자를 먼저 밝힌다. 대표님에게 보이는 말은 기본적으로 PM이 전달한다.

## 1. 기본 보고 형식

```markdown
[담당자] - PM
[Phase n][단계 k/16][Task n][진행자][진행상태]

- 목표: 이번 Phase에서 고객이 ___할 수 있게 한다.
- 지금 하는 일:
  - ___
  - ___
- 확인된 것: ___
- 막힌 것: 없음 또는 ___
- 사용한 Superpowers: ___ (그 구간에서 쓴 스킬명, 없으면 없음)
- 다음: [Phase n][Task n][진행상태] ___
```

`단계 k/16`은 운영 계약 16단계 번호다. PM 정렬 구간은 `[정렬 Lk/5 층명]` 헤더를 쓴다. 매 보고에 그 구간에서 사용한 Superpowers 스킬명을 명시한다.

phase 개발 구간의 `진행상태`는 현재 적용 중인 정확한 Superpowers 스킬명으로 쓴다.

`Phase n`은 프로젝트 전체 누적 Phase 번호 기준이다. feature, 기술, 화면이 바뀌어도 `n`은 1로 리셋하지 않는다. Task 번호는 각 Phase 안에서 `Task 1`부터 다시 시작한다.

PM, Machine Check 게이트, 외부감리처럼 Superpowers를 쓰지 않는 구간은 고객 언어 상태로 쓴다. 대표님에게 보이는 보고는 항상 PM이 전달한다. PM은 정렬된 기준 안에서 판단하고, 기준 밖이면 대표님에게 한 가지 질문으로 가져온다.

`superpowers:brainstorming`은 PM이 하지 않는다. Team Leader가 phase와 `00-customer-outcome.md`를 받은 뒤 진행하고 `01-teamleader-intake.md`를 남긴다.

`feature.md`, `phases.md`, `00-customer-outcome.md`는 PM 계획이다. Team Leader는 `superpowers:writing-plans`를 사용해 구현 계획을 남기고 `02-plan.md`에 연결한 뒤에만 TDD나 구현으로 넘어간다.

PM은 후보 고객 결과 요청을 고객 언어로 제안한다. Phase 경계는 Team Leader의 `superpowers:brainstorming` 범위 판단을 받은 뒤 확정한다. Team Leader는 Superpowers 공식 workflow를 따르고, 구현은 Builder 서브에이전트에게 맡긴다. 두별2는 세부 판단을 다시 묻지 않고, Superpowers 스킬 준수 여부와 PM에게 되돌릴 고객 약속 변경만 확인한다.

두별2 각 단계 진입 전에는 PM이 이 형식으로 보고한다. `막힌 것`이 `없음`이면 보고 후 자동 실행한다.

## 2. 담당자 값

- PM
- 팀리더
- 빌더
- 외부감리자

## 3. 진행자 값

- PM
- Team Leader
- Builder
- Claude Code

## 4. 진행상태 규칙

phase 개발 구간은 아래처럼 Superpowers 스킬명을 그대로 쓴다.

- `superpowers:using-superpowers`
- `superpowers:brainstorming`
- `superpowers:using-git-worktrees`
- `superpowers:writing-plans`
- `superpowers:subagent-driven-development`
- `superpowers:dispatching-parallel-agents`
- `superpowers:executing-plans`
- `superpowers:test-driven-development`
- `superpowers:systematic-debugging`
- `superpowers:requesting-code-review`
- `superpowers:receiving-code-review`
- `superpowers:verification-before-completion`
- `superpowers:finishing-a-development-branch`
- `superpowers:writing-skills`

Superpowers를 쓰지 않는 구간은 고객 언어 상태를 쓴다.

- 레포 읽는 중
- 목표 정렬 중
- feature.md 승인 대기
- phases.md 작성 중
- 고객 결과 요청 작성 중
- Team Leader intake 중
- Machine Check 게이트 중
- 외부감리 중
- Phase packet 검증 중
- 기능 완료 보고 중
- 다음 Phase 준비 중
- 중단: 대표님 판단 필요

Machine Check 게이트는 별도 진행자가 아니라 Team Leader가 Phase 종료 전에 수행하는 자동 검증 묶음이다.

## 5. Superpowers 전체 체크리스트 보고

매 Phase 종료 전 Team Leader가 아래 체크리스트를 `phase-packets/phase-n/03-verification.md`에 남긴다. 모든 스킬을 매번 쓰라는 뜻이 아니라, 전체 목록 중 `사용`, `해당없음`, `확인불가`와 증거를 기록해 누락을 막는 기준이다.

| Superpowers skill | 상태 | 증거/사유 |
|---|---|---|
| `superpowers:using-superpowers` |  |  |
| `superpowers:brainstorming` |  |  |
| `superpowers:using-git-worktrees` |  |  |
| `superpowers:writing-plans` |  |  |
| `superpowers:subagent-driven-development` |  |  |
| `superpowers:dispatching-parallel-agents` |  |  |
| `superpowers:executing-plans` |  |  |
| `superpowers:test-driven-development` |  |  |
| `superpowers:systematic-debugging` |  |  |
| `superpowers:requesting-code-review` |  |  |
| `superpowers:receiving-code-review` |  |  |
| `superpowers:verification-before-completion` |  |  |
| `superpowers:finishing-a-development-branch` |  |  |
| `superpowers:writing-skills` |  |  |

PM 완료 보고에는 이 체크리스트 중 `사용` 상태인 스킬 목록과 `확인불가` 상태인 스킬 목록을 반드시 요약한다.

## 6. 단계 진입 전 보고 예

```markdown
[담당자] - PM
[Phase 1][Task -][PM][Team Leader 진입 전]

- 목표: 고객이 /market에서 시장 분석을 시작하고 접수 상태를 확인한다.
- 지금 하는 일:
  - 승인된 phase를 Team Leader에게 넘기기 전이다.
  - Team Leader가 `superpowers:using-superpowers`부터 시작할 수 있게 상태를 확인한다.
- 확인된 것: feature.md, phases.md, 00-customer-outcome.md는 PM 계획이고, 구현용 `superpowers:writing-plans` 산출물은 Team Leader가 별도로 쓴다.
- 막힌 것: 없음
- 다음: [Phase 1][Task -][superpowers:using-superpowers] 자동으로 Team Leader가 시작한다.
```

## 7. PM 정렬 보고 예

```markdown
[담당자] - PM
[Phase -][Task -][PM][목표 정렬 중]

- 목표: 고객이 실제로 끝내야 하는 일을 feature.md로 닫는다.
- 지금 하는 일:
  - 고객 약속과 이번에 안 할 일을 분리하고 있다.
  - 통과해도 실패인 경우를 하나 찾고 있다.
- 확인된 것: 정렬된 기준 안에서는 PM이 판단하고, 고객/돈/업무 기준이 흔들릴 때만 대표님께 묻는다.
- 막힌 것: 고객에게 절대 생기면 안 되는 일을 하나 확인해야 한다.
- 다음: [Phase -][Task -][목표 정렬 중] 한 가지 질문만 드린다.
```

## 8. phase 진행 보고 예

```markdown
[담당자] - PM
[Phase 1][Task 2][Builder][superpowers:test-driven-development]

- 목표: 고객이 파일을 올리고 접수 여부를 확인할 수 있게 한다.
- 지금 하는 일:
  - 접수 성공/실패 흐름을 먼저 검증하고 있다.
  - 고객이 보는 결과가 달라지는 지점을 확인하고 있다.
- 확인된 것: 실패하면 고객에게 접수 여부가 불분명해지는 지점이 있다.
- 막힌 것: 없음
- 다음: [Phase 1][Task 2][Machine Check 게이트 중] 고객이 보는 결과까지 완성한 뒤 기계검증으로 넘긴다.
```

## 9. `superpowers:writing-plans` 완료 후 태스크 목록 보고 예

```markdown
[담당자] - PM
[Phase 1][Task 0][PM][superpowers:writing-plans 완료]

- 목표: 고객이 /market에서 시장 분석을 시작하고 접수 상태를 확인한다.
- 지금 하는 일:
  - Team Leader가 만든 태스크 목록을 대표님에게 보고한다.
  - 동시 운영 가능한 태스크 수를 확인한다.
- 확인된 것: Team Leader가 `superpowers:writing-plans`를 끝냈고, `02-plan.md`에 실행 태스크 4개를 연결했다.
- 태스크 목록:
  1. 접수 상태 저장 구조
  2. /market 접수 요청 흐름
  3. 접수 상태 표시 UI
  4. 고객 기준 검증
- 막힌 것: 없음
- 다음: [Phase 1][Task 1][superpowers:subagent-driven-development] 자동으로 배정한다.
```

## 10. Phase 완료 기록 예 (`04-completion.md` 정리 — phase 단위로는 대표님 보고 없음)

```markdown
[담당자] - PM
[Phase 2][단계 14/16][Task 완료][PM][Phase 완료 전체 보고]

- 목표: 고객이 파일을 올리고 접수 여부를 확인할 수 있게 한다.
- 완료된 일:
  1. 접수 상태 저장 구조
  2. 접수 요청 흐름
  3. 접수 상태 표시 UI
- 확인된 것: `03-verification.md` 기준 Machine Check와 Codex 외부감리는 통과했다.
- 사용한 Superpowers: `superpowers:using-superpowers`, `superpowers:brainstorming`, `superpowers:writing-plans`, `superpowers:subagent-driven-development`, `superpowers:test-driven-development`, `superpowers:verification-before-completion`
- 확인 불가 Superpowers: 없음
- 남은 위험: 없음 또는 ___
- 다음: [Phase 3][Task -][다음 Phase 준비 중] 로컬 main 자동 머지 후 같은 기능의 다음 phase로 넘어간다(마지막 phase면 기능 완료 보고).
```

`04-completion.md`가 없으면 Phase close와 다음 Phase 진행으로 넘어가지 않는다. 기능의 모든 phase가 끝난 뒤에는 기능 완료 보고 없이 다음 기능 정렬로 넘어가지 않는다.

## 11. 기능 완료 보고 예

```markdown
[담당자] - PM
[Phase 46~48][단계 16/16][기능 완료][PM][기능 완료 보고]

- 목표: 고객이 파일을 올리고 접수 여부를 확인할 수 있게 한다. (기능 약속 전체)
- 완료된 phase: 46 접수 저장(감리 PASS) · 47 요청 흐름(감리 2차 PASS) · 48 상태 표시 UI(감리 PASS) — 전부 로컬 main 머지됨
- 사용한 Superpowers: `superpowers:using-superpowers`, `superpowers:brainstorming`, `superpowers:writing-plans`, `superpowers:subagent-driven-development`, `superpowers:test-driven-development`, `superpowers:verification-before-completion`
- 확인 불가 Superpowers: 없음
- 남은 위험: 없음 또는 ___
- 다음: 대표님 확인 후 다음 기능 정렬. 원격 push가 필요하면 별도 승인을 요청한다.
```

## 12. 중단 보고 예

```markdown
[담당자] - PM
[Phase 1][단계 13/16][Task 3][PM][중단: 대표님 판단 필요]

- 목표: 고객이 결제 실패 이유를 확인할 수 있게 한다.
- 지금 하는 일:
  - 외부감리 결과를 고객 언어로 정리한다.
  - 대표님 판단이 필요한 지점만 분리한다.
- 확인된 것: Codex 외부감리 결과, 실패 이유를 얼마나 자세히 보여줄지 결정이 필요하다.
- 막힌 것: 고객에게 카드사 사유까지 보여줄지 대표님 판단이 필요하다.
- 다음: [Phase 1][Task 3][중단: 대표님 판단 필요] 이 판단이 닫히면 phase를 계속 진행한다.
```
