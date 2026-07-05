# changes.md

상태: 변경 기록 템플릿

두별2 운영 중 생긴 주요 변화만 기록한다. 모든 작업 로그를 여기에 쓰지 않는다.

이 파일은 증거 원장이다. 새 세션의 필수 정본은 `PROJECT.md`와 `current-run.md`이며, 변경 상세 확인이나 감사가 필요할 때만 이 파일을 연다.

## 1. 외부감리 FAIL 및 수정 요약

| 날짜 | Phase | FAIL 요약 | 고객 피해 가능성 | Codex 처리 | 재감리 결과 |
|---|---|---|---|---|---|
| 2026-07-04 | Phase 2 | MAJOR: 유료 검수 신청 건이 검수 결과 없이 RECEIVED 가능+사후 기록 경로 없음 / MINOR: 콘솔 로그 증거 정합, tsx 의존성 기록 누락 | 유료 신청 고객이 검수 결과를 못 받음 (약속 위반) | TL 분류 → Builder 수정: 신청 건 검수 필수 3계층(TDD)+문서 정정 2건 | **PASS** (r2, findings 0) |
| 2026-07-04 | Phase 3 | MAJOR: 고객 노출 라벨("수수료 5%", "¥1/개")에 요율 숫자 하드코딩 — rates.ts 컷팅 시 계산과 설명 분리 | 컷팅 후 셀러가 금액 근거를 잘못 이해 (투명 견적 약속 훼손) | TL 분류 → Builder 수정: 라벨을 RATES에서 파생(TDD)+접수 폼 라벨 포함 | **PASS** (r2, findings 0) |
| 2026-07-05 | Phase 4 | MAJOR 2: ①정본 3문서(PROJECT·current-run·phases)가 Feature 1 완료 상태로 잔존 — Phase 4 착수 시 상태판 갱신 누락 ②03 Superpowers 체크리스트 개별 행 미준수 | 다음 Phase·완료 보고의 기준 문서 엉킴 | PM/TL 직접 수정: 정본 3문서 Feature 2/Phase 4 정합화 + 체크리스트 14행 전개 | r2 FAIL(§3 게이트 표) → 갱신 → r3 FAIL(랜딩 FAQ ÷6,000 하드코딩) → 파생 수정+전수 grep → **r4 PASS (findings 0)** — 3회 FAIL 전부 문서·문구 정합성, 코드 결함 0 |
| 2026-07-05 | Phase 5 | MAJOR: 홈 예치금 배너에 '준비 중' 미표시 — 충전 버튼이 실기능처럼 보임 (거짓 기능 기준) | 셀러가 결제 기능 오해 | Builder 수정: 배지+안내 문구+라벨 '(준비 중)' (501b24f)+홈 재스냅샷 | **PASS** (r2, findings 0) |

## 2. design-system.md 정본 변경

| 날짜 | 변경 내용 | 이유 | 기준이 된 화면/판단 |
|---|---|---|---|
|  |  |  |  |

## 3. phase 범위 변경

| 날짜 | Phase | 변경 전 | 변경 후 | 이유 |
|---|---|---|---|---|
| 2026-07-05 | Phase 6 | 문구 전용 밀착 재작성(기능 불변), Machine Check PASS 후 교차 감리 대기 | 두리무역 1:1 비공개 기준판. 로고·이미지·실주소·전화번호·계좌·사업자정보만 제외, 디자인·기능·구조·문구·아이콘/이모티콘 포함. 공개 영역 기준판 Machine Check PASS, Claude 교차감리 대기 | 대표님이 "정확하게 두리무역을 그대로 1:1로 복사"와 Chrome 직접 대조를 명시 |

## 4. feature.md 재정렬

| 날짜 | 재정렬 사유 | 변경된 고객 약속 | 대표님 승인 여부 |
|---|---|---|---|
| 2026-07-05 | PM이 제안한 "문장 단위 밀착 재작성"이 대표님 의도보다 좁았음 | 정식 운영 전 내부 기준판으로 두리무역을 1:1 복사하고, 우리 회사용 수정 후 운영 시작 | 승인: "a로해" / "응 그래 내 크롬으로 디버깅해서 하나하나 복사해" |
| 2026-07-05 | 로그인 후 셀러 기능 전체가 너무 커서 첫 돈 흐름을 잘라야 했음 | 견적 완료 주문에서 출고 요청, 예치금 차감, 예치금 내역, 출고 상태 확인까지 먼저 구현. 실계좌·실입금·실결제·송장/통관/택배 추적은 제외 | 승인: "그래" |

## 5. 3회 실패 후 결정

| 날짜 | Phase | 실패 요약 | 대표님 판단 | 다음 행동 |
|---|---|---|---|---|
|  |  |  |  |  |

## 6. 중요한 예외 처리

| 날짜 | 예외 상황 | 처리 | 근거 | 재발 방지 |
|---|---|---|---|---|
| 2026-07-04 | 의존성 추가: `tsx` (devDependency, Phase 2 시드 스크립트 실행용) | 유지 + 기록 | Phase 2 플랜(2026-07-04-phase-002-inbound-evidence.md Task 1)에 명시 + 대표님 포괄 승인("승인할게 두별2에 맞게 진행해") 범위 내. 외부감리 MINOR 지적으로 원장 기록 보완 | 이후 의존성 추가는 request.json files_changed에 package.json 포함 |
| 2026-07-05 | Playwright MCP 프로필 락 | Chrome headless DevTools Protocol로 실화면 QA 대체 | `03-verification.md` §3.2. 동일 로컬 URL 23개를 실제 Chrome 엔진으로 열어 HTTP 200, H1, console error 0 확인 | 다음 세션에서 Playwright MCP 락이 풀리면 Playwright로 재검증 가능. 현재 PASS 근거는 Chrome QA |
| 2026-07-05 | Phase 6 교차감리 대기 중 Feature 4 착수 | Phase 6 Feature 3 계약을 `phase-packets/phase-006/feature-contract-snapshot.md`로 보존하고, 외부감리 요청의 `feature_md`를 스냅샷으로 고정 | Mode B에서는 Phase 6 완료·main 머지는 교차감리 PASS 전 금지지만, 다음 Phase 준비·빌드는 가능 | 감리자는 Phase 6 스냅샷을 기준으로 보고, `feature.md`는 현재 Feature 4 기준으로 본다 |
| 2026-07-05 | Phase 7 보안 검토 대체 | Codex Mode B 환경에 `/security-review` 슬래시 명령 실행 도구가 없어 정적 권한 검사, 지갑 테스트, live QA 교차 셀러 404로 대체 | Phase 7은 예치금·셀러 권한을 건드리므로 `phase-packets/phase-007/03-verification.md` §3.1에 증거와 한계를 명시 | Claude 교차감리에서 seller isolation과 wallet state를 별도 확인 |
| 2026-07-06 | Phase 6 외부감리 MINOR | 전체 테스트 최초 1회 FK 제약 일시 실패 후 즉시 재실행 PASS. 고객 약속에는 영향 없음 | `external-audit/result-phase-006.json` | 테스트 DB 격리 개선 후보로 보관 |
| 2026-07-06 | Phase 7 외부감리 MINOR 해소 | Task 3 화면 변경 커밋 추적성 지적 | 구현·증거 커밋 `776d1e8`로 화면 변경과 감리 증거를 커밋 | `04-completion.md` 작성 전 커밋 완료 |
