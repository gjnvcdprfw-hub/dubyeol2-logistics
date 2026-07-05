import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import StatusTile, { StatusTone } from "@/components/dashboard/status-tile";
import PrepNotice from "@/components/dashboard/prep-notice";

// 출고 관리 (benchmark §2.6). 상태 탭 5 — 아직 출고 기능이 없어 전부 0, 준비 중.
const TILES: { label: string; tone: StatusTone }[] = [
  { label: "포장중", tone: "warning" },
  { label: "발송대기", tone: "info" },
  { label: "결제대기", tone: "warning" },
  { label: "발송예정", tone: "info" },
  { label: "발송완료", tone: "success" },
];

export default async function ShipmentPage() {
  const session = await getSession();
  if (!session.userId) redirect("/auth/login");
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-heading">출고 관리</h1>
      <div className="bg-surface rounded-[27px] shadow-card p-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {TILES.map((t) => (
            <StatusTile key={t.label} label={t.label} count={0} tone={t.tone} />
          ))}
        </div>
        <p className="mt-6 text-center text-muted">이 상태에 해당하는 출고 건이 아직 없습니다</p>
      </div>
      <PrepNotice feature="출고 관리" />
    </div>
  );
}
