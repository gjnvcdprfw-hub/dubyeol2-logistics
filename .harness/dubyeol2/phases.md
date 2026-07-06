# phases.md

상태: PM 작성 (2026-07-06, Phase 11 완료·Feature 5 종료)

이 문서는 `feature.md`의 고객 약속을 달성하기 위한 phase 계획이다. 대표님 승인 대상은 아니다. 한 기능에도 여러 phase가 나올 수 있다.

`feature.md`, `phases.md`, `phase-packets/phase-n/00-customer-outcome.md`는 PM 계획이다. 구현용 `superpowers:writing-plans` 산출물이 아니다.

Phase 번호는 프로젝트 전체에서 계속 증가한다. feature가 바뀌어도 Phase 1로 리셋하지 않는다. 다음 Phase 번호는 `current-run.md`와 기존 `phases.md`의 마지막 번호 다음이다.

Team Leader는 같은 메인 Codex가 PM에서 전환한 역할이다. Team Leader는 phase와 `00-customer-outcome.md`를 받은 뒤 `superpowers:using-superpowers`, `superpowers:brainstorming`, `superpowers:writing-plans` 순서로 진행하고, 구현용 `superpowers:writing-plans` 산출물을 남긴 뒤 `superpowers:subagent-driven-development`로 Builder 서브에이전트에게 구현을 맡긴다. PM과 Team Leader는 직접 구현하지 않는다.

## PM과 Team Leader의 범위 경계

PM은 고객 결과 단위로 Phase를 제안한다. PM은 구현 항목을 나누거나 Builder Task를 확정하지 않는다.

Team Leader는 Superpowers 공식 workflow를 따르고, 구현은 `superpowers:subagent-driven-development`로 Builder 서브에이전트에게 맡긴다. 두별2는 세부 판단을 다시 묻지 않고, Superpowers 스킬을 지켰는지와 PM에게 되돌릴 고객 약속 변경이 있는지만 확인한다.

## 1. 연결된 feature

- 현재 feature: **Feature 5 — SKU 작업·정산 기초 + 예치금 충전 + 출고 포장/패킹리스트 기초** (승인 2026-07-06)
- 직전 feature: Feature 4 — 로그인 후 셀러 출고 요청·예치금 흐름 (Phase 7 외부감리 PASS·로컬 main 머지 완료)
- 직전 feature: Feature 3 — 두리무역 1:1 비공개 기준판 (Phase 6 외부감리 PASS·로컬 main 머지 완료)
- 직전: Feature 2 — 두리무역 전체 화면 (완료, Phase 4~5)
- 직전 feature: Feature 1 — 주문 접수 → 입고 확인 → 투명 견적 (완료 2026-07-05, Phase 1~3)
- feature 승인 상태: Feature 5 승인
- feature 승인일: 2026-07-06
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
| 6 | (Feature 3) 두리무역 1:1 비공개 기준판 — 제외 6종만 자리표시 | 전체 | 대표님이 원본과 나란히 보고 우리 회사용 수정 기준을 잡는다 | **완료·머지** (Claude 감리 PASS) | 완결 |
| 7 | (Feature 4) 견적 후 출고 요청·예치금 차감·출고 상태 확인 | 셀러 주문 상세 · 출고관리 · 예치금 관리 · 대시보드 홈 | 견적 확인 뒤 고객이 "보내달라" 결정을 끝낸다 | **완료·머지** (Claude 감리 PASS) | 완결 — Feature 4 종료 |
| 8 | (보류) 우리 회사용 수정·정식 운영 전환 | 전체 | 복사 기준판을 고객에게 보여도 되는 우리 회사 서비스로 바꾼다 | **보류** (대표님: "8은 일단 보류") | 보류 |
| 9 | (Feature 5) 상품/SKU 라인 구조 | 주문 접수 · 운영자 입고/검수 · 견적 | 상품별·SKU별 작업과 정산이 섞이지 않게 한다 | **완료·로컬 main 반영** (Claude 감리 PASS) | 완결 |
| 10 | (Feature 5) 예치금 충전 신청·운영자 입금 확인 | 예치금 관리 · 운영자 | 고객이 출고 전에 돈을 넣고, 운영자가 확인해 잔액을 맞춘다 | **완료·로컬 main 반영** (Claude 감리 PASS) | 완결 |
| 11 | (Feature 5) 출고요청·포장단위 마커·패킹리스트 기초 | 출고관리 · 주문 상세 · 운영자 | 출고 때 박스별 SKU 구성과 패킹리스트 근거를 남긴다 | **완료·로컬 main 반영** (Claude 감리 PASS) | 완결 — Feature 5 종료 |

