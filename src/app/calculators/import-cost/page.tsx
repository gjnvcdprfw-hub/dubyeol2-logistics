import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import ComingSoon from "@/components/public/coming-soon";

export const metadata: Metadata = {
  title: "수입비용 계산기 | 물류",
  description: "상품가와 HS코드를 입력하면 운임, 관세, 부가세까지 총 수입비용을 한 번에 추정하는 도구를 준비하고 있습니다.",
};

export default function ImportCostPage() {
  return (
    <main className="bg-bg text-body">
      <SiteHeader />

      <section className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-sm text-secondary">
          <Link href="/calculators" className="hover:text-heading">계산기</Link> / 수입비용 계산기
        </p>
        <h1 className="mt-2 text-3xl md:text-4xl font-semibold text-heading">수입비용 계산기</h1>
        <p className="mt-3 text-secondary">
          상품가에 운임, 관세, 부가세까지 더해야 실제 수입 원가가 나옵니다.
          상품가와 HS코드를 입력하면 통관까지의 총 수입비용을 한 번에 추정하는 도구를 준비하고 있습니다.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-secondary">
          <li>· 상품가 + 국제운임 + 관세 + 부가세 합산 추정</li>
          <li>· 관세율은 HS코드 기준으로 자동 반영</li>
          <li>· 항목별 내역으로 원가 구조 확인</li>
        </ul>
        <p className="mt-4 text-xs text-muted">
          지금은 <Link href="/calculators/shipping-cost" className="text-accent font-semibold">배송비 계산기</Link>로 운임 부분을 먼저 확인할 수 있습니다.
        </p>

        <div className="mt-10">
          <ComingSoon feature="수입비용 계산기" />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
