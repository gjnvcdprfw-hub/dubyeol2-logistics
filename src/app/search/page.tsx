import type { Metadata } from "next";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import TrustStats from "@/components/public/trust-stats";
import SectionCta from "@/components/public/section-cta";
import ComingSoon from "@/components/public/coming-soon";

export const metadata: Metadata = {
  title: "1688 상품 검색 | 물류",
  description: "한국어 키워드로 1688 상품을 찾고, 마음에 드는 상품은 그대로 견적을 요청하세요. 검색 기능은 준비 중입니다.",
};

const CATEGORIES = [
  "전체", "의류", "잡화·액세서리", "생활용품", "주방", "뷰티",
  "완구·취미", "반려용품", "스포츠·레저", "전자·디지털",
];

export default function SearchPage() {
  return (
    <main className="bg-bg text-body">
      <SiteHeader />

      {/* 검색 히어로 */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h1 className="text-4xl md:text-5xl font-semibold text-heading leading-tight">
          1688 상품, <span className="text-accent">한국어로 검색</span>
        </h1>
        <p className="mt-5 text-lg text-secondary max-w-2xl">
          한국어 키워드로 1688 상품을 찾고, 마음에 드는 상품은 그대로 견적을 요청하세요.
          입력한 한국어를 중국어로 자동 번역해 검색하고, 사진으로 찾는 이미지 검색도 함께 준비하고 있습니다.
          검색은 회원가입 없이 누구나 쓸 수 있게 열 예정입니다.
        </p>
        <div className="mt-8 max-w-2xl">
          <div className="flex items-center gap-2 rounded-[16px] bg-surface border border-black/10 p-2 shadow-[0_7px_30px_rgba(90,114,123,0.11)]">
            <input
              type="text"
              placeholder="상품명을 한국어로 입력하세요"
              disabled
              className="flex-1 px-4 py-3 bg-transparent text-sm text-body placeholder:text-muted outline-none"
            />
            <button
              type="button"
              disabled
              className="bg-accent text-white text-sm font-semibold rounded-[12px] px-6 py-3 shrink-0 opacity-60 cursor-not-allowed"
            >
              검색
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">🚧 검색은 준비 중입니다 — 정식 오픈 후 이용하실 수 있습니다.</p>
        </div>
        {/* 카테고리 칩 */}
        <div className="mt-8 flex flex-wrap gap-2">
          {CATEGORIES.map((c, i) => (
            <span
              key={c}
              className={
                i === 0
                  ? "text-sm font-semibold rounded-full bg-accent text-white px-4 py-2"
                  : "text-sm font-medium rounded-full bg-surface border border-black/5 text-secondary px-4 py-2"
              }
            >
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* 준비 중 안내 */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <ComingSoon feature="1688 상품 검색" />
      </section>

      <TrustStats />
      <SectionCta title="검색이 열리면 가장 먼저 써보세요" sub="지금 가입하면 1688 검색 오픈 소식을 먼저 알려드립니다." />
      <SiteFooter />
    </main>
  );
}
