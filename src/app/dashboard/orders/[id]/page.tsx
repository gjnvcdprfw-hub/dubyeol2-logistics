import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

const STATUS_LABEL: Record<string, string> = { REQUESTED: "접수됨", RECEIVED: "입고완료" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) redirect("/auth/login");
  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, sellerId: session.userId },  // 격리: sellerId 스코프 필수
    include: { photos: true },
  });
  if (!order) notFound();
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-heading">{order.productName} × {order.quantity}</h1>
      <p className="text-sm text-muted">{order.serviceType === "PURCHASE" ? "구매대행" : "배송대행"} · 상태: {STATUS_LABEL[order.status] ?? order.status}</p>
      {order.status === "RECEIVED" ? (
        <section className="bg-surface rounded-[27px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-6 space-y-4">
          <h2 className="text-[14px] font-semibold text-heading">입고 증거</h2>
          <div className="flex gap-3">
            {order.photos.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.id} src={p.path} alt="입고 사진" className="w-40 h-40 object-cover rounded-[12px] border border-black/5" />
            ))}
          </div>
          <p className="text-sm text-body">외포장: {order.outerIssue ? <span className="text-danger">이상 있음{order.outerNote ? ` — ${order.outerNote}` : ""}</span> : "정상"}</p>
          {order.inspectionRequested && order.inspCountActual !== null ? (
            <div className="rounded-lg bg-success-tint p-4 text-sm space-y-1">
              <p className="font-medium text-success">유료 검수 결과</p>
              <p className="text-body">실입고 수량: {order.inspCountActual}/{order.quantity}</p>
              <p className="text-body">외관: {order.inspAppearanceOk ? "정상" : "이상"} · 하자: {order.inspDefectCount ?? 0}건</p>
              {order.inspNote && <p className="text-secondary">{order.inspNote}</p>}
            </div>
          ) : (
            <div className="rounded-lg bg-surface-alt p-4 text-sm text-muted">
              수량 미확인 — 유료 검수를 신청하지 않은 건입니다. 기본 제공은 입고 사진과 외포장 이상 안내입니다.
            </div>
          )}
        </section>
      ) : (
        <div className="bg-surface rounded-[27px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-8 text-muted text-sm">
          아직 중국 창고에 입고되지 않았습니다. 입고되면 사진과 함께 표시됩니다.
        </div>
      )}
    </div>
  );
}
