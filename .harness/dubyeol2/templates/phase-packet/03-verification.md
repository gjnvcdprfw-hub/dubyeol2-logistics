# Phase {{PHASE_NUMBER}} Verification

상태: 검증 전

이 파일은 Builder 결과, Superpowers 검증, Machine Check, Codex 외부감리를 한 Phase 안에서 분리해 기록한다.

## 1. Builder 결과

- 완료된 Builder Task:
- 미완료 / 제외된 Builder Task:
- 고객 결과 기준 요약:

## 2. Superpowers 전체 스킬 체크

전체 목록 중 이번 Phase에서 사용한 스킬, 해당 없는 스킬, 확인 불가한 스킬을 모두 표시한다.

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

PM 완료 보고에는 `사용` 상태인 스킬 목록과 `확인 불가` 상태인 스킬 목록을 반드시 요약한다.

## 3. Machine Check

- 결과: PASS / FAIL / BLOCKED / 미실행
- 확인한 것:
- 근거:
- 실패 또는 미실행 사유:

### 3.1 보안 검토 (조건부 필수)

인증, 결제, 개인정보, 권한(구독), 외부 연동, secret을 건드린 Phase는 `/security-review`를 실행한다. 이 칸이 비어 있으면 03은 미완이다.

- 실행 여부: 실행 / 해당없음 (해당없음이면 사유 필수)
- 사유 또는 결과 요약:
- 심각 발견(있으면 Machine Check FAIL 처리):

### 3.2 실화면 QA (조건부 필수)

UI가 있는 Phase는 Playwright MCP로 로컬 앱을 실제로 열어 QA 시나리오를 확인한다. 로컬·개발 환경 한정 — 외부 실서비스 조작 금지. 이 칸이 비어 있으면 03은 미완이다.

- 실행 여부: 실행 / 해당없음 (해당없음이면 사유 필수)
- 확인한 시나리오와 결과:
- 증거(스크린샷 경로 등):

## 4. Codex 외부감리

- 요청 여부:
- 결과: PASS / FAIL / BLOCKED / 미실행
- 요청 파일:
- 결과 파일:
- 실패 또는 미실행 사유:

## 5. PM 완료 보고 판정

- PM 완료 보고 가능 여부:
- 남은 위험:
