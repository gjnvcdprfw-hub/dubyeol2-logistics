# Phase 4: 두리무역 공개 영역 전체 화면 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. 이 플랜은 화면 다량 생산 태스크라 예외적으로 "전 코드 인라인" 대신 **공용 컴포넌트·계산 lib은 전 코드, 화면은 섹션 구성 명세 + 콘텐츠 소스(benchmark-duly.md) 참조** 방식을 쓴다. Builder는 반드시 `.harness/dubyeol2/benchmark-duly.md`를 읽고 해당 화면 섹션을 따른다.

**Goal:** 비로그인 방문자가 두리무역과 같은 구조·밀도의 공개 사이트를 탐색한다 — 랜딩 풀 구성, 상단 9메뉴, 서비스 소개 4종, 계산기 10화면(3종 실계산), 정보 페이지 5종.

**하드라인:** ①거짓 기능 금지 — 미구현 동작은 "준비 중" 배지/안내 명시 ②두리무역 카피 원문·이미지·실주소/연락처/상호/실적 숫자 복제 금지(구조·레이아웃만 벤치, 문구는 우리 서비스로 재작성, 실적은 "준비 중" 또는 중립 표현) ③기존 32테스트·Feature 1 화면 회귀 0 ④design-system.md 토큰만 사용

**Tech:** 기존 스택. 신규 의존성 없음. 전부 정적/서버 컴포넌트(클라이언트는 계산기 폼만).

---

## File Structure

```
src/components/public/site-header.tsx   # 상단 9메뉴 내비 (BT11)
src/components/public/site-footer.tsx   # 풀 푸터 (BT11)
src/components/public/trust-stats.tsx   # 신뢰지표 배너 (BT11)
src/components/public/section-cta.tsx   # 하단 CTA (BT11)
src/components/public/coming-soon.tsx   # "준비 중" 공용 안내 (BT11)
src/lib/calculators.ts + tests/calculators.test.ts  # CBM·용적중량·배송비 순수 함수 TDD (BT11)
src/app/page.tsx                        # 랜딩 풀 교체 (BT11)
src/app/services/{purchase-agency,shipping-agency,smart-order,inspection}/page.tsx  # (BT12)
src/app/search/page.tsx  src/app/tracking/page.tsx                                   # (BT12)
src/app/calculators/page.tsx + {cbm,volume-weight,shipping-cost}/page.tsx(실계산)
  + {hs-code,import-cost,exchange,fta,customs-req,customs-track}/page.tsx(준비 중)   # (BT13)
src/app/about/page.tsx  src/app/guide/page.tsx  src/app/guide/pricing/page.tsx
  src/app/guide/services/page.tsx                                                    # (BT14)
```

의존: BT11 완료 후 BT12·13·14 **병렬** (파일 겹침 없음. 셋 다 BT11의 공용 컴포넌트 import).

---

### Task 11 (BT11): 공용 셸 + 랜딩 풀 + 계산 lib (TDD)

**Step 1 — `src/components/public/site-header.tsx`** (전 코드):
```tsx
import Link from "next/link";

const MENU = [
  { href: "/about", label: "회사소개" },
  { href: "/search", label: "1688 상품" },
  { href: "/services/smart-order", label: "스마트오더" },
  { href: "/services/inspection", label: "검품감사" },
  { href: "/services/purchase-agency", label: "구매대행" },
  { href: "/services/shipping-agency", label: "배송대행" },
  { href: "/tracking", label: "배송조회" },
  { href: "/calculators", label: "계산기" },
  { href: "/guide", label: "이용가이드" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-black/5">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
        <Link href="/" className="font-bold text-brand text-lg shrink-0">물류</Link>
        <nav className="hidden md:flex items-center gap-5 text-sm text-[#666666]">
          {MENU.map((m) => (
            <Link key={m.href} href={m.href} className="hover:text-heading">{m.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm shrink-0">
          <Link href="/auth/login" className="text-secondary">로그인</Link>
          <Link href="/auth/register" className="bg-accent text-white font-semibold rounded-[12px] px-4 py-2">무료 가입하기</Link>
        </div>
      </div>
    </header>
  );
}
```

