# phases.md

상태: PM 작성 (2026-07-04, Phase 1 경계는 Team Leader 범위 판단 후 확정)

이 문서는 `feature.md`의 고객 약속을 달성하기 위한 phase 계획이다. 대표님 승인 대상은 아니다. 한 기능에도 여러 phase가 나올 수 있다.

`feature.md`, `phases.md`, `phase-packets/phase-n/00-customer-outcome.md`는 PM 계획이다. 구현용 `superpowers:writing-plans` 산출물이 아니다.

Phase 번호는 프로젝트 전체에서 계속 증가한다. feature가 바뀌어도 Phase 1로 리셋하지 않는다. 다음 Phase 번호는 `current-run.md`와 기존 `phases.md`의 마지막 번호 다음이다.

Team Leader는 같은 메인 Codex가 PM에서 전환한 역할이다. Team Leader는 phase와 `00-customer-outcome.md`를 받은 뒤 `superpowers:using-superpowers`, `superpowers:brainstorming`, `superpowers:writing-plans` 순서로 진행하고, 구현용 `superpowers:writing-plans` 산출물을 남긴 뒤 `superpowers:subagent-driven-development`로 Builder 서브에이전트에게 구현을 맡긴다. PM과 Team Leader는 직접 구현하지 않는다.

## PM과 Team Leader의 범위 경계

PM은 고객 결과 단위로 Phase를 제안한다. PM은 구현 항목을 나누거나 Builder Task를 확정하지 않는다.

Team Leader는 Superpowers 공식 workflow를 따르고, 구현은 `superpowers:subagent-driven-development`로 Builder 서브에이전트에게 맡긴다. 두별2는 세부 판단을 다시 묻지 않고, Superpowers 스킬을 지켰는지와 PM에게 되돌릴 고객 약속 변경이 있는지만 확인한다.

## 1. 연결된 feature

- 현재 feature: **Feature 3 — 카피 밀착 + 예치금 결제** (승인 2026-07-05, Phase 6~7)
- 직전: Feature 2 — 두리무역 전체 화면 (완료, Phase 4~5)
- 직전 feature: Feature 1 — 주문 접수 → 입고 확인 → 투명 견적 (완료 2026-07-05, Phase 1~3)
- feature 승인 상태: Feature 2 승인
- feature 승인일: 2026-07-05
- feature 문서: `.harness/dubyeol2/feature.md`

## 2. 전체 phase 요약

프로젝트 전체 누적 Phase 목록이다. 기술, 화면, feature가 달라도 고객 결과 순서대로 다음 번호를 이어 붙인다.

| Phase | 고객 목표 | 연결 메뉴탭 | 필요한 이유 | 상태 | 다음으로 필요한 packet |
|---|---|---|---|---|---|
| 1 | 가입·로그인 → 주문 접수(유료 검수 선택) → 내 주문 목록 확인 | 주문 접수 · 대시보드(주문 목록) | "주문을 맡길 수 있다"가 모든 것의 입구 | **완료·머지** (감리 PASS) | 완결 |
| 2 | 운영자 입고·확인 기록 → 셀러가 입고 증거(사진·외포장·유료 검수 결과) 확인 | 대시보드(입고 관리) | "내 물건을 증거로 확인한다" | **완료·머지** (감리 r2 PASS) | 완결 |
| 3 | 항목별 견적(두리무역 요율 초기값) 확인 → Feature 1 합격 예시 전체 통과 | 대시보드(견적) | "총비용을 알고 보낼지 결정한다" | **완료·머지** (감리 r2 PASS) | 완결 — Feature 1 종료 |
| 4 | (Feature 2) 두리무역 공개 영역 전체 화면 — 랜딩 풀·9메뉴·소개 4종·계산기·정보 페이지 | 공개 사이트 전체 | "완성된 서비스로 보인다" | **완료·머지** (감리 r4 PASS) | 완결 |
| 5 | (Feature 2) 대시보드 12메뉴 전면 개편 — 예치금 배너·현황 카드·전 메뉴 셸 | 셀러 대시보드 | 이후 기능이 들어갈 자리 | **완료·머지** (감리 r2 PASS) | 완결 — Feature 2 종료 |
| 6 | (Feature 3) 전 화면 카피를 두리무역 밀도로 밀착 재작성 (기능 불변) | 전체 | "같은 밀도의 안내" | 진행 중 | `phase-packets/phase-006/` |
| 7 | (Feature 3) 예치금 충전(무통장·수동 확인)·견적 결제·거래 내역 | 예치금·견적 | "돈이 도는 서비스" | 준비 전 | `phase-packets/phase-007/` |

## 3. Phase 상세

### Phase 1

