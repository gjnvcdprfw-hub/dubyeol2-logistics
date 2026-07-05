import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import TrustStats from "@/components/public/trust-stats";
import SectionCta from "@/components/public/section-cta";
import { RATES } from "@/lib/rates";
import { PRICING } from "@/lib/pricing-data";

export const metadata: Metadata = {
  title: "배송대행 | 물류",
  description: "중국 창고 주소로 보내주시면 입고 확인부터 통관, 국내 배송까지 처리합니다. 구매 수수료 없이 공개 운임 요율로 안내드립니다.",
};

const CARD_BASE = "rounded-[16px] shadow-[0_7px_30px_rgba(90,114,123,0.11)]";
const CARD = `${CARD_BASE} bg-surface`;
const BADGE = "text-xs font-semibold rounded-full bg-warning-tint text-heading px-3 py-1";

const GOOD_FIT = [
  "1688·타오바오에서 직접 구매할 수 있어 구매 수수료를 아끼고 싶은 셀러",
  "여러 판매자 상품을 창고에서 한 번에 모아 운임을 줄이고 싶은 분",
  "입고 사진으로 상품 상태를 먼저 확인한 뒤 출고를 결정하고 싶은 분",
  "운임을 공개 요율로 미리 계산해 마진을 관리하고 싶은 분",
  "원산지 표기·바코드 등 판매 준비 작업을 창고에서 끝내고 싶은 분",
];

const BAD_FIT = [
  "개인 사용 목적의 소액 직구 (사업자 셀러 중심 서비스입니다)",
  "수입 금지·제한 품목 (배터리 단독, 위험물, 식물·식품류 일부 등)",
  "정품 인증이 필요한 브랜드 상품의 진위 확인 (진위 감정은 제공하지 않습니다)",
  "당일·익일 초긴급 배송이 필요한 경우 (국제 물류 특성상 보장이 어렵습니다)",
];

const AUTOMATION: [string, string][] = [
  ["1688 계정 연동", "1688 계정을 연동하면 주문번호·SKU·상품 이미지가 담긴 주문 목록이 자동으로 동기화됩니다. 운송장을 하나씩 옮겨 적을 필요가 없습니다."],
  ["운송장 자동 동기화", "중국 내 운송장을 실시간으로 자동 조회해 상품이 창고에 언제 도착할지 입고 예정일까지 계산해 보여드립니다."],
  ["타오바오 URL 인식", "타오바오 모바일 공유 링크를 붙여넣으면 상품명·가격·옵션을 자동으로 읽어 등록합니다."],
  ["AI HS코드 추천", "상품 정보로 HS코드 후보를 추천하고 기본관세·WTO·한중FTA 세율을 비교해 보여드립니다. 최종 판단은 관세사·세관 기준을 따릅니다."],
  ["창고 관리 시스템(WMS)", "입고된 상품에 바코드를 부여해 스캔 관리하고, 입고 사진과 재고 위치를 실시간 대시보드로 확인할 수 있게 준비하고 있습니다."],
];

const FLOW: [string, string][] = [
  ["주소 확인", "전용 입고 코드가 붙은 중국 창고 주소를 확인합니다. 실제 창고 위치 정보는 오픈 전 확정 자리표시입니다."],
  ["운송장 등록", "직접 구매한 상품의 중국 운송장을 등록해 입고 예정 상태로 둡니다."],
  ["창고 입고", "창고 도착 시 입고 처리와 사진 1~2장, 외포장 이상 여부를 기본 확인합니다."],
  ["검수·출고", "필요한 검수·부가서비스를 선택하고 묶음 출고를 신청합니다."],
  ["통관·수령", "국제 배송과 통관을 거쳐 국내 배송으로 받습니다. 관세·수입 요건 책임은 수입자에게 있습니다."],
];

const ADDON_GROUPS: [string, string[]][] = [
  ["원산지", ["스티커", "라벨(봉제)", "도장", "행택"]],
  ["판매 표기", ["바코드", "KC 표기", "식품검역", "14세 표기", "커스텀 행택", "세탁 라벨"]],
  ["포장", ["OPP 포장", "에어캡", "묶음포장", "묶음 옵션", "태그 제거", "포장 제거"]],
];

