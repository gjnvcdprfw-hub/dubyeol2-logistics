import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import TrustStats from "@/components/public/trust-stats";
import SectionCta from "@/components/public/section-cta";
import ComingSoon from "@/components/public/coming-soon";
import { RATES } from "@/lib/rates";

export const metadata: Metadata = {
  title: "배송조회 | 물류",
  description: "중국 택배와 한국 배송 흐름을 한 화면에서 확인하는 배송조회 기준판입니다. 실시간 조회 기능은 준비 중입니다.",
};

const CARD = "rounded-[16px] bg-surface shadow-[0_7px_30px_rgba(90,114,123,0.11)]";

const SHIPPING_ROWS: [string, string, string][] = [
  ["해운 택배", `첫 1kg ¥${RATES.sea.firstKgFen / 100} + 추가 kg당 ¥${RATES.sea.additionalPerKgFen / 100} (kg 올림)`, "약 5~7일"],
  ["항공 택배", `서류비 ¥${RATES.air.docFeeFen / 100} + 100g당 ¥${RATES.air.per100gFen / 100} (100g 올림)`, "약 3일"],
];

const HELP_LINKS = [
  { title: "조회가 안 될 때", desc: "판매자가 번호를 발급했지만 택배사 반영 전일 수 있습니다." },
  { title: "배송 기간", desc: "입고, 출고, 국제 운송, 통관, 국내 배송 구간별로 소요 시간이 달라집니다." },
  { title: "파손·분실", desc: "외포장 이상과 운송 중 파손은 입고·출고 증거 기준으로 확인합니다." },
  { title: "관세 안내", desc: "품목과 금액에 따라 통관 서류와 관·부가세가 달라질 수 있습니다." },
];

const FLOW = [
  ["판매자 발송", "중국 판매자가 택배사에 상품을 넘기고 운송장 번호를 발급합니다."],
  ["중국 창고 입고", "창고 도착 후 입고 사진과 외포장 이상 여부를 확인합니다."],
  ["국제 출고", "묶음·검수·부가서비스가 끝난 뒤 해운 또는 항공으로 출고합니다."],
  ["통관·국내 배송", "한국 도착 후 통관을 거쳐 국내 택배로 이동합니다."],
] as const;

const RELATED = [
  { title: "배송대행", desc: "직접 구매한 상품을 중국 창고로 보내 한국까지 받습니다.", href: "/services/shipping-agency" },
  { title: "배송비 계산기", desc: "공개 요율 기준으로 해운·항공 예상 운임을 비교합니다.", href: "/calculators/shipping-cost" },
  { title: "요금 안내", desc: "국제 운임, 보관료, 부가서비스 요율을 확인합니다.", href: "/guide/pricing" },
  { title: "HS코드 조회", desc: "통관에 필요한 품목 분류 도구입니다. 준비 중입니다.", href: "/calculators/hs-code" },
] as const;

