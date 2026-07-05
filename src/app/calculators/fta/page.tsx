import Link from "next/link";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import ComingSoon from "@/components/public/coming-soon";

export default function FtaPage() {
  return (
    <main className="bg-bg text-body">
      <SiteHeader />

      <section className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-sm text-secondary">
          <Link href="/calculators" className="hover:text-heading">계산기</Link> / FTA 관세율 비교
        </p>
        <h1 className="mt-2 text-3xl md:text-4xl font-semibold text-heading">FTA 관세율 비교</h1>
        <p className="mt-3 text-secondary">
          같은 상품이라도 기본세율, WTO 협정세율, 한중 FTA 세율이 다를 수 있고, 조건을 갖추면 더 낮은 세율을 적용받을 수 있습니다.
          HS코드를 입력하면 세 가지 세율을 나란히 비교하는 도구를 준비하고 있습니다.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-secondary">
          <li>· 기본세율 · WTO 협정세율 · 한중 FTA 세율 비교</li>
          <li>· 가장 유리한 세율 표시</li>
          <li>· 원산지 증명 등 적용 조건 안내</li>
        </ul>
        <p className="mt-4 text-xs text-muted">
          세율 비교는 참고용 안내이며, 최종 적용 세율은 관세사·세관 판단이 우선합니다.
        </p>

        <div className="mt-10">
          <ComingSoon feature="FTA 관세율 비교" />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
