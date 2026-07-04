import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ensureInboundCode } from "@/lib/inbound";
import CopyButton from "./copy-button";

// 창고 실주소는 오픈 전 확정 (대표님 결정 2026-07-04). 실제 창고 계약 후 값만 교체.
// 화면 구조·복사 UX는 두리무역 벤치(benchmark-duly.md §2.8) 그대로.
const WAREHOUSE = {
  receiver: "물류창고 (오픈 전 확정)",
  phone: "000-0000-0000",
  address: "山东省威海市 ○○物流园 (창고 주소 오픈 전 확정)",
};

export default async function WarehouseAddressPage() {
  const session = await getSession();
  if (!session.userId) redirect("/auth/login");
  const code = await ensureInboundCode(session.userId);
  const full = `${WAREHOUSE.address} 入库ID:${code}`;
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-heading">중국 창고 주소</h1>
      <p className="text-sm text-secondary">1688/타오바오 주문 시 배송지로 사용하세요. 주소 끝의 입고ID로 상품을 구분합니다.</p>
      <section className="bg-surface rounded-[27px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-6 space-y-3 text-sm">
        <p className="text-muted">나의 입고ID: <span className="font-semibold text-brand">{code}</span></p>
        <p className="text-body">수령인: {WAREHOUSE.receiver}</p>
        <p className="text-body">연락처: {WAREHOUSE.phone}</p>
        <p className="text-body">주소: {full}</p>
        <CopyButton text={`${WAREHOUSE.receiver}\n${WAREHOUSE.phone}\n${full}`} />
        <p className="text-xs text-muted">⚠️ 창고 실주소는 오픈 전 확정됩니다 (현재 표시값은 자리표시)</p>
      </section>
    </div>
  );
}