## 3. Phase 상세

### Phase 9

- 고객 목표: 셀러와 운영자가 한 주문 묶음 안의 상품별·SKU별 수량, 입고, 검수, 견적, 정산 근거를 구분해 본다.
- 연결 고객 흐름: 흐름 1·2·3
- 연결 메뉴탭 / 화면 영역: 주문 접수, 주문 상세, 운영자 입고/검수, 운영자 견적, 셀러 견적 확인
- 연결 기능 약속: Feature 5 — SKU 작업·정산 기초 + 예치금 충전 + 출고 포장/패킹리스트 기초
- 필요한 이유: 현재는 주문 1건에 상품명·옵션·수량 한 줄만 있어 SKU별 부분 입고, 부분 하자, 단가 차이, 정산 근거를 표현할 수 없다.
- 이번 phase에서 되는 것: 주문 묶음, 상품 라인, SKU 라인, SKU별 옵션/수량/단가/입고수량/검수결과/하자수량/견적 근거, 주문 묶음 합계.
- 이번 phase에서 안 하는 것: 포장단위 마커, 박스별 무게/CBM, 패킹리스트 생성, 예치금 충전, 출고 상태 추적, 외부 1688 연동.
- 완료 기준: 셀러 A의 주문 묶음 1건에 SKU 3개가 있고, 운영자가 SKU별 입고/검수/견적을 기록하면 셀러 화면과 운영자 화면에서 같은 SKU별 작업·정산 근거가 보인다.
- 완료 결과: Machine Check PASS, Claude 교차 외부감리 PASS, `phase-packets/phase-009/04-completion.md` 작성 완료.
- Phase packet: `phase-packets/phase-009/`

### Phase 10

- 고객 목표: 셀러가 예치금 충전을 요청하고, 운영자 확인 뒤 잔액과 원장을 확인한다.
- 연결 고객 흐름: 흐름 3
- 연결 메뉴탭 / 화면 영역: 예치금 관리, 대시보드 홈, 운영자 예치금 확인 화면
- 연결 기능 약속: Feature 5 — SKU 작업·정산 기초 + 예치금 충전 + 출고 포장/패킹리스트 기초
- 필요한 이유: Phase 7은 예치금 차감까지 닫았지만, 고객이 직접 충전 요청하고 운영자가 잔액을 올리는 흐름이 아직 없다.
- 이번 phase에서 되는 것: 충전 요청, 충전 대기/승인/거절, 운영자 확인, 잔액 반영, 예치금 원장 기록.
- 이번 phase에서 안 하는 것: 실계좌 실제값 노출, PG/간편결제, 은행 API, 자동 입금 확인, 정식 운영 전환.
- 완료 기준: 셀러 A가 100,000원 충전을 요청하고 운영자가 승인하면 잔액과 원장·대시보드가 모두 같은 결과를 보여준다.
- 완료 결과: Machine Check PASS, Claude 교차 외부감리 PASS, `phase-packets/phase-010/04-completion.md` 작성 완료.
- Phase packet: `phase-packets/phase-010/`

### Phase 11

