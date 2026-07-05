import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import PrepNotice from "@/components/dashboard/prep-notice";

// 반품 관리 (benchmark §2.7). 탭 6 + 안내 — 반품 접수 기능은 준비 중.
const TABS = ["전체", "처리대기", "승인", "거절", "처리중", "완료"];

export default async function ReturnsPage() {
  const session = await getSession();
  if (!session.userId) redirect("/auth/login");
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-heading">반품 관리</h1>
      <div className="flex flex-wrap gap-2">
        {TABS.map((label, i) => (
          <span
            key={label}
            className={`rounded-full px-4 py-2 text-sm ${
              i === 0 ? "bg-accent text-white font-medium" : "bg-surface-alt text-muted"
            }`}
          >
            {label}
          </span>
        ))}
      </div>
      <div className="bg-surface rounded-[27px] shadow-card p-12 text-center text-muted">
        반품 요청 내역이 없습니다
      </div>
      <div className="bg-surface rounded-[27px] shadow-card p-6">
        <p className="font-semibold text-heading">반품 처리 안내</p>
        <ul className="mt-3 space-y-1 text-sm text-secondary list-disc list-inside">
          <li>반품 요청 후 창고 담당자가 확인하여 승인 또는 거절합니다.</li>
          <li>처리에는 영업일 기준 2~3일이 소요됩니다.</li>
          <li>승인 시 환급 절차는 정식 오픈 시 안내드립니다.</li>
        </ul>
      </div>
      <PrepNotice feature="반품 관리" />
    </div>
  );
}
