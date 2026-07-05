# Phase 6 Plan

상태: TL 작성 완료 (2026-07-05). 원본 plan: 이 문서가 겸함(문구 전용 — 코드 플랜 불요, superpowers:writing-plans의 File Structure·검증 규격 준수)

## Builder Task (3개 병렬 — 파일 겹침 없음)

| BT | 대상 파일 | 벤치 참조 (benchmark-duly.md) |
|---|---|---|
| BT19 | src/app/page.tsx, services/* 4종 | §4.1~4.2·§5 + 서비스 소개 원문 수집부 |
| BT20 | calculators/* (허브·10종), guide/* 3종, about, search, tracking, components/public/* | §3(요율 문구)·§4.4~4.5·§2.8 |
| BT21 | dashboard/* 전 화면(문구만), components/dashboard/* | §2.1~2.12 |

## 공통 규칙 (전 Builder)

1. **문자열만 교체** — JSX 구조·로직·경로·클래스 변경 금지 (예외: 문장 추가로 <p> 등 텍스트 요소 추가는 허용)
2. benchmark 원문을 읽고 → 같은 위치에 같은 내용·정보량·길이로 **재작성** (원문 문장 복제 금지 — 조사·어순만 바꾼 수준도 금지, 의미 동일하되 표현 재구성)
3. 숫자는 전부 기존 RATES/PRICING 파생 유지 — 하드코딩 신규 유입 금지
4. "준비 중" 표기·면책 문구는 유지(제거 금지)
5. 검증: `npm run build` (BT19·20은 vitest 금지 — 공유 DB. BT21도 금지. build만) + 커밋 명시 add

## 검증 (TL Machine Check)

- vitest 36/36 + build + design lint + **원문 대조**: benchmark-duly.md의 두리 원문 문장 20개 샘플을 골라 src/ grep → 0건 + Playwright 대표 화면 렌더

## 실행 제한

- 하지 않는 것: 기능·스키마·API 변경, 이미지·로고 추가
- 넘지 않는 선: 두리 원문·실데이터 코드 반입 금지, push 금지