**Step 2 — `site-footer.tsx`**: 두리무역 푸터 구조(benchmark §5) — 4열: 브랜드 소개 한 줄 / 서비스(1688 상품검색·스마트오더·구매대행·배송대행) / 고객지원(이용가이드·계산기) / 약관(이용약관·개인정보처리방침 — href="#" + "준비 중" title). 하단 사업자 정보는 자리표시("사업자 정보 오픈 전 기재"). © 2026 물류.

**Step 3 — `trust-stats.tsx`**: 두리무역 "8년+/50,000+/1,000+/실시간" 4종 배너 구조 벤치 — **우리 값이 없으므로 중립 문구로**: "정식 오픈 준비 중 · 두리무역 수준 품질 목표 · 요율 공개 · 실시간 상담(준비 중)" 형태의 4칸. 실적 숫자 날조 금지.

**Step 4 — `section-cta.tsx`**: props {title, sub} + [무료 가입하기][로그인] 버튼. `coming-soon.tsx`: props {feature} — 카드(surface-alt) + "🚧 준비 중 — {feature}은(는) 곧 열립니다" + 홈/가입 링크.

**Step 5 — `src/lib/calculators.ts` (TDD, 전 코드)**. 먼저 tests/calculators.test.ts:
```ts
import { describe, it, expect } from "vitest";
import { calcCbm, calcVolumetricKg, calcShippingFen } from "../src/lib/calculators";

describe("calcCbm", () => {
  it("60×40×50cm ×20박스 = 2.4 CBM", () => {
    expect(calcCbm(60, 40, 50, 20)).toBeCloseTo(2.4, 6);
  });
});
describe("calcVolumetricKg", () => {
  it("60×40×50cm = 20kg (÷6000)", () => {
    expect(calcVolumetricKg(60, 40, 50)).toBeCloseTo(20, 6);
  });
});
describe("calcShippingFen — rates.ts 요율", () => {
  it("해운 13.334kg → 14kg 올림 → ¥90", () => {
    expect(calcShippingFen("SEA", 13334)).toBe(9000);
  });
  it("항공 1250g → ¥55.9", () => {
    expect(calcShippingFen("AIR", 1250)).toBe(5590);
  });
});
```
구현: quote.ts의 운임 블록과 동일 규칙 — **중복 구현 금지**: quote.ts에서 운임 계산을 `calcShippingFen(method, chargeableGrams)`로 추출해 calculators.ts에 두고 quote.ts가 import하도록 리팩터(기존 32테스트 통과 유지 필수). calcCbm = w*d*h*qty/1e6, calcVolumetricKg = w*d*h/RATES.volumeDivisor.

**Step 6 — 랜딩 `src/app/page.tsx` 풀 교체**: benchmark §5 랜딩 구성 순서 그대로 (SiteHeader / 히어로: 2줄 제목 둘째 줄 accent + 부제 + CTA 2 + 신뢰 뱃지 3 + **검색창 UI**(placeholder "상품명을 입력하세요" + 검색 버튼 → /search 링크, 준비 중 배지) / 서비스 4섹션: 1688 검색·구매대행 / 배송대행 5단계 플로우(접수→입고사진→출고→한국도착 카드) / 스마트오더 4단계 / 검품 / TrustStats / FAQ 아코디언 5문항(detail/summary — 검수 정책·요율·배송기간 등 우리 문구) / SectionCta / SiteFooter). 카피는 Feature 1에서 쓰던 우리 문구 계열 확장.

**Step 7 — 검증·커밋**: `npx vitest run`(32+4=36 이상, quote 리팩터 회귀 포함) + `npm run build` → `git add src/components/public/ src/lib/calculators.ts src/lib/quote.ts tests/calculators.test.ts src/app/page.tsx && git commit -m "feat: 공개 셸(9메뉴·푸터)+랜딩 풀 구성+계산 lib TDD"`

### Task 12 (BT12): 서비스 소개 4종 + 검색·배송조회

