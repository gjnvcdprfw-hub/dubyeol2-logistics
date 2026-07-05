import type { Metadata } from "next";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import TrustStats from "@/components/public/trust-stats";
import SectionCta from "@/components/public/section-cta";

export const metadata: Metadata = {
  title: "1688 상품 검색 | 물류",
  description: "한국어 키워드로 1688 상품을 찾고, 마음에 드는 상품은 그대로 견적을 요청하세요. 검색 기능은 준비 중입니다.",
};

const CATEGORIES = [
  "전체", "의류", "잡화·액세서리", "생활용품", "주방", "뷰티",
  "완구·취미", "반려용품", "스포츠·레저", "전자·디지털",
];

const SERVICE_POINTS: [string, string][] = [
  ["번역 검색", "한국어 상품명을 중국어 검색 흐름으로 연결하는 자리입니다."],
  ["이미지 검색", "상품 사진으로 찾는 진입은 자리표시만 두고 실제 업로드는 막았습니다."],
  ["구매대행 연결", "검색 결과에서 견적 요청으로 이어지는 공개 흐름을 보여줍니다."],
];

const PLACEHOLDER_PRODUCTS = [
  "상품 이미지 자리",
  "인기 상품 피드 자리",
  "카테고리 추천 자리",
  "검색 결과 카드 자리",
];

export default function SearchPage() {
  return (
    <main className="bg-bg text-body">
      <SiteHeader />

      <TrustStats />

      <section className="max-w-6xl mx-auto px-6 py-20">
        <p className="text-sm font-semibold text-accent">1688 상품 검색</p>
        <h1 className="text-4xl md:text-5xl font-semibold text-heading leading-tight">
          한국어로 찾고,<br /><span className="text-accent">구매대행으로 이어집니다</span>
        </h1>
        <p className="mt-5 text-lg text-secondary max-w-2xl">
          한국어 키워드로 1688 상품을 찾고, 마음에 드는 상품은 그대로 견적을 요청하세요.
          번역 검색, 이미지 검색, 인기 카테고리, 상품 피드 구조를 기준판으로 두되 실제 1688 API 호출은 하지 않습니다.
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
              className="hidden sm:inline-flex bg-surface-alt text-secondary text-sm font-semibold rounded-[12px] px-4 py-3 shrink-0 cursor-not-allowed"
            >
              번역
            </button>
            <button
              type="button"
              disabled
              className="hidden sm:inline-flex bg-surface-alt text-secondary text-sm font-semibold rounded-[12px] px-4 py-3 shrink-0 cursor-not-allowed"
            >
              이미지
            </button>
            <button
              type="button"
              disabled
              className="bg-accent text-white text-sm font-semibold rounded-[12px] px-6 py-3 shrink-0 opacity-60 cursor-not-allowed"
            >
              검색
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">🚧 검색·번역·이미지 검색은 준비 중입니다. 입력해도 외부 사이트로 전송되지 않습니다.</p>
        </div>
      </section>

      <section className="bg-surface border-y border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold text-heading">상품 검색 뒤에 이어지는 서비스</h2>
          <p className="mt-3 text-secondary max-w-2xl">
            원본 공개 화면처럼 검색이 단독 기능으로 끝나지 않고 번역, 이미지 검색, 구매대행 안내로 이어지는 구조입니다.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {SERVICE_POINTS.map(([title, desc]) => (
              <div key={title} className="rounded-[16px] bg-bg border border-black/5 p-6">
                <h3 className="font-semibold text-heading">{title}</h3>
                <p className="mt-2 text-sm text-secondary">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold text-heading">인기 카테고리</h2>
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

      <section className="bg-surface-alt border-y border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-3xl font-semibold text-heading">인기 상품</h2>
            <span className="text-xs font-semibold rounded-full bg-warning-tint text-heading px-3 py-1">이미지 자리표시</span>
          </div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {PLACEHOLDER_PRODUCTS.map((label, index) => (
              <div key={label} className="rounded-[16px] bg-surface border border-black/5 overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-[#fff7ed] to-[#f9fafb] flex items-center justify-center text-xs text-muted text-center px-4">
                  {label}
                </div>
                <div className="p-4">
                  <p className="font-semibold text-heading">상품 카드 {index + 1}</p>
                  <p className="mt-1 text-xs text-secondary">실제 상품명·이미지는 오픈 전 연결</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionCta title="검색이 열리면 가장 먼저 써보세요" sub="지금 가입하면 1688 검색 오픈 소식을 먼저 알려드립니다." />
      <SiteFooter />
    </main>
  );
}
