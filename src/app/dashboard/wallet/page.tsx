import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import PrepNotice from "@/components/dashboard/prep-notice";

// 예치금 관리 — 벤치마크 §2.11 구조. 충전·결제 기능은 준비 중.

const STATS = [
  { label: "총 충전", value: "₩0" },
  { label: "총 사용", value: "₩0" },
  { label: "거래", value: "0건" },
];

export default async function WalletPage() {
  const session = await getSession();
  if (!session.userId) redirect("/auth/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-heading">예치금 관리</h1>
        <p className="mt-1 text-sm text-secondary">미리 충전해 두면 견적 확정 즉시 결제까지 끝나는 예치금 결제 방식입니다.</p>
      </div>

      <section className="rounded-[27px] bg-gradient-to-br from-brand to-[#8b0000] text-white p-6 shadow-card">
        <p className="text-sm text-white/80">
          사용 가능 잔액
          <span className="ml-2 rounded-full bg-white/20 text-white text-xs px-2 py-0.5">결제에 바로 쓰이는 금액</span>
        </p>
        <p className="mt-1 text-2xl font-bold">₩0</p>
        <p className="mt-1 text-xs text-white/70">정식 오픈 후 충전한 금액이 이 잔액으로 표시됩니다.</p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            disabled
            className="rounded-[18px] bg-white/70 text-brand text-sm font-semibold px-4 py-2 cursor-not-allowed"
          >
            충전하기 (준비 중)
          </button>
          <button
            type="button"
            disabled
            className="rounded-[18px] bg-white/70 text-brand text-sm font-semibold px-4 py-2 cursor-not-allowed"
          >
            환불 신청 (준비 중)
          </button>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-surface rounded-[27px] shadow-card p-5 text-center">
            <p className="text-xs text-muted">{stat.label}</p>
            <p className="mt-1 text-lg font-bold text-heading">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="bg-surface rounded-[27px] shadow-card p-6">
        <div className="flex gap-2 mb-5">
          <span className="rounded-[18px] bg-surface-alt text-muted text-sm px-4 py-2">거래 내역</span>
          <span className="rounded-[18px] bg-surface-alt text-muted text-sm px-4 py-2">충전 대기</span>
        </div>
        <div className="py-8 text-center">
          <p className="text-3xl">💳</p>
          <p className="mt-4 font-semibold text-heading">아직 거래 내역이 없습니다</p>
          <p className="mt-2 text-sm text-secondary">예치금 서비스가 열리면 첫 충전과 함께 거래가 시작되고, 충전·사용 내역이 모두 여기에 남습니다.</p>
        </div>
      </section>

      <PrepNotice feature="예치금 충전·결제" />
    </div>
  );
}
