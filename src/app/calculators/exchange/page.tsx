import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import ComingSoon from "@/components/public/coming-soon";

export const metadata: Metadata = {
  title: "환율 계산기 | 물류",
  description: "USD·CNY·KRW 세 통화를 서로 환산하는 환율 계산 도구를 준비하고 있습니다.",
};

const CURRENCIES = ["CNY", "KRW", "USD"] as const;

const NOTES = [
  "견적서의 ¥ 단가는 결제일 당일 환율로 원화 환산됩니다.",
  "환율은 고객이 직접 입력한 값으로 계산하는 수동 도구로 준비합니다.",
  "실시간 환율 API 연결은 정식 오픈 전 별도 승인 후 진행합니다.",
] as const;

export default function ExchangePage() {
  return (
    <main className="bg-bg text-body">
      <SiteHeader />

      <section className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-sm text-secondary">
          <Link href="/calculators" className="hover:text-heading">계산기</Link> / 환율 계산기
        </p>
        <h1 className="mt-2 text-3xl md:text-4xl font-semibold text-heading">환율 계산기</h1>
        <p className="mt-3 text-secondary">
          중국 수입은 위안화(CNY) 결제, 일부 거래는 달러(USD) 기준이라 통화 환산이 자주 필요합니다.
          견적서의 ¥ 단가도 결제일 당일 환율로 원화 환산되므로, 환율 감각이 있으면 원가 예측이 쉬워집니다.
          USD·CNY·KRW 세 통화를 서로 환산하는 도구를 준비하고 있습니다.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-secondary">
          <li>· USD ↔ CNY ↔ KRW 상호 환산</li>
          <li>· 환율 직접 입력으로 원하는 기준 적용</li>
        </ul>
        <p className="mt-4 text-xs text-muted">
          환산 결과는 참고용이며, 실제 정산은 결제일 환율 기준입니다.
        </p>

        <div className="mt-8 rounded-[16px] bg-surface border border-black/5 p-6">
          <div className="grid gap-4 md:grid-cols-3">
            {CURRENCIES.map((currency) => (
              <label key={currency} className="text-sm">
                <span className="font-semibold text-heading">{currency}</span>
                <input
                  type="text"
                  disabled
                  placeholder="수동 입력 예정"
                  className="mt-2 w-full rounded-[12px] border border-black/10 bg-bg px-4 py-3 text-sm text-body outline-none"
                />
              </label>
            ))}
          </div>
          <button type="button" disabled className="mt-4 w-full rounded-[12px] bg-accent px-4 py-3 text-sm font-semibold text-white opacity-60 cursor-not-allowed">
            환산하기
          </button>
          <p className="mt-3 text-xs text-muted">실조회 아님: 외부 환율 API를 호출하지 않습니다.</p>
        </div>

        <div className="mt-10 rounded-[16px] bg-surface-alt border border-black/5 p-6">
          <h2 className="text-2xl font-semibold text-heading">환율 적용 기준</h2>
          <ul className="mt-4 space-y-2 text-sm text-secondary">
            {NOTES.map((note) => (
              <li key={note}>· {note}</li>
            ))}
          </ul>
          <Link href="/guide/pricing" className="mt-5 inline-block text-sm font-semibold text-accent">
            요금 안내 보기 →
          </Link>
        </div>

        <div className="mt-10">
          <ComingSoon feature="환율 계산기" />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
