const STATS = [
  { title: "정식 오픈 준비 중", sub: "지금 가입하면 오픈과 요율 확정 소식을 가장 먼저 받습니다" },
  { title: "요율 전면 공개", sub: "수수료·운임·검수비·부가서비스 단가를 공개 요율표로 확인" },
  { title: "입고 사진 기본 제공", sub: "중국 창고 도착 시 사진 1~2장과 외포장 이상 여부 무료 안내" },
  { title: "실시간 상담 (준비 중)", sub: "정식 오픈 후 채팅 상담이 열립니다" },
];

export default function TrustStats() {
  return (
    <section className="bg-surface-alt border-y border-black/5">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {STATS.map((s) => (
          <div key={s.title}>
            <p className="font-semibold text-heading">{s.title}</p>
            <p className="mt-1 text-xs text-secondary">{s.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
