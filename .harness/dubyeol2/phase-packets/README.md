# Phase Packets

이 폴더는 두별2 v1 Phase별 진행 증거를 둔다.

새 Phase를 시작할 때 `.harness/dubyeol2/templates/phase-packet/`의 5개 템플릿을 복사해 `phase-packets/phase-n/`을 만든다.

```text
phase-packets/phase-001/
├── 00-customer-outcome.md
├── 01-teamleader-intake.md
├── 02-plan.md
├── 03-verification.md
└── 04-completion.md
```

게이트 기준:

- `00-customer-outcome.md` 없이는 Team Leader로 넘어가지 않는다.
- `01-teamleader-intake.md` 없이는 `superpowers:writing-plans`로 넘어가지 않는다.
- `01-teamleader-intake.md`에서는 `superpowers:brainstorming` 사용 여부와 PM 복귀 필요 여부만 확인한다.
- `02-plan.md` 없이는 Builder 실행으로 넘어가지 않는다.
- `03-verification.md` 없이는 PM 완료 보고로 넘어가지 않는다.
- `04-completion.md` 없이는 머지 승인 요청 또는 다음 Phase로 넘어가지 않는다.

기존 `.harness/dubyeol2/phases/phase-001/` 구조는 legacy evidence로 보존한다.