const FAQ: [string, string][] = [
  ["배송대행 수수료가 있나요?", "구매 수수료는 없습니다. 국제운임과 선택한 검수·부가서비스 비용만 청구되며, 모든 단가는 요금 안내에 공개되어 있습니다."],
  ["운임은 어떻게 계산되나요?", `실중량과 부피중량(가로×세로×높이 cm³ ÷ ${RATES.volumeDivisor.toLocaleString()}) 중 큰 값을 청구중량으로 합니다. 해운은 첫 1kg ¥${RATES.sea.firstKgFen / 100} + 추가 kg당 ¥${RATES.sea.additionalPerKgFen / 100}, 항공은 서류비 ¥${RATES.air.docFeeFen / 100} + 100g당 ¥${RATES.air.per100gFen / 100}입니다. ¥ 단가는 결제일 당일 환율이 적용되며, 계산기에서 미리 확인할 수 있습니다.`],
  ["여러 판매자 상품을 묶어 보낼 수 있나요?", "네, 창고에 입고된 상품을 원하는 시점에 묶어 출고 신청하면 하나의 배송으로 받을 수 있습니다. 판매자별로 따로 받는 것보다 운임을 줄일 수 있는 방법입니다."],
  ["관세와 통관은 누가 처리하나요?", "통관 절차는 저희가 진행하지만, 수입 신고 명의자는 고객이며 관세·부가세 납부 의무와 수입 요건(KC 인증 등) 충족 책임은 수입자에게 있습니다. 요건이 필요한 품목은 접수 전에 확인해 드립니다."],
  ["창고 보관 기간 제한이 있나요?", `입고 후 ${PRICING.storage.freeDays}일까지 무료로 보관하며, 이후에는 일·박스 단위 보관료가 발생합니다. 장기 보관 시 처리 기준을 포함한 구간별 요율은 요금 안내에서 공개합니다.`],
  ["직접 구매가 어려우면 어떻게 하나요?", "1688 구매·결제까지 대신하는 구매대행 서비스를 이용하시면 됩니다. 배송대행과 같은 창고를 쓰므로, 두 방식의 상품을 함께 묶어 받을 수도 있습니다."],
];

