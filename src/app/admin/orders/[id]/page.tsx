import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export default async function AdminInboundPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { seller: { select: { email: true } } } });
  if (!order || order.status !== "REQUESTED") notFound();
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-heading">입고 기록 — {order.productName} × {order.quantity}</h1>
      <p className="text-sm text-secondary">셀러: {order.seller.email} · {order.inspectionRequested ? "유료 검수 신청 건" : "검수 미신청 건 (검수 결과 기록 불가)"}</p>
      <form action="/api/admin/inbound" method="post" encType="multipart/form-data"
        className="bg-surface rounded-[16px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-6 space-y-4">
        <input type="hidden" name="orderId" value={order.id} />
        <label className="block text-sm text-secondary">입고 사진 (1~2장, JPG/PNG/WebP)
          <input type="file" name="photos" accept="image/jpeg,image/png,image/webp" multiple required className="mt-1 block" />
        </label>
        <label className="block text-sm text-body">
          <input type="checkbox" name="outerIssue" /> 외포장 이상 있음
        </label>
        <label className="block text-sm text-secondary">외포장 메모
          <input name="outerNote" className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
        </label>
        {order.inspectionRequested && (
          <fieldset className="rounded-lg bg-surface-alt p-4 space-y-3 text-sm">
            <p className="font-medium text-body">검수 결과 기록 (유료 검수 신청 건 — 필수)</p>
            <label className="block text-secondary">실입고 수량
              <input type="number" name="countActual" min={0} required className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
            </label>
            <label className="block text-body"><input type="checkbox" name="appearanceOk" defaultChecked /> 외관 정상</label>
            <label className="block text-secondary">하자 수량
              <input type="number" name="defectCount" min={0} defaultValue={0} className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
            </label>
            <label className="block text-secondary">검수 메모
              <input name="inspNote" className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
            </label>
          </fieldset>
        )}
        <button type="submit" className="bg-brand text-white font-semibold rounded-[12px] px-6 py-3">입고 완료 처리</button>
      </form>
    </div>
  );
}
