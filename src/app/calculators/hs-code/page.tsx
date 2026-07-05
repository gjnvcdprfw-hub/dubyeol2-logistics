import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import ComingSoon from "@/components/public/coming-soon";

export const metadata: Metadata = {
  title: "HS코드 조회 | 물류",
  description: "상품명을 입력하면 HS코드 후보와 기본 관세율을 찾아주는 도구를 준비하고 있습니다.",
};

export default function HsCodePage() {
  return (
    <main className="bg-bg text-body">
      <SiteHeader />

      <section className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-sm text-secondary">
          <Link href="/calculators" className="hover:text-heading">계산기</Link> / HS코드 조회
        </p>
        <h1 className="mt-2 text-3xl md:text-4xl font-semibold text-heading">HS코드 조회</h1>
        <p className="mt-3 text-secondary">
          HS코드는 수입 상품마다 부여되는 품목 분류 번호로, 관세율과 수입 요건이 이 번호로 결정됩니다.
          상품명을 입력하면 HS코드 후보와 기본 관세율을 찾아주는 도구를 준비하고 있습니다.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-secondary">
          <li>· 상품명 검색으로 HS코드 후보 확인</li>
          <li>· 코드별 기본 관세율 안내</li>
          <li>· FTA 관세율 비교로 바로 연결</li>
        </ul>
        <p className="mt-4 text-xs text-muted">
          HS코드는 참고용 안내이며, 최종 품목 분류는 관세사·세관 판단이 우선합니다.
        </p>

        <div className="mt-10">
          <ComingSoon feature="HS코드 조회" />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