각 페이지 = SiteHeader + 섹션들 + TrustStats + SectionCta + SiteFooter. **benchmark-duly.md의 해당 화면 섹션 구성을 그대로 따르되 문구는 우리 것**:
- `services/purchase-agency`: 히어로(뱃지 3·수수료 rates 파생 표기) / "구매대행이란" 정의 문단 / 비교표(일반 배대지 vs 일반 대행 vs 우리 — 8행) / 핵심 기능 4카드 / 6단계 프로세스 / 부가서비스 6칩 / 수수료 섹션(rates.commissionRate 파생) / FAQ 5문항
- `services/shipping-agency`: 히어로 / "적합한 고객·적합하지 않은 경우" 2열 / 비용 경계·통관 책임 경계 / 자동화 기술 4카드("준비 중" 배지: 1688 연동·운송장 동기화·타오바오 URL·AI HS코드) / 서비스 유형 3카드(샘플·LCL·3PL — LCL·3PL "준비 중") / 부가서비스 필터 카드 / 8단계 플로우 / FAQ
- `services/smart-order`: 히어로 / 운영 흐름 4단계 / "이런 팀에 맞습니다" / 줄여주는 문제 5 / 기능 4카드 / 6단계 / 비교 6행 — 전체 "준비 중" 배지 상단 고정
- `services/inspection`: 히어로 / 정의 문단 / 유형 3카드(품질·공장·선적) / 5단계 프로세스 / 가격 3단(두리 단가 아닌 "오픈 전 확정" 자리표시 — 요율 미확정 항목) / FAQ
- `search/page.tsx`: 검색창+카테고리 칩+ComingSoon("1688 상품 검색") / `tracking/page.tsx`: 운송장 입력 UI+배송비 안내 표(rates 파생)+ComingSoon("실시간 추적")
- 검증: build + 커밋 "feat: 서비스 소개 4종·검색·배송조회 화면"

### Task 13 (BT13): 계산기 10화면

- `calculators/page.tsx` 허브: benchmark §4.4 구조 — FAQ 3카드 + 카테고리 그룹(HS코드/배송 계산/수입비용/통관 조회) + 9개 카드 + "이 순서로 시작" 4단계 + 도구별 상세 안내. 준비 중인 것엔 배지
- 실계산 3종(클라이언트 컴포넌트, calculators.ts import): `cbm`(가로세로높이cm+수량 → CBM+컨테이너 참고), `volume-weight`(치수+실중량 → 청구중량 비교), `shipping-cost`(무게·부피 → 해운/항공 비교 표, ¥·₩ 병기 — 환율은 사용자 입력 필드, 기본값 190 명시 "참고용")
- 준비 중 6종: 각각 페이지 + 해당 도구 설명(benchmark 상세 안내 벤치) + ComingSoon
- 검증: 3종 손검산(60×40×50×20=2.4CBM 등) + build + 커밋 "feat: 계산기 허브·실계산 3종·준비 중 6종"

### Task 14 (BT14): 정보 페이지 4종

- `about`: 회사소개 구조 벤치(히어로·한눈에 보기·기술력 4카드("준비 중" 배지)·서비스 4카드·경쟁 우위·연락처) — 회사 실정보는 "오픈 전 확정" 자리표시, 실적 날조 금지
- `guide/page.tsx`: 가이드 허브 — 이용 흐름(구매/배송 4단계)·가이드 선택 카드 6종(각 상세는 "준비 중")·빠른 링크(계산기·요금)
- `guide/pricing`: **rates.ts에서 표 생성**(해운·항공 요율, 검수·부가서비스는 benchmark §3 값을 상수로 — 단 이 페이지 전용 데이터 파일 `src/lib/pricing-data.ts`에 모아 하드코딩 산재 금지) + 창고 보관료 표 + "참고용·최종 금액 아님" 면책
- `guide/services`: 부가서비스 안내 — 원산지/판매표기/포장/검수 4그룹 단가 카드(pricing-data.ts) + 신청 방법 + FAQ
- 검증: build + grep(두리 상호·전화·주소·"두리" 문자열 0건) + 커밋 "feat: 회사소개·가이드·요금·부가서비스 화면"

### Task 15: 마무리 (TL Machine Check 전 게이트)
- `npx vitest run` 전체 + `npm run build` + design lint errors 0 + `grep -ri "두리\|duly\|이춘옥\|371-19-02799" src/` → 0건

## Self-Review
- 커버리지: benchmark §1 공개 화면 전부 매핑(가입/로그인/요금·부가서비스 포함) ✓. 실적 숫자·두리 실데이터 금지 명문화 ✓. 계산 중복 금지(quote 리팩터) ✓. 위험: quote.ts 리팩터 회귀 — 기존 테스트가 즉시 잡음
