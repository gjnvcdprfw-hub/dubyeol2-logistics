import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import StatusTile from "@/components/dashboard/status-tile";
import PrepNotice from "@/components/dashboard/prep-notice";

// 스마트오더 작업공간 — 벤치마크 문서 §2.4 구조.
// 카운터 4 + 탭 2 + 업로드 버튼 전부 준비 중 — 거짓 기능 0 원칙.

const COUNTERS = ["신청 건수", "확인 필요", "주문 준비", "매칭 라이브러리"];
const TABS = ["신청 목록", "매칭 라이브러리"];

export default async function SmartOrderPage() {
  const session = await getSession();
  if (!session.userId) redirect("/auth/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-heading">스마트오더 작업공간</h1>
        <p className="mt-1 text-sm text-secondary">스마트스토어·쿠팡 주문서를 엑셀 그대로 올리면 1688 상품 매칭부터 주문까지 이어지는 대량 주문 작업공간입니다. 한 번 매칭한 상품은 라이브러리에 저장되어 다음 주문부터 다시 매칭할 필요가 없습니다.</p>
      </div>

      <section className="bg-surface rounded-[27px] shadow-card p-6 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {COUNTERS.map((label) => (
            <StatusTile key={label} label={label} count={0} tone="muted" />
          ))}
        </div>

        <div className="flex items-center justify-between border-b border-black/5 pb-3">
          <div className="flex gap-2">
            {TABS.map((label) => (
              <button
                key={label}
                type="button"
                disabled
                className="rounded-[18px] bg-surface-alt text-muted text-sm font-medium px-4 py-2 cursor-not-allowed"
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled
            className="rounded-[18px] bg-surface-alt text-muted text-sm font-medium px-4 py-2 cursor-not-allowed"
          >
            새 스마트오더 업로드 (.xlsx)
            <span className="ml-2 rounded-full bg-black/5 text-muted text-xs px-2 py-0.5">준비 중</span>
          </button>
        </div>

        <p className="text-sm text-secondary text-center py-6">아직 업로드한 주문서가 없습니다. 기능이 열리면 엑셀 파일 하나로 첫 대량 주문을 시작할 수 있습니다.</p>
      </section>

      <PrepNotice feature="스마트오더 (Excel 대량 주문)" />
    </div>
  );
}