export default function ShippingAgencyPage() {
  return (
    <main className="bg-bg text-body">
      <SiteHeader />

      {/* 히어로 */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex flex-wrap gap-2">
          {["구매 수수료 없음", "입고 사진 기본 제공", "공개 운임 요율"].map((b) => (
            <span key={b} className={BADGE}>{b}</span>
          ))}
        </div>
        <h1 className="mt-6 text-4xl md:text-5xl font-semibold text-heading leading-tight">
          중국 배송대행<br /><span className="text-accent">입고부터 통관까지 원스톱</span>
        </h1>
        <p className="mt-5 text-lg text-secondary max-w-2xl">
          1688·타오바오에서 직접 구매한 상품을 중국 창고 주소로 보내주시면
          입고 확인부터 통관, 국내 배송까지 단계별로 처리합니다.
          구매 수수료 없이 공개 운임 요율 기준으로만 안내드리고,
          여러 판매자 상품을 창고에서 묶어 한 번에 받을 수 있습니다.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/auth/register" className="bg-accent text-white text-lg font-semibold rounded-[12px] px-8 py-4">무료 가입하기</Link>
          <Link href="/calculators" className="text-heading text-lg font-semibold px-4 py-4">운임 계산해 보기 →</Link>
        </div>
      </section>

      <section className="bg-surface border-y border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold text-heading">배송대행 5단계</h2>
          <ol className="mt-8 grid md:grid-cols-5 gap-4">
            {FLOW.map(([t, d], i) => (
              <li key={t} className="rounded-[16px] bg-bg border border-black/5 p-5">
                <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-accent text-white text-sm font-semibold">{i + 1}</span>
                <h3 className="mt-3 font-semibold text-heading">{t}</h3>
                <p className="mt-1 text-xs text-secondary">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold text-heading">수동 입력을 줄이는 자동화</h2>
        <p className="mt-3 text-secondary max-w-2xl">
          원본 공개 화면처럼 Excel 수동 입력 제거, 타오바오 URL 인식, 1688 계정 연동, 운송장 자동 조회, AI HS코드 추천 흐름을 한 화면에 둡니다.
          기준판에서는 실제 계정 연동·외부 조회를 하지 않습니다.
        </p>
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {AUTOMATION.slice(0, 4).map(([t, d]) => (
            <div key={t} className={`${CARD} p-6`}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-heading">{t}</h3>
                <span className={`${BADGE} shrink-0`}>준비 중</span>
              </div>
              <p className="mt-2 text-sm text-secondary">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 적합/부적합 2열 */}
      <section className="bg-surface border-y border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold text-heading">이런 분께 맞습니다</h2>
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className={`${CARD_BASE} p-6 bg-success-tint`}>
              <h3 className="font-semibold text-heading">적합한 고객</h3>
              <ul className="mt-4 space-y-3 text-sm text-secondary">
                {GOOD_FIT.map((t) => <li key={t}>✓ {t}</li>)}
              </ul>
            </div>
            <div className={`${CARD_BASE} p-6 bg-warning-tint`}>
              <h3 className="font-semibold text-heading">적합하지 않은 경우</h3>
              <ul className="mt-4 space-y-3 text-sm text-secondary">
                {BAD_FIT.map((t) => <li key={t}>· {t}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 비용 경계·통관 책임 경계 */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold text-heading">비용과 책임, 미리 분명하게</h2>
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className={`${CARD} p-6`}>
            <h3 className="font-semibold text-heading">비용 경계</h3>
            <p className="mt-3 text-sm text-secondary leading-relaxed">
              청구 항목은 국제운임, 선택한 검수·부가서비스, 장기 보관 시 보관료입니다.
              운임은 실중량과 부피중량(가로×세로×높이 cm³ ÷ {RATES.volumeDivisor.toLocaleString()}) 중
              큰 값을 청구중량으로 하며, ¥ 단가는 결제일 당일 환율이 적용됩니다.
              출고 시 확정 전 금액은 참고용으로 표시합니다. 관세·부가세는 통관 시 별도이고,
              창고 보관은 입고 후 {PRICING.storage.freeDays}일까지 무료입니다.
            </p>
          </div>
          <div className={`${CARD} p-6`}>
            <h3 className="font-semibold text-heading">통관 책임 경계</h3>
            <p className="mt-3 text-sm text-secondary leading-relaxed">
              통관 절차 진행은 저희가 돕지만, 수입 신고의 명의자는 고객이며 관세·부가세 납부와
              수입 요건(KC 인증 등) 충족 책임은 수입자에게 있습니다. 요건이 필요한 품목은
              접수 단계에서 미리 안내드리며, 수입 금지·제한 품목은 접수할 수 없습니다.
              통관 과정에서 서류 보완이 필요하면 즉시 연락드립니다.
            </p>
          </div>
        </div>
      </section>

      {/* 자동화 기술 4카드 — 준비 중 */}
      <section className="bg-surface-alt border-y border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-semibold text-heading">추가 자동화 기술</h2>
            <span className={BADGE}>준비 중</span>
          </div>
          <p className="mt-3 text-secondary">아래 자동화 기능은 정식 오픈 후 순차 제공됩니다.</p>
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            {AUTOMATION.slice(4).map(([t, d]) => (
              <div key={t} className={`${CARD} p-6`}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-heading">{t}</h3>
                  <span className={`${BADGE} shrink-0`}>준비 중</span>
                </div>
                <p className="mt-2 text-sm text-secondary">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 서비스 유형 3카드 */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold text-heading">서비스 유형</h2>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className={`${CARD} p-6`}>
            <h3 className="font-semibold text-heading">샘플·소량 택배</h3>
            <p className="mt-2 text-sm text-secondary">
              해운·항공 택배로 소량 화물을 받습니다. 해운 첫 1kg ¥{RATES.sea.firstKgFen / 100} +
              추가 kg당 ¥{RATES.sea.additionalPerKgFen / 100}, 항공 서류비 ¥{RATES.air.docFeeFen / 100} +
              100g당 ¥{RATES.air.per100gFen / 100}.
            </p>
          </div>
          <div className={`${CARD} p-6`}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-heading">LCL 해운</h3>
              <span className={`${BADGE} shrink-0`}>준비 중</span>
            </div>
            <p className="mt-2 text-sm text-secondary">CBM 단위 대량 화물을 위한 사업자용 해운 콘솔 서비스. 수출신고·국내 통관까지 포함한 절차로 진행되며, 요율은 오픈 전 확정해 공개합니다.</p>
          </div>
          <div className={`${CARD} p-6`}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-heading">3PL 풀필먼트</h3>
              <span className={`${BADGE} shrink-0`}>준비 중</span>
            </div>
            <p className="mt-2 text-sm text-secondary">재고를 창고에 보관해 두고 판매 주문이 들어올 때마다 건별로 국내 개별 배송하는 풀필먼트 서비스입니다. 재고 현황은 대시보드에서 확인합니다.</p>
          </div>
        </div>
      </section>

      {/* 부가서비스 필터 카드 */}
      <section className="bg-surface border-y border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold text-heading">입고 후 부가서비스</h2>
          <p className="mt-3 text-secondary">창고에서 판매 준비까지 마치고 받아보세요. 단가는 요금 안내에서 공개합니다.</p>
          <div className={`mt-8 ${CARD} p-6 space-y-5`}>
            {ADDON_GROUPS.map(([group, items]) => (
              <div key={group} className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-heading w-20 shrink-0">{group}</span>
                {items.map((i) => (
                  <span key={i} className="text-sm font-medium rounded-full bg-bg border border-black/5 text-secondary px-4 py-1.5">{i}</span>
                ))}
              </div>
            ))}
          </div>
          <Link href="/guide/services" className="inline-block mt-6 text-sm font-semibold text-accent">부가서비스 안내 보기 →</Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-surface border-y border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold text-heading">자주 묻는 질문</h2>
          <div className="mt-8 space-y-4">
            {FAQ.map(([q, a]) => (
              <details key={q} className={`${CARD} p-5`}>
                <summary className="font-semibold text-heading cursor-pointer">{q}</summary>
                <p className="mt-3 text-sm text-secondary">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <TrustStats />
      <SectionCta title="배송대행, 창고 주소부터 받아보세요" sub="가입하면 전용 입고 코드가 붙은 중국 창고 주소가 발급됩니다." />
      <SiteFooter />
    </main>
  );
}
