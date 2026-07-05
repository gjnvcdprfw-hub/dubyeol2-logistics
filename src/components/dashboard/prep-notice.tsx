// 대시보드용 "준비 중" 안내 카드. 거짓 기능 0 원칙 — 아직 안 되는 기능은 명시한다.
export default function PrepNotice({ feature, description }: { feature: string; description?: string }) {
  return (
    <div className="rounded-[16px] bg-surface-alt border border-black/5 p-8 text-center">
      <p className="text-2xl">🚧</p>
      <p className="mt-3 font-semibold text-heading">준비 중 — {feature}은(는) 곧 열립니다</p>
      <p className="mt-2 text-sm text-secondary">{description ?? "정식 오픈 시 이용하실 수 있습니다."}</p>
    </div>
  );
}
