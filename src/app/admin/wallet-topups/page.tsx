import { listAdminWalletTopUps } from "@/lib/wallet-topups";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "승인 대기",
  APPROVED: "승인 완료",
  REJECTED: "거절 완료",
};

function krw(value: number) {
  return `₩${value.toLocaleString("ko-KR")}`;
}

function formatDate(value: Date) {
  return value.toLocaleString("ko-KR");
}

export default async function AdminWalletTopUpsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const requests = await listAdminWalletTopUps();
  const query = searchParams ? await searchParams : {};
  const done = query.done === "1";
  const error = typeof query.error === "string" ? query.error : "";

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-heading">예치금 충전 확인</h1>
        <p className="text-sm text-secondary">
          실제 결제가 아니라 셀러가 남긴 충전 요청을 운영자가 수동으로 승인하거나 거절하는 화면입니다.
        </p>
      </div>

      {done && (
        <section className="rounded-[20px] border border-success/20 bg-success-tint px-5 py-4 text-sm text-success">
          충전 요청 처리가 반영되었습니다.
        </section>
      )}

      {error && (
        <section className="rounded-[20px] border border-danger/20 bg-danger/5 px-5 py-4 text-sm text-danger">
          {error}
        </section>
      )}

      <section className="rounded-[16px] bg-surface shadow-[0_7px_30px_rgba(90,114,123,0.11)]">
        <div className="border-b border-black/5 px-6 py-4">
          <p className="text-sm font-semibold text-heading">충전 요청 {requests.length}건</p>
          <p className="mt-1 text-xs text-muted">승인 시 예치금 원장에 반영되고, 거절 시 잔액은 바뀌지 않습니다.</p>
        </div>

        {requests.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-secondary">대기 중인 충전 요청이 없습니다.</div>
        ) : (
          <div className="divide-y divide-black/5">
            {requests.map((request) => {
              const sellerName = request.seller.companyName || request.seller.contactName || request.seller.email;

              return (
                <article key={request.id} className="px-6 py-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-heading">{krw(request.amountKrw)}</p>
                        <span className="rounded-full bg-surface-alt px-2.5 py-1 text-xs font-medium text-muted">
                          {STATUS_LABEL[request.status] ?? request.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-secondary">
                        <p>셀러: {sellerName}</p>
                        <p>이메일: {request.seller.email}</p>
                        <p>입금자명: {request.depositorName}</p>
                        <p>요청 시각: {formatDate(request.createdAt)}</p>
                        <p>셀러 메모: {request.memo || "메모 없음"}</p>
                      </div>
                    </div>

                    {request.status === "PENDING" ? (
                      <div className="grid gap-3 lg:min-w-[360px] lg:grid-cols-2">
                        <form
                          action={`/api/admin/wallet-topups/${request.id}/approve`}
                          method="post"
                          className="rounded-[14px] border border-success/20 bg-success-tint/60 p-4"
                        >
                          <p className="text-sm font-semibold text-heading">승인</p>
                          <p className="mt-1 text-xs text-secondary">실입금 확인이 끝난 뒤에만 승인합니다.</p>
                          <input
                            type="text"
                            name="memo"
                            placeholder="예: 입금 확인"
                            className="mt-3 w-full rounded-[12px] border border-black/10 bg-white px-3 py-2 text-sm text-heading placeholder:text-muted"
                          />
                          <button
                            type="submit"
                            className="mt-3 w-full rounded-[12px] bg-brand px-3 py-2 text-sm font-semibold text-white"
                          >
                            승인
                          </button>
                        </form>

                        <form
                          action={`/api/admin/wallet-topups/${request.id}/reject`}
                          method="post"
                          className="rounded-[14px] border border-danger/20 bg-danger/5 p-4"
                        >
                          <p className="text-sm font-semibold text-heading">거절</p>
                          <p className="mt-1 text-xs text-secondary">거절 사유는 셀러 문의 대응 기준으로 남깁니다.</p>
                          <input
                            type="text"
                            name="reason"
                            required
                            placeholder="예: 입금자명 불일치"
                            className="mt-3 w-full rounded-[12px] border border-black/10 bg-white px-3 py-2 text-sm text-heading placeholder:text-muted"
                          />
                          <button
                            type="submit"
                            className="mt-3 w-full rounded-[12px] bg-danger px-3 py-2 text-sm font-semibold text-white"
                          >
                            거절
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="rounded-[14px] bg-surface-alt px-4 py-3 text-sm text-secondary lg:min-w-[280px]">
                        <p className="font-semibold text-heading">{STATUS_LABEL[request.status] ?? request.status}</p>
                        <p className="mt-1">처리 시각: {request.processedAt ? formatDate(request.processedAt) : "-"}</p>
                        <p className="mt-1">처리 메모: {request.adminMemo || "메모 없음"}</p>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