- 고객 목표: 셀러가 주문 접수 → (운영이 입고·확인 기록) → 대시보드에서 입고 증거·(유료 신청 시)검수 결과·항목별 견적 확인까지 스스로 완결
- 연결 고객 흐름: 흐름 1
- 연결 메뉴탭 / 화면 영역: 셀러 주문 접수 화면 · 셀러 대시보드
- 필요한 이유: feature.md 1번 — 깜깜이 해소가 첫 신뢰 관문
- 이번 phase에서 되는 것: feature.md 4번(주문 접수, 입고 등록+기본 입고확인, 유료 검수 기록, 대시보드 확인) + 이를 위한 최소 기반(셀러 로그인/가입, 운영자 입고·검수 입력 화면)
- 이번 phase에서 안 하는 것: feature.md 5번(LCL·통관·추적, 1688 자동연동, AI HS코드, 3PL/WMS 고도화, 실결제 자동화)
- 완료 기준: feature.md 6번 합격 예시 1건이 실제 화면에서 통과 + Machine Check·외부감리 PASS
- 다음 phase로 넘길 확인점: 견적 확인 후 "국제배송 보내기"로 이어지는 진입점(다음 feature 연결 지점)만 자리 표시
- Phase packet: `phase-packets/phase-001/`
- 벤치마크 기준: 메뉴·기능·요율 `benchmark-duly.md`, UI 토큰 `design-system.md` (두리무역 그대로, 추후 대표님 컷팅)

#### Phase QA 시나리오

- 정상 흐름: feature.md 7.1 (주문 접수 → 입고 등록·사진·외포장 기록·(신청 건)검수 → 대시보드 확인)
- 실패 흐름: feature.md 7.2 (외포장 파손 안내, 유료 검수 건 수량 불일치 97/100 표시)
- 고객 피해 방지 기준: feature.md 7.3 (셀러 간 데이터 격리) + 검수 미신청 건 "수량 미확인" 명시
- 실제 한 건의 합격 예시: feature.md 6번 (미니가전 셀러 A, 100개, 유료 검수 신청 건)

#### UI QA 시나리오

- UI 여부: 있음 (주문 접수 + 대시보드 + 운영자 입고/검수 입력)
- 고객이 화면에서 해야 하는 일: 주문 접수, 입고·검수·견적 확인
- 화면에서 절대 헷갈리면 안 되는 지점: 기본(입고사진+외포장)과 유료 검수의 경계, 견적 항목별 금액, 내/남 주문 구분
- 실제 UI QA 별도 의뢰 필요 여부: 필요 (Playwright MCP로 Machine Check 시 QA 시나리오 확인 + design-system.md lint)

#### Superpowers 실행 기준

Team Leader는 이 phase와 `00-customer-outcome.md`를 받을 때 `superpowers:using-superpowers`부터 시작한다. PM은 Superpowers와 `superpowers:brainstorming`을 하지 않는다.

필요 후보:

- `superpowers:using-superpowers`
- `superpowers:brainstorming`
- `superpowers:using-git-worktrees`
- `superpowers:writing-plans`
- `superpowers:subagent-driven-development`
- `superpowers:test-driven-development`
- `superpowers:requesting-code-review`
- `superpowers:receiving-code-review`
- `superpowers:systematic-debugging`
- `superpowers:verification-before-completion`
- `superpowers:finishing-a-development-branch`

#### Phase packet 게이트

새 Phase부터는 아래 파일이 다음 단계의 입장권이다.

| 파일 | 작성자 | 열리는 다음 단계 |
|---|---|---|
| `00-customer-outcome.md` | PM | Team Leader 진입 |
| `01-teamleader-intake.md` | Team Leader | `superpowers:writing-plans` |
| `02-plan.md` | Team Leader | Builder 실행 |
| `03-verification.md` | Team Leader | PM 완료 보고 |
| `04-completion.md` | PM | 머지 승인 요청 또는 다음 Phase 준비 |

## 4. 자동 진행 원칙

- phase 하나가 대표님 승인 후 로컬 main에 머지되면 다음 phase로 자동 진행한다.
- Phase 완료 후 PM이 고객 변화, 완료 태스크, 검증 결과, 외부감리 결과, 사용한 Superpowers 스킬 목록, 확인 불가한 Superpowers 스킬 목록, 남은 위험, 다음 행동을 묶어 전체 보고해야 한다.
- Phase 완료 전체 보고가 없으면 Phase close, 머지 승인 요청, 다음 phase 진행으로 넘어가지 않는다.
- `04-completion.md`가 없으면 Phase close, 머지 승인 요청, 다음 phase 진행으로 넘어가지 않는다.
- 다음 phase가 새 feature에 속하더라도 Phase 번호는 이어서 증가한다.
- 외부감리 PASS만으로 main 머지하지 않는다.
- 대표님 승인 없이 `git push`, deploy, 원격 머지, 실서비스 변경, 유료 API 실호출, 실DB 쓰기, secret 출력 또는 커밋은 하지 않는다.

## 5. 실패 처리

- 기계검증 실패: Codex 외부감리 호출 전 Claude Code Team Leader가 문제를 분류하고 Builder 서브에이전트가 수정한다.
- 외부감리 FAIL: Claude Code Team Leader가 받아 분류하고 Builder 서브에이전트가 최대 3회 수정 루프를 진행한다.
- 외부감리 BLOCKED: 대표님 판단이 필요한 상태로 중단 보고한다.
- 오래 걸림만으로 실패 판단하지 않는다.
