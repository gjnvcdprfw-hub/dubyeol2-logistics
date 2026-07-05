# Phase 6 Plan

상태: TL 작성 완료 (2026-07-05). Superpowers: `superpowers:writing-plans`

> For Builder agents: REQUIRED SUB-SKILL: use `superpowers:subagent-driven-development` execution boundaries. This plan is the Phase 6 implementation contract. Do not use the superseded "문구 전용" plan.

## Goal

두리무역 공개 영역을 대표님 Chrome 원본과 나란히 비교할 수 있는 **비공개 1:1 기준판**으로 만든다. 로고, 이미지, 실주소, 전화번호, 계좌, 사업자정보만 자리표시하고, 그 외 디자인·구조·문구·버튼 흐름·상태 문구·아이콘/이모티콘 위치와 역할은 같은 기준으로 대응시킨다.

## Global Constraints

- 로컬/비공개 기준판만 만든다. `git push`, deploy, 원격 머지, 고객 공개 URL, 검색 노출 금지.
- Chrome 원본 확인은 읽기 전용이다. 로그인 상태를 바꾸거나 결제·주문·폼 제출·파일 업로드·실서비스 상태 변경을 하지 않는다.
- 제외 6종: 로고, 이미지, 실주소, 전화번호, 계좌, 사업자정보. 실제 값은 코드에 넣지 않고 자리표시한다.
- 공개 화면만 Phase 6 범위다. 로그인 후 대시보드, 예치금 결제, 실돈 흐름, 우리 회사용 수정은 후속 Phase다.
- 원본과 같은 기능처럼 보이는 곳은 미구현이면 "준비 중" 또는 로컬 자리표시를 명확히 남긴다.
- 기존 요율 숫자는 `src/lib/rates.ts`, `src/lib/pricing-data.ts`에서 파생한다.
- 이미지 복제 금지. 원본 이미지 자리는 색면, 자리표시 박스, 텍스트 설명 등으로 대체한다.

## File Structure

- Create: `.harness/dubyeol2/duly-public-inventory.md` — Chrome에서 확인한 두리무역 공개 화면별 기준 목록.
- Modify: `.harness/dubyeol2/phase-packets/phase-006/03-verification.md` — Machine Check 결과와 Chrome 대조 증거를 새 계약 기준으로 재작성.
- Modify: `src/components/public/site-header.tsx` — 공개 메뉴, 로그인/가입 CTA, 브랜드 자리표시.
- Modify: `src/components/public/site-footer.tsx` — 푸터 3열 링크와 제외 6종 자리표시.
- Modify: `src/components/public/trust-stats.tsx` — 신뢰 지표 1:1 자리와 실적 숫자 자리표시.
- Modify: `src/components/public/section-cta.tsx` — 하단 CTA 패턴.
- Modify: `src/components/public/coming-soon.tsx` — 미구현 기능 자리표시.
- Modify: `src/app/page.tsx` — 랜딩 기준판.
- Modify: `src/app/search/page.tsx` — 1688 검색 공개 진입 기준판.
- Modify: `src/app/tracking/page.tsx` — 배송조회 기준판.
- Modify: `src/app/about/page.tsx` — 회사소개 기준판, 사업자정보 제외 처리.
- Modify: `src/app/services/purchase-agency/page.tsx` — 구매대행 소개 기준판.
- Modify: `src/app/services/shipping-agency/page.tsx` — 배송대행 소개 기준판.
- Modify: `src/app/services/smart-order/page.tsx` — 스마트오더 소개 기준판.
- Modify: `src/app/services/inspection/page.tsx` — 검품감사 소개 기준판.
- Modify: `src/app/guide/page.tsx`, `src/app/guide/pricing/page.tsx`, `src/app/guide/services/page.tsx` — 이용가이드·요금·부가서비스 기준판.
- Modify: `src/app/calculators/page.tsx`, `src/app/calculators/*/page.tsx` — 계산기 허브와 공개 계산기 1:1 기준판.
- Create if absent: `src/app/legal/terms/page.tsx`, `src/app/legal/privacy/page.tsx` — 공개 링크 구조용 자리표시 페이지. 약관 본문은 대표님 확정 대기값으로 표시.

## Task 1: Chrome 원본 공개 화면 인벤토리

**Files**
- Create: `.harness/dubyeol2/duly-public-inventory.md`

**Steps**

