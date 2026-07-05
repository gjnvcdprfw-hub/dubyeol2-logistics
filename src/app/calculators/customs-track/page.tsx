import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import ComingSoon from "@/components/public/coming-soon";

export const metadata: Metadata = {
  title: "통관 진행 조회 | 물류",
  description: "화물관리번호 또는 BL 번호로 세관 통관 진행 상태를 단계별로 조회하는 도구를 준비하고 있습니다.",
};

export default function CustomsTrackPage() {
  return (
    <main className="bg-bg text-body">
      <SiteHeader />

      <section className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-sm text-secondary">
          <Link href="/calculators" className="hover:text-heading">계산기</Link> / 통관 진행 조회
        </p>
        <h1 className="mt-2 text-3xl md:text-4xl font-semibold text-heading">통관 진행 조회</h1>
        <p className="mt-3 text-secondary">
          화물이 한국에 도착한 뒤 지금 통관 어느 단계인지 궁금할 때가 많습니다.
          화물관리번호 또는 BL 번호를 입력하면 세관 통관 진행 상태를 단계별로 조회하는 도구를 준비하고 있습니다.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-secondary">
          <li>· 화물관리번호 · BL 번호로 조회</li>
          <li>· 반입 → 신고 → 수리 등 진행 단계 표시</li>
          <li>· 지연 시 확인할 사항 안내</li>
        </ul>
        <p className="mt-4 text-xs text-muted">
          조회 결과는 참고용 안내이며, 정확한 통관 상태는 세관 기준이 우선합니다.
        </p>

        <div className="mt-10">
          <ComingSoon feature="통관 진행 조회" />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
