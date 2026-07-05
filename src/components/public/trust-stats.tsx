const STATS = [
  { value: "오픈 전 확정", label: "누적 고객" },
  { value: "오픈 전 확정", label: "거래 건수" },
  { value: "오픈 전 확정", label: "검품·배송 흐름" },
  { value: "오픈 전 확정", label: "상담 응답 기준" },
];

export default function TrustStats() {
  return (
    <section className="bg-surface-alt border-y border-black/5">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-[16px] bg-surface border border-black/5 px-4 py-6">
            <p className="font-semibold text-heading">{s.value}</p>
            <p className="mt-2 text-xs text-secondary">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
