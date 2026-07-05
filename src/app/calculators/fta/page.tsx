import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import ComingSoon from "@/components/public/coming-soon";

export const metadata: Metadata = {
  title: "FTA 관세율 비교 | 물류",
  description: "HS코드를 입력하면 기본세율, WTO 협정세율, 한중 FTA 세율을 나란히 비교하는 도구를 준비하고 있습니다.",
};

const RATE_COLUMNS = [
  ["기본세율", "품목 기본 기준"],
  ["WTO 협정세율", "협정 적용 가능 여부 확인"],
  ["한중 FTA", "원산지 증명 충족 여부 확인"],
] as const;

const CHECKLIST = [
  "HS코드가 확정됐는지 확인",
  "원산지 증명 발급 가능 여부 확인",
  "품목별 예외 요건과 통관 서류 확인",
] as const;

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
          특히 중국 수입은 한중 FTA 대상 품목이 많아, 원산지 증명만 갖춰도 관세 부담이 달라지는 경우가 적지 않습니다.
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

        <div className="mt-8 rounded-[16px] bg-surface border border-black/5 p-6">
          <label className="text-sm">
            <span className="font-semibold text-heading">HS코드</span>
            <input
              type="text"
              disabled
              placeholder="예: HS코드 입력"
              className="mt-2 w-full rounded-[12px] border border-black/10 bg-bg px-4 py-3 text-sm text-body outline-none"
            />
          </label>
          <button type="button" disabled className="mt-4 w-full rounded-[12px] bg-accent px-4 py-3 text-sm font-semibold text-white opacity-60 cursor-not-allowed">
            세율 비교
          </button>
          <p className="mt-3 text-xs text-muted">실조회 아님: 관세율 API를 호출하지 않습니다.</p>
        </div>

        <div className="mt-10 overflow-hidden rounded-[16px] border border-black/5 bg-surface">
          <div className="grid md:grid-cols-3">
            {RATE_COLUMNS.map(([title, desc]) => (
              <div key={title} className="border-b border-black/5 p-5 md:border-b-0 md:border-r last:border-r-0">
                <p className="font-semibold text-heading">{title}</p>
                <p className="mt-2 text-sm text-secondary">{desc}</p>
                <p className="mt-4 text-sm text-muted">준비 중</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-[16px] bg-surface-alt border border-black/5 p-6">
          <h2 className="text-2xl font-semibold text-heading">적용 전 확인</h2>
          <ul className="mt-4 space-y-2 text-sm text-secondary">
            {CHECKLIST.map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
          <Link href="/calculators/hs-code" className="mt-5 inline-block text-sm font-semibold text-accent">
            HS코드 먼저 확인하기 →
          </Link>
        </div>

        <div className="mt-10">
          <ComingSoon feature="FTA 관세율 비교" />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
