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
  description: "운송장 번호로 중국 창고 입고부터 한국 도착까지 단계별 위치를 확인할 수 있습니다. 배송조회 기능은 준비 중입니다.",
};

const CARD = "rounded-[16px] bg-surface shadow-[0_7px_30px_rgba(90,114,123,0.11)]";

const SHIPPING_ROWS: [string, string, string][] = [
  ["해운 택배", `첫 1kg ¥${RATES.sea.firstKgFen / 100} + 추가 kg당 ¥${RATES.sea.additionalPerKgFen / 100} (kg 올림)`, "약 5~7일"],
  ["항공 택배", `서류비 ¥${RATES.air.docFeeFen / 100} + 100g당 ¥${RATES.air.per100gFen / 100} (100g 올림)`, "약 3일"],
];

export default function TrackingPage() {
  return (
    <main className="bg-bg text-body">
      <SiteHeader />

      {/* 운송장 입력 히어로 */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h1 className="text-4xl md:text-5xl font-semibold text-heading leading-tight">
          내 짐, <span className="text-accent">지금 어디쯤일까요?</span>
        </h1>
        <p className="mt-5 text-lg text-secondary max-w-2xl">
          운송장 번호로 중국 창고 입고부터 한국 도착까지 단계별 위치를 확인할 수 있습니다.
          입고 → 출고 → 국제 운송 → 통관 → 국내 배송 순서로 지금 어느 구간인지 보여드릴 예정입니다.
        </p>
        <div className="mt-8 max-w-2xl">
          <div className="flex items-center gap-2 rounded-[16px] bg-surface border border-black/10 p-2 shadow-[0_7px_30px_rgba(90,114,123,0.11)]">
            <input
              type="text"
              placeholder="운송장 번호를 입력하세요"
              disabled
              className="flex-1 px-4 py-3 bg-transparent text-sm text-body placeholder:text-muted outline-none"
            />
            <button
              type="button"
              disabled
              className="bg-accent text-white text-sm font-semibold rounded-[12px] px-6 py-3 shrink-0 opacity-60 cursor-not-allowed"
            >
              조회
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">🚧 실시간 추적은 준비 중입니다 — 정식 오픈 후 이용하실 수 있습니다.</p>
        </div>
      </section>

      {/* 배송비 안내 표 — rates 파생 */}
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

      {/* 준비 중 안내 */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <ComingSoon feature="실시간 추적" />
      </section>

      <TrustStats />
      <SectionCta title="입고부터 도착까지, 단계별로 알려드립니다" sub="가입하면 대시보드에서 내 화물 상태를 한눈에 볼 수 있습니다." />
      <SiteFooter />
    </main>
  );
}
