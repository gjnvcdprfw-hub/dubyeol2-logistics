// 두리무역 벤치 상태 칩 타일 (benchmark-duly.md §2.1). 틴트 배경 + 라벨 + 숫자.
export type StatusTone = "warning" | "success" | "info" | "muted";

const TONE_STYLES: Record<StatusTone, { bg: string; number: string }> = {
  warning: { bg: "bg-warning-tint/60", number: "text-accent" },
  success: { bg: "bg-success-tint", number: "text-success" },
  info: { bg: "bg-info/10", number: "text-info" },
  muted: { bg: "bg-surface-alt", number: "text-muted" },
};

export default function StatusTile({ label, count, tone }: { label: string; count: number; tone: StatusTone }) {
  const style = TONE_STYLES[tone];
  return (
    <div className={`rounded-[22.5px] ${style.bg} px-6 py-4 text-center`}>
      <p className="text-[12.8px] text-muted">{label}</p>
      <p className={`text-lg font-semibold ${style.number}`}>{count}</p>
    </div>
  );
}