export default function TrackingPage() {
  return (
    <main className="bg-bg text-body">
      <SiteHeader />

      {/* 운송장 입력 히어로 */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <p className="text-sm font-semibold text-accent">배송조회</p>
        <h1 className="mt-2 text-4xl md:text-5xl font-semibold text-heading leading-tight">
          중국 택배 조회
        </h1>
        <p className="mt-5 text-lg text-secondary max-w-3xl">
          중국 판매자 발송부터 창고 입고, 국제 운송, 통관, 국내 배송까지 한 화면에서 이어서 보는 기준판입니다.
          지금은 로컬 기준판이라 실제 택배사와 세관을 조회하지 않습니다.
        </p>

        <div className="mt-8 max-w-3xl">
          <div className="flex flex-wrap gap-2 text-sm">
            <button type="button" disabled className="rounded-full bg-accent text-white px-4 py-2 font-semibold opacity-90">
              CN 중국 택배
            </button>
            <button type="button" disabled className="rounded-full bg-surface border border-black/10 px-4 py-2 font-semibold text-heading opacity-70">
              KR 한국 배송
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-[16px] bg-surface border border-black/10 p-2 shadow-[0_7px_30px_rgba(90,114,123,0.11)]">
            <input
              type="text"
              placeholder="운송장 번호를 입력하거나 붙여넣으세요"
              disabled
              className="flex-1 px-4 py-3 bg-transparent text-sm text-body placeholder:text-muted outline-none"
            />
            <button
              type="button"
              disabled
              className="bg-surface-alt text-heading text-sm font-semibold rounded-[12px] px-4 py-3 shrink-0 opacity-60 cursor-not-allowed"
            >
              붙여넣기
            </button>
            <button
              type="button"
              disabled
              className="bg-accent text-white text-sm font-semibold rounded-[12px] px-6 py-3 shrink-0 opacity-60 cursor-not-allowed"
            >
              배송조회
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">
            실조회 아님: 외부 배송조회 API를 호출하지 않습니다. 시간당 조회 제한 안내와 실제 조회 결과는 정식 오픈 전 확정됩니다.
          </p>
        </div>
      </section>

      {/* 조회 도움말 */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-semibold text-heading">조회 안 될 때 먼저 확인할 것</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {HELP_LINKS.map((item) => (
            <div key={item.title} className="rounded-[16px] bg-surface border border-black/5 p-5">
              <p className="font-semibold text-heading">{item.title}</p>
              <p className="mt-2 text-sm text-secondary">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 배송 흐름 */}
      <section className="bg-surface border-y border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold text-heading">중국에서 한국까지 배송 흐름</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {FLOW.map(([title, desc], index) => (
              <div key={title} className="rounded-[16px] bg-bg border border-black/5 p-5">
                <p className="text-sm font-bold text-accent">{index + 1}단계</p>
                <p className="mt-2 font-semibold text-heading">{title}</p>
                <p className="mt-2 text-sm text-secondary">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 배송비 안내 표 — RATES 파생 */}
      <section className="bg-surface-alt border-y border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold text-heading">국제 배송비 안내</h2>
          <p className="mt-3 text-secondary">
            실중량과 부피중량(가로×세로×높이 cm³ ÷ {RATES.volumeDivisor.toLocaleString()}) 중 큰 값이 청구중량입니다.
          </p>
          <div className={`mt-8 overflow-x-auto ${CARD}`}>
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="border-b border-black/5 text-left">
                  <th className="px-5 py-4 font-semibold text-heading">배송 방식</th>
                  <th className="px-5 py-4 font-semibold text-heading">요율</th>
                  <th className="px-5 py-4 font-semibold text-heading">예상 소요</th>
                </tr>
              </thead>
              <tbody>
                {SHIPPING_ROWS.map(([method, rate, days]) => (
                  <tr key={method} className="border-b border-black/5 last:border-0">
                    <td className="px-5 py-4 font-semibold text-heading">{method}</td>
                    <td className="px-5 py-4 text-secondary">{rate}</td>
                    <td className="px-5 py-4 text-secondary">{days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-muted">
            ¥ 단가는 결제일 환율이 적용되며, 위 요율은 참고용입니다. 최종 금액은 출고 시 확정됩니다.
          </p>
          <Link href="/calculators" className="inline-block mt-4 text-sm font-semibold text-accent">계산기로 예상 운임 확인하기 →</Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[16px] bg-surface border border-black/5 p-6">
            <h2 className="text-2xl font-semibold text-heading">배송대행과 구매대행 차이</h2>
            <div className="mt-5 space-y-4 text-sm text-secondary">
              <p><b className="text-heading">배송대행</b>은 고객이 직접 구매한 상품을 창고로 보내고, 입고·묶음·출고만 맡기는 흐름입니다.</p>
              <p><b className="text-heading">구매대행</b>은 상품 검색, 결제, 판매자 커뮤니케이션, 입고 확인까지 함께 맡기는 흐름입니다.</p>
              <p>두 흐름 모두 배송조회는 같은 단계판에서 확인할 수 있게 준비 중입니다.</p>
            </div>
          </div>
          <div className="rounded-[16px] bg-surface border border-black/5 p-6">
            <h2 className="text-2xl font-semibold text-heading">자동 연동 준비 상태</h2>
            <div className="mt-5 space-y-4 text-sm text-secondary">
              <p>1688 주문 연동, 운송장 자동 조회, HS코드 자동 분류는 실제 외부 API 호출 없이 로컬 기준판으로만 표시합니다.</p>
              <p>정식 오픈 전 API 계약, 조회 제한, 고객 동의 절차가 확정되면 실제 조회 기능으로 전환합니다.</p>
              <p className="font-semibold text-accent">지금 화면은 준비 중 담장이 보이는지 확인하는 기준판입니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 관련 서비스 */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-semibold text-heading">관련 서비스 바로가기</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {RELATED.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-[16px] bg-surface border border-black/5 p-5 hover:border-accent/40 transition-colors">
              <p className="font-semibold text-heading">{item.title}</p>
              <p className="mt-2 text-sm text-secondary">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <ComingSoon feature="실시간 배송조회" />
      </section>

      <TrustStats />
      <SectionCta title="입고부터 도착까지, 단계별로 알려드립니다" sub="가입하면 대시보드에서 내 화물 상태를 한눈에 볼 수 있습니다." />
      <SiteFooter />
    </main>
  );
}
