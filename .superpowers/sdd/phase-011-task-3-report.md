status: DONE

files changed
- src/app/dashboard/shipment/page.tsx
- src/app/dashboard/orders/[id]/page.tsx
- src/lib/orders.ts
- tests/shipment-packages.test.ts

commit hash
- d12f413c8beb53bd26ca1e2c3e1afa0d39582005

exact commands run and pass/fail output summary
- `sed -n '1,220p' .superpowers/sdd/phase-011-task-3-brief.md`
  - PASS: Task 3 요구사항 확인.
- `sed -n '1,240p' /Users/twostars/.codex/plugins/cache/superpowers-marketplace/superpowers/6.1.1/skills/test-driven-development/SKILL.md`
  - PASS: TDD 규칙 확인.
- `sed -n '1,220p' /Users/twostars/.codex/plugins/cache/superpowers-marketplace/superpowers/6.1.1/skills/verification-before-completion/SKILL.md`
  - PASS: 완료 전 검증 규칙 확인.
- `git status --short`
  - PASS: 기존 dirty 파일과 작업 대상 분리 확인.
- `sed -n '1,260p' src/app/dashboard/shipment/page.tsx`
  - PASS: 셀러 출고관리 페이지 현상 파악.
- `sed -n '1,320p' src/app/dashboard/orders/[id]/page.tsx`
  - PASS: 셀러 주문 상세 페이지 현상 파악.
- `sed -n '1,360p' tests/shipment-packages.test.ts`
  - PASS: 기존 출고 패키지 테스트 구조 파악.
- `sed -n '1,260p' src/lib/orders.ts`
  - PASS: seller scoped query include 확인.
- `sed -n '1,260p' src/lib/shipment-packages.ts`
  - PASS: status label / package relation helper 확인.
- `sed -n '440,560p' tests/orders.test.ts`
  - PASS: `renderToStaticMarkup()` 기반 page test 패턴 확인.
- `sed -n '380,470p' tests/inbound.test.ts`
  - PASS: `next/link` mock 패턴 확인.
- `sed -n '1,240p' 'src/app/admin/shipments/[id]/page.tsx'`
  - PASS: admin 패키지 표시 포맷 참고.
- `npx vitest run tests/shipment-packages.test.ts -t '셀러 출고관리'`
  - FAIL(expected): `BOX-1` 미표시로 회귀 테스트 실패 확인.
- `npx vitest run tests/shipment-packages.test.ts -t '셀러 주문 상세'`
  - FAIL(expected): `포장단위 / 패킹리스트 기초` 미표시로 회귀 테스트 실패 확인.
- `npx vitest run tests/shipment-packages.test.ts`
  - PASS: `1 passed`, `14 passed (14)`.
- `git add src/app/dashboard/shipment/page.tsx 'src/app/dashboard/orders/[id]/page.tsx' src/lib/orders.ts tests/shipment-packages.test.ts && git commit -m 'feat: show shipment packages to sellers'`
  - PASS: commit `d12f413` 생성.
- `git rev-parse HEAD`
  - PASS: `d12f413c8beb53bd26ca1e2c3e1afa0d39582005`.

self-review notes
- 셀러 출고관리 목록은 기존 seller scope를 유지한 채 `shipmentPackages` summary만 추가했다.
- 셀러 주문 상세는 `SHIPMENT_REQUESTED`일 때만 패킹 기초 섹션을 렌더한다.
- 포맷 함수는 페이지 내부 로컬 helper로만 추가해 범위를 넓히지 않았다.
- `src/lib/orders.ts`는 seller scoped list query에 package include만 확장했다.

concerns, if any
- 없음

---

fix review loop 1

- commands/results
  - `npx vitest run tests/shipment-packages.test.ts -t '셀러 주문 조회는 기본으로 포장단위를 포함하지 않고 출고 화면에서만 opt-in 한다|셀러 출고관리 화면은 포장단위 개수와 SKU 요약을 표시한다|셀러 출고관리 화면은 포장단위가 없으면 빈 상태를 표시한다|셀러 주문 상세 화면은 포장단위와 패킹리스트 기초 정보를 표시한다|셀러 주문 상세 화면은 출고요청 상태가 아니면 포장단위 섹션을 숨긴다'`
    - PASS: 5 passed, 12 skipped.
  - `npx vitest run tests/shipment-packages.test.ts`
    - PASS: 17 passed.
  - `npx vitest run tests/orders.test.ts tests/wallet.test.ts tests/wallet-topups.test.ts tests/quote.test.ts tests/inbound.test.ts`
    - PASS: 85 passed.
- commit hash
  - `81adcdf681b32ba89de03e4c0038f443780ad878`
- self-review
  - `listOrdersBySeller()` 기본 include를 기존 shape로 되돌리고 shipment 화면만 `includeShipmentPackages: true` opt-in을 쓰도록 좁혔다.
  - shipment 목록 문구를 `SKU n종 / 총 n개`로 바꿔 SKU 종류 수와 총 포장 수량을 함께 보여준다.
  - 회귀 테스트로 목록 카운트/빈 상태, 상세 수량 표시, 상세 숨김 조건, opt-in include 경계를 고정했다.

---

fix review loop 2

- commands/results
  - `git diff -- tests/shipment-packages.test.ts`
    - PASS: 주문 상세 수량 assertion이 전체 HTML regex에서 섹션 추출 기반 검사로 좁혀졌는지 확인.
  - `npx vitest run tests/shipment-packages.test.ts`
    - PASS: 17 passed.
- commit hash
  - 이 보고 파일을 같은 커밋에 포함하므로 파일 본문 안에 최종 commit hash를 자기참조로 고정할 수 없다. 실제 hash는 커밋 직후 handoff와 git history에 기록한다.
- self-review
  - `포장단위 / 패킹리스트 기초`부터 `항목별 견적` 직전까지를 잘라 텍스트로 정규화하는 helper를 추가했다.
  - `빨강 1개`, `파랑 2개` 검사는 이제 전체 페이지가 아니라 패키지 섹션에서만 통과한다.
  - UI/source 코드는 건드리지 않고 테스트만 수정했다.
