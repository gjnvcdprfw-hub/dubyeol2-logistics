import Link from "next/link";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import ComingSoon from "@/components/public/coming-soon";

export default function CustomsReqPage() {
  return (
    <main className="bg-bg text-body">
      <SiteHeader />

      <section className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-sm text-secondary">
          <Link href="/calculators" className="hover:text-heading">계산기</Link> / 세관 요건 확인
        </p>
        <h1 className="mt-2 text-3xl md:text-4xl font-semibold text-heading">세관 요건 확인</h1>
        <p className="mt-3 text-secondary">
          전자제품의 KC 인증, 식품의 검역처럼 품목에 따라 수입 전 갖춰야 하는 요건이 다릅니다.
          요건을 모르고 들여오면 통관이 막힐 수 있어, 주문 전에 품목별 수입 요건을 미리 확인하는 도구를 준비하고 있습니다.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-secondary">
          <li>· 품목·HS코드로 수입 요건 대상 여부 확인</li>
          <li>· KC 인증, 검역 등 필요한 절차 안내</li>
          <li>· 요건 미충족 시 통관 위험 사전 안내</li>
        </ul>
        <p className="mt-4 text-xs text-muted">
          요건 확인은 참고용 안내이며, 최종 판단은 관세사·세관 기준이 우선합니다.
        </p>

        <div className="mt-10">
          <ComingSoon feature="세관 요건 확인" />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
