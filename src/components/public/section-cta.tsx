import Link from "next/link";

type SectionCtaProps = {
  title: string;
  sub: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export default function SectionCta({
  title,
  sub,
  primaryHref = "/auth/register",
  primaryLabel = "무료 가입하기",
  secondaryHref = "/search",
  secondaryLabel = "1688 검색 먼저 해보기",
}: SectionCtaProps) {
  return (
    <section className="bg-surface border-y border-black/5">
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <p className="text-sm font-semibold text-brand">무료 가입 / 공개 검색 진입</p>
        <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-heading">{title}</h2>
        <p className="mt-4 text-secondary">{sub}</p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link href={primaryHref} className="bg-accent text-white text-lg font-semibold rounded-[12px] px-8 py-4">{primaryLabel}</Link>
          <Link href={secondaryHref} className="text-heading text-lg font-semibold px-4 py-4">{secondaryLabel} →</Link>
        </div>
      </div>
    </section>
  );
}