- 고객 목표: 셀러가 출고 요청 이후 포장단위와 배송 진행 상태를 확인하고, 운영자는 나중에 패킹리스트로 뽑을 수 있는 박스별 SKU 구성을 남긴다.
- 연결 고객 흐름: 흐름 2
- 연결 메뉴탭 / 화면 영역: 출고관리, 주문 상세, 대시보드 홈, 운영자 출고 처리 화면
- 연결 기능 약속: Feature 5 — SKU 작업·정산 기초 + 예치금 충전 + 출고 포장/패킹리스트 기초
- 필요한 이유: 출고는 SKU 단위 그대로 나가지 않고 박스 단위로 묶인다. 박스별 SKU 구성, 무게, CBM이 남아야 운임·출고·패킹리스트 근거가 맞는다.
- 이번 phase에서 되는 것: 출고요청, 포장단위 마커(예: BOX-1, BOX-2), 박스별 SKU 구성·수량, 박스별 무게/CBM, 운영자 수동 상태 입력, 셀러 화면 상태 반영, 패킹리스트 생성 기초 데이터.
- 이번 phase에서 안 하는 것: 외부 배송조회 API, 세관 API, 택배사 API, 자동 송장 동기화, 실제 배송 완료 확정, 정식 패킹리스트 PDF 자동 발행.
- 완료 기준: 운영자가 출고요청 주문의 SKU들을 BOX-1/BOX-2에 배정하고 박스별 무게/CBM을 입력하면, 셀러가 박스별 구성과 출고 상태를 확인할 수 있다.
- 완료 결과: Machine Check PASS, Claude 교차 외부감리 PASS, `phase-packets/phase-011/04-completion.md` 작성 완료. Feature 5 종료.
- Phase packet: `phase-packets/phase-011/`

### Phase 7

- 고객 목표: 셀러가 견적 완료 주문 1건을 출고 요청하고, 예치금 차감·내역·주문 상태·출고관리 상태를 확인한다.
- 연결 고객 흐름: 흐름 2
- 연결 메뉴탭 / 화면 영역: 셀러 주문 상세, 출고관리, 예치금 관리, 대시보드 홈
- 연결 기능 약속: Feature 4 — 로그인 후 셀러 출고 요청·예치금 흐름
- 필요한 이유: 견적을 보고도 출고/결제를 못 하면 서비스가 실제 매출 흐름으로 이어지지 않는다.
- 이번 phase에서 되는 것: 출고 요청, 예치금 잔액 확인, 예치금 차감, 예치금 내역 기록, 주문 상태 변경, 출고관리 상태 확인, 잔액 부족 방지.
- 이번 phase에서 안 하는 것: 실입금, 실계좌 노출, PG/간편결제, 외부 배송조회, 송장 발급, 통관 신고, 실제 창고 출고 처리, 반품/환불, 스마트오더/장바구니/내상품 고도화.
- 완료 기준: `phase-packets/phase-007/00-customer-outcome.md` §3의 실제 한 건 QA 예시 통과 + Machine Check·교차 외부감리 PASS.
- 다음 phase로 넘길 확인점: 운영자가 실제 출고 준비, 송장, 통관, 국내 배송 추적을 처리하는 후속 흐름.
- Phase packet: `phase-packets/phase-007/`

#### Phase 7 QA 시나리오

- 정상 흐름: 견적 완료 주문 1건 → 셀러 출고 요청 → 예치금 차감 → 예치금 내역 기록 → 주문 상세/출고관리/대시보드 상태 반영.
- 실패 흐름: 잔액 부족 시 출고 요청 완료 금지, 차감 실패 시 상태 변경 금지.
- 고객 피해 방지 기준: 셀러 간 주문·잔액·예치금 내역 격리, 실결제 오인 방지, 돈/상태 불일치 금지.
- 실제 한 건의 합격 예시: 셀러 A 예치금 300,000원, 견적 완료 주문 총액 118,400원, 출고 요청 후 잔액 181,600원과 차감 내역·상태 반영.

#### Phase 7 UI QA 시나리오

- UI 여부: 있음 (셀러 주문 상세 + 출고관리 + 예치금 관리 + 대시보드 홈)
- 고객이 화면에서 해야 하는 일: 견적 완료 주문을 출고 요청하고 예치금 차감과 출고 상태를 확인.
- 화면에서 절대 헷갈리면 안 되는 지점: 테스트 예치금과 실입금/실결제의 경계, 잔액 부족 시 완료 금지, 출고 요청과 실제 출고 완료의 차이.
- 실제 UI QA 별도 의뢰 필요 여부: 필요 (로컬 앱에서 실제 셀러 계정으로 정상/잔액부족/데이터 격리 확인)

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
