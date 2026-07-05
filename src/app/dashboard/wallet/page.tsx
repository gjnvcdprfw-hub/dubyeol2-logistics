import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getWalletSummary } from "@/lib/wallet";
import PrepNotice from "@/components/dashboard/prep-notice";

// 예치금 관리 — 벤치마크 §2.11 구조. 충전·결제 기능은 준비 중.

function krw(value: number) {
  return `₩${value.toLocaleString("ko-KR")}`;
}

export default async function WalletPage() {
  const session = await getSession();
  if (!session.userId) redirect("/auth/login");
  const wallet = await getWalletSummary(session.userId);
  const STATS = [
    { label: "총 충전", value: krw(wallet.totalCreditKrw) },
    { label: "총 사용", value: krw(wallet.totalDebitKrw) },
    { label: "거래", value: `${wallet.transactions.length}건` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-heading">예치금 관리</h1>
        <p className="mt-1 text-sm text-secondary">현재는 로컬 QA 예치금 원장으로 출고 요청 차감을 확인합니다.</p>
      </div>

      <section className="rounded-[27px] bg-gradient-to-br from-brand to-[#8b0000] text-white p-6 shadow-card">
        <p className="text-sm text-white/80">
          사용 가능 잔액
          <span className="ml-2 rounded-full bg-white/20 text-white text-xs px-2 py-0.5">로컬 테스트 원장</span>
        </p>
        <p className="mt-1 text-2xl font-bold">{krw(wallet.balanceKrw)}</p>
        <p className="mt-1 text-xs text-white/70">실계좌·실입금·실결제 연동은 오픈 전 확정합니다.</p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            disabled
            className="rounded-[18px] bg-white/70 text-brand text-sm font-semibold px-4 py-2 cursor-not-allowed"
          >
            충전하기 (오픈 전 확정)
          </button>
          <button
            type="button"
            disabled
            className="rounded-[18px] bg-white/70 text-brand text-sm font-semibold px-4 py-2 cursor-not-allowed"
          >
            환불 신청 (오픈 전 확정)
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
        {wallet.transactions.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-3xl">💳</p>
            <p className="mt-4 font-semibold text-heading">아직 거래 내역이 없습니다</p>
            <p className="mt-2 text-sm text-secondary">로컬 QA 예치금을 준비하면 충전·사용 내역이 여기에 남습니다.</p>
          </div>
        ) : (
          <div className="divide-y divide-black/5">
            {wallet.transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-semibold text-heading">{tx.type === "SHIPMENT_DEBIT" ? "출고 요청 차감" : "로컬 QA 예치금"}</p>
                  <p className="mt-1 text-sm text-secondary">{tx.memo} · {tx.createdAt.toLocaleString("ko-KR")}</p>
                </div>
                <div className="text-right">
                  <p className={tx.amountKrw < 0 ? "font-semibold text-danger" : "font-semibold text-success"}>
                    {tx.amountKrw < 0 ? "-" : "+"}{krw(Math.abs(tx.amountKrw))}
                  </p>
                  <p className="mt-1 text-xs text-muted">잔액 {krw(tx.balanceAfterKrw)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <PrepNotice
        feature="실계좌·실입금·실결제"
        description="현재 화면은 로컬 테스트 원장만 보여줍니다."
      />
    </div>
  );
}
