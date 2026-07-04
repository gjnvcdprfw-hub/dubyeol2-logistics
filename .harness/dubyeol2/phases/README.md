# phases evidence

이 폴더는 phase별 증거를 남기는 곳이다.

각 phase는 필요할 때 아래 구조를 만든다.

```text
phase-001/
  handoff.md
  machine-check.md
  external-audit.md
  approval-report.md
```

## 1. handoff.md

Team Leader가 Builder에게 넘기는 phase 목표와 작업 단위다.

담을 것:

- phase 고객 목표
- 이번 phase에서 되는 것
- 이번 phase에서 안 하는 것
- phase QA 시나리오
- UI QA 시나리오
- Superpowers 적용 스킬명
- 다음 phase로 넘길 확인점

## 2. machine-check.md

기계검증 결과다.

담을 것:

- 실행한 빌드/테스트/검증
- 고객 예시 검증 결과
- UI가 있으면 콘솔 오류, 주요 흐름, 디자인 시스템 중 기계가 볼 수 있는 기준
- 실패가 있으면 Codex 외부감리 호출 전 빌드 측(Claude Code)이 수정해야 할 내용

## 3. external-audit.md

Codex 외부감리 결과다.

담을 것:

- 요청 패킷 요약
- PASS/FAIL/BLOCKED 판정
- FAIL이면 Claude Code Team Leader가 분류하고 Builder 서브에이전트가 처리할 문제
- BLOCKED이면 PM에게 넘길 고객 언어 질문 하나

## 4. approval-report.md

PM이 대표님에게 올린 phase 머지 승인 보고다.

담을 것:

- 고객에게 생긴 변화
- 확인한 것
- UI QA 시나리오 준비 여부
- 실제 UI QA 별도 의뢰 대상 여부
- 대표님 승인 여부

## 5. 원칙

- 오래 걸림만으로 실패 판단하지 않는다.
- 외부감리 PASS만으로 main에 머지하지 않는다.
- 대표님 승인 후 로컬 main에 머지한다.
- phase 하나가 머지되면 다음 phase로 자동 진행한다.