1. 대표님 Chrome에서 두리무역 공개 URL만 읽기 전용으로 확인한다.
   - 대상: `/`, `/1688`, `/tracking`, `/frontend-pages/about`, `/frontend-pages/services/purchase-agency`, `/services/shipping-agency`, `/services/smart-order`, `/frontend-pages/services/inspection`, `/guide`, `/frontend-pages/calculators`, `/guide/faq`, `/legal/terms`, `/legal/privacy`.
   - 하지 않음: 로그인 상태 변경, 주문/결제/폼 제출, 파일 업로드.

2. 각 화면별로 아래 형식으로 `.harness/dubyeol2/duly-public-inventory.md`를 작성한다.

```markdown
# Duly Public Inventory

수집일: 2026-07-05
수집 방식: 대표님 Chrome 읽기 전용
담장: 로고, 이미지, 실주소, 전화번호, 계좌, 사업자정보는 코드 반입 금지

## /
- H1:
- 섹션 순서:
- CTA:
- 아이콘/이모티콘:
- 제외 6종 발견 여부:
- 우리 대응 파일: `src/app/page.tsx`
```

3. 검증:
   - 공개 URL별 항목이 비어 있지 않아야 한다.
   - 제외 6종은 "자리표시 필요"로만 기록하고 실제 값을 적지 않는다.

4. 커밋 전 파일 확인:
   - `rg -n "전화|계좌|사업자|주소" .harness/dubyeol2/duly-public-inventory.md`
   - 실제 값이 아니라 제외 사유와 자리표시만 있는지 확인한다.

## Task 2: 공개 공통 껍데기 1:1 기준판

**Files**
- Modify: `src/components/public/site-header.tsx`
- Modify: `src/components/public/site-footer.tsx`
- Modify: `src/components/public/trust-stats.tsx`
- Modify: `src/components/public/section-cta.tsx`
- Modify: `src/components/public/coming-soon.tsx`
- Create if absent: `src/app/legal/terms/page.tsx`
- Create if absent: `src/app/legal/privacy/page.tsx`

**Steps**

1. 헤더 메뉴를 원본 공개 메뉴 순서에 맞춘다.
   - 포함: 회사소개, 1688 상품, 스마트오더, 검품감사, 구매대행, 배송대행, 배송조회, 계산기, 이용가이드.
   - 브랜드는 실제 두리 로고가 아니라 텍스트 자리표시를 사용한다.

2. 푸터를 원본의 서비스/고객지원/회사정보 3열 구조로 맞춘다.
   - 사업자정보 영역은 "오픈 전 확정" 자리표시만 사용한다.
   - 실제 주소, 전화번호, 사업자번호를 넣지 않는다.

3. 법무 링크 페이지를 만든다.
   - `/legal/terms`: "이용약관은 오픈 전 확정" 자리표시.
   - `/legal/privacy`: "개인정보처리방침은 오픈 전 확정" 자리표시.
   - 두리무역 약관 원문을 넣지 않는다.

4. 검증:
   - `npm run build`
   - `rg -n "두리|duly|사업자등록|010-|070-|@|계좌|은행|웨이하이|威海" src/app src/components`
   - 허용되는 것은 벤치마크 설명이나 자리표시뿐이어야 한다. 고객 노출 코드에 실제 제외 6종 값이 있으면 실패.

## Task 3: 랜딩 + 공개 서비스 소개 기준판

**Files**
- Modify: `src/app/page.tsx`
- Modify: `src/app/search/page.tsx`
- Modify: `src/app/about/page.tsx`
- Modify: `src/app/services/purchase-agency/page.tsx`
- Modify: `src/app/services/shipping-agency/page.tsx`
- Modify: `src/app/services/smart-order/page.tsx`
- Modify: `src/app/services/inspection/page.tsx`

**Steps**

1. 랜딩 페이지를 원본 섹션 순서로 맞춘다.
   - 히어로 + 1688 검색창 + 신뢰 뱃지 3개.
   - 1688 검색·구매대행 섹션.
   - 배송대행 5단계.
   - 스마트오더 4단계.
   - 검품감사 섹션.
   - 신뢰 지표.
   - FAQ.
   - CTA.
   - 푸터.

2. 서비스 소개 페이지 4종을 원본 역할에 맞춘다.
   - 구매대행: 비교표, 이용 순서, 수수료, FAQ.
   - 배송대행: 5단계 흐름, 운임/입고/통관 책임 경계, FAQ.
   - 스마트오더: 엑셀 업로드 흐름, 매칭 라이브러리, 준비 중 담장.
   - 검품감사: 출장검품/창고검수 경계, 단가 자리, 보고서 흐름, 준비 중 담장.

3. 1688 검색 공개 진입 화면을 맞춘다.
   - 한국어 검색창, 이미지 검색 자리, 카테고리/인기 상품 피드 자리.
   - 실제 1688 API 호출은 하지 않는다. 준비 중/로컬 자리표시로 둔다.

