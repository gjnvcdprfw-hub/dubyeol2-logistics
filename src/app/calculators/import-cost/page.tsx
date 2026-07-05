import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import ComingSoon from "@/components/public/coming-soon";

export const metadata: Metadata = {
  title: "수입비용 계산기 | 물류",
  description: "상품가와 HS코드를 입력하면 운임, 관세, 부가세까지 총 수입비용을 한 번에 추정하는 도구를 준비하고 있습니다.",
};

const COST_LINES = [
  ["상품가", "판매자에게 지급하는 상품 금액"],
  ["국제운임", "해운·항공 배송비 계산기와 연결"],
  ["관세", "HS코드와 적용 세율 기준"],
  ["부가세", "과세가격과 관세를 반영"],
  ["부가서비스", "검수, 포장, 라벨 등 선택 작업"],
] as const;

const RELATED = [
  { title: "배송비 계산기", href: "/calculators/shipping-cost" },
  { title: "HS코드 조회", href: "/calculators/hs-code" },
  { title: "요금 안내", href: "/guide/pricing" },
] as const;

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
          판매가를 정하기 전에 원가 구조를 항목별로 알아야 마진 계산이 어긋나지 않습니다.
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

        <div className="mt-8 rounded-[16px] bg-surface border border-black/5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            {["상품가", "국제운임", "HS코드", "예상 관세율"].map((label) => (
              <label key={label} className="text-sm">
                <span className="font-semibold text-heading">{label}</span>
                <input
                  type="text"
                  disabled
                  placeholder="정식 오픈 전 확정"
                  className="mt-2 w-full rounded-[12px] border border-black/10 bg-bg px-4 py-3 text-sm text-body outline-none"
                />
              </label>
            ))}
          </div>
          <button type="button" disabled className="mt-4 w-full rounded-[12px] bg-accent px-4 py-3 text-sm font-semibold text-white opacity-60 cursor-not-allowed">
            수입비용 계산
          </button>
          <p className="mt-3 text-xs text-muted">실계산 아님: 세율·환율·통관 API를 호출하지 않습니다.</p>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-heading">비용 항목 구조</h2>
          <div className="mt-5 space-y-3">
            {COST_LINES.map(([title, desc]) => (
              <div key={title} className="rounded-[16px] bg-surface border border-black/5 p-5">
                <p className="font-semibold text-heading">{title}</p>
                <p className="mt-1 text-sm text-secondary">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-[16px] bg-surface-alt border border-black/5 p-6">
          <h2 className="text-2xl font-semibold text-heading">먼저 볼 도구</h2>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            {RELATED.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-[12px] bg-white border border-black/10 px-4 py-3 font-semibold text-heading hover:border-accent/40">
                {item.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <ComingSoon feature="수입비용 계산기" />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
