import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import ComingSoon from "@/components/public/coming-soon";

export const metadata: Metadata = {
  title: "환율 계산기 | 물류",
  description: "USD·CNY·KRW 세 통화를 서로 환산하는 환율 계산 도구를 준비하고 있습니다.",
};

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

        <div className="mt-10">
          <ComingSoon feature="환율 계산기" />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