4. 회사소개 화면을 맞춘다.
   - 회사·기술력·비교표 구조를 맞춘다.
   - 사업자정보는 "오픈 전 확정" 자리표시.

5. 검증:
   - `npm run build`
   - Chrome 또는 Playwright로 `/`, `/search`, `/about`, `/services/purchase-agency`, `/services/shipping-agency`, `/services/smart-order`, `/services/inspection`을 열어 콘솔 오류 0 확인.
   - 원본 인벤토리의 섹션 순서와 대응 여부를 `03-verification.md`에 체크한다.

## Task 4: 가이드·계산기·조회 공개 화면 기준판

**Files**
- Modify: `src/app/tracking/page.tsx`
- Modify: `src/app/guide/page.tsx`
- Modify: `src/app/guide/pricing/page.tsx`
- Modify: `src/app/guide/services/page.tsx`
- Modify: `src/app/calculators/page.tsx`
- Modify: `src/app/calculators/cbm/page.tsx`
- Modify: `src/app/calculators/volume-weight/page.tsx`
- Modify: `src/app/calculators/shipping-cost/page.tsx`
- Modify: `src/app/calculators/hs-code/page.tsx`
- Modify: `src/app/calculators/fta/page.tsx`
- Modify: `src/app/calculators/import-cost/page.tsx`
- Modify: `src/app/calculators/exchange/page.tsx`
- Modify: `src/app/calculators/customs-req/page.tsx`
- Modify: `src/app/calculators/customs-track/page.tsx`

**Steps**

1. 배송조회 화면을 원본 역할에 맞춘다.
   - 운송장 입력, 조회 CTA, 배송비 안내, 준비 중/실조회 아님 담장.
   - 외부 배송조회 API 호출 없음.

2. 가이드 허브를 원본 가이드 트리 구조에 맞춘다.
   - 구매대행, 배송대행, 내상품, 플랫폼 사용법, 부가서비스, 무역지식, 품목별 수입 가이드, FAQ 진입 구조.
   - 세부 미구현 페이지는 준비 중으로 표시.

3. 요금·부가서비스 안내는 `RATES`/`PRICING` 파생값만 사용한다.
   - 하드코딩 숫자 신규 유입 금지.
   - 원본과 같은 정보량을 유지하되 실제 값은 우리 정본에서 파생한다.

4. 계산기 허브와 9종 계산기 화면을 원본 역할에 맞춘다.
   - 사용 가능한 계산기: CBM, 부피중량, 배송비.
   - 준비 중 계산기: HS코드, FTA, 수입비용, 환율, 세관 요건, 통관 진행.
   - 준비 중 화면도 원본과 같은 진입 구조와 설명 밀도를 갖되 실제 조회는 하지 않는다.

5. 검증:
   - `npx vitest run`
   - `npm run build`
   - `rg -n "수수료 5%|¥1/개|6000|25|32.5|65" src/app src/components` 후 새 하드코딩이 없고 정본 파생 또는 문서상 허용 위치인지 확인.
   - `/tracking`, `/guide`, `/guide/pricing`, `/guide/services`, `/calculators`, `/calculators/cbm`, `/calculators/volume-weight`, `/calculators/shipping-cost` 실화면 렌더 확인.

## Machine Check

1. `npx vitest run` — 기존 테스트 전건 통과.
2. `npm run build` — 성공.
3. `npx -y @google/design.md lint .harness/dubyeol2/design-system.md` — errors 0.
4. 제외 6종 반입 검사:
   - `rg -n "두리|duly|사업자등록|계좌|은행|010-|070-|웨이하이|威海" src/app src/components`
   - 실제 두리무역 값이 고객 노출 코드에 있으면 FAIL.
5. 공개 노출 담장 검사:
   - dev 서버 로컬 URL만 사용.
   - push, deploy, 원격 머지 없음.
6. Chrome/Playwright 실화면 QA:
   - 원본 인벤토리와 로컬 기준판을 `/`, `/search`, `/about`, `/services/*`, `/tracking`, `/guide`, `/calculators`에서 대조.
   - 콘솔 오류 0.

## External Audit Readiness

- Phase 6 감리는 새 계약 기준으로 다시 요청한다.
- 기존 `external-audit/request.json`과 `external-audit/pending/request-phase-006.json`은 superseded 상태라 사용하지 않는다.
- 새 감리 요청에는 `duly-public-inventory.md`, 새 `03-verification.md`, 제외 6종 검사 결과, 로컬 실화면 QA 증거를 포함한다.
