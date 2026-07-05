import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import ComingSoon from "@/components/public/coming-soon";

export const metadata: Metadata = {
  title: "HS코드 조회 | 물류",
  description: "상품명을 입력하면 HS코드 후보와 기본 관세율을 찾아주는 도구를 준비하고 있습니다.",
};

const LOOKUP_STEPS = [
  ["상품명 입력", "한글 상품명이나 중국어 상품명을 입력해 후보를 찾습니다."],
  ["후보 비교", "용도·재질·구성품 설명을 보고 맞는 분류를 좁힙니다."],
  ["세율·요건 연결", "FTA 비교와 세관 요건 확인으로 이어서 검토합니다."],
] as const;

const RELATED = [
  { title: "FTA 관세율 비교", href: "/calculators/fta", desc: "같은 HS코드의 세율 차이를 비교합니다." },
  { title: "세관 요건 확인", href: "/calculators/customs-req", desc: "KC·검역 등 수입 전 확인할 요건을 봅니다." },
  { title: "수입비용 계산기", href: "/calculators/import-cost", desc: "관세와 부가세까지 원가 구조를 봅니다." },
] as const;

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
          같은 상품이라도 코드가 달라지면 세율과 요건이 달라지므로, 주문 전에 코드를 확인해 두면 통관 단계의 변수를 크게 줄일 수 있습니다.
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

        <div className="mt-8 rounded-[16px] bg-surface border border-black/5 p-6">
          <label className="text-sm">
            <span className="font-semibold text-heading">상품명</span>
            <input
              type="text"
              disabled
              placeholder="예: 여성 니트, 플라스틱 수납함"
              className="mt-2 w-full rounded-[12px] border border-black/10 bg-bg px-4 py-3 text-sm text-body outline-none"
            />
          </label>
          <button type="button" disabled className="mt-4 w-full rounded-[12px] bg-accent px-4 py-3 text-sm font-semibold text-white opacity-60 cursor-not-allowed">
            HS코드 조회
          </button>
          <p className="mt-3 text-xs text-muted">실조회 아님: 외부 HS코드 API를 호출하지 않습니다.</p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {LOOKUP_STEPS.map(([title, desc], index) => (
            <div key={title} className="rounded-[16px] bg-surface border border-black/5 p-5">
              <p className="text-sm font-bold text-accent">{index + 1}단계</p>
              <p className="mt-2 font-semibold text-heading">{title}</p>
              <p className="mt-2 text-sm text-secondary">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-heading">연결 도구</h2>
          <div className="mt-5 space-y-3">
            {RELATED.map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-[16px] bg-surface border border-black/5 p-5 hover:border-accent/40 transition-colors">
                <p className="font-semibold text-heading">{item.title}</p>
                <p className="mt-1 text-sm text-secondary">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <ComingSoon feature="HS코드 조회" />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
