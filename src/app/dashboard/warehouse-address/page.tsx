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
      <p className="text-sm text-secondary">1688/타오바오에서 주문할 때 이 주소를 배송지로 입력하면 상품이 우리 창고로 모입니다. 주소 끝에 붙는 입고ID가 회원님 상품을 구분하는 열쇠입니다.</p>
      <section className="bg-surface rounded-[27px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-6 space-y-3 text-sm">
        <p className="text-muted">나의 입고ID: <span className="font-semibold text-brand">{code}</span></p>
        <p className="text-body">수령인: {WAREHOUSE.receiver}</p>
        <p className="text-body">연락처: {WAREHOUSE.phone}</p>
        <p className="text-body">주소: {full}</p>
        <CopyButton text={`${WAREHOUSE.receiver}\n${WAREHOUSE.phone}\n${full}`} />
        <p className="text-xs text-muted">⚠️ 창고 실주소는 오픈 전 확정됩니다 (현재 표시값은 자리표시)</p>
      </section>
      <section className="bg-surface rounded-[27px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-6 space-y-3 text-sm">
        <p className="font-semibold text-heading">사용 방법</p>
        <ol className="space-y-2 text-secondary list-decimal list-inside">
          <li>위 수령인·연락처·주소를 복사해 1688/타오바오 주문의 배송지로 등록합니다.</li>
          <li>주소 끝의 입고ID까지 한 글자도 빠뜨리지 말고 그대로 입력합니다.</li>
          <li>상품이 창고에 도착하면 입고ID로 자동 확인되어 입고 관리 화면에 표시됩니다.</li>
        </ol>
        <div className="rounded-[12px] bg-warning-tint p-4 text-xs text-secondary space-y-1">
          <p className="font-medium text-heading">주의해 주세요</p>
          <p>· 입고ID가 빠진 채 도착한 상품은 누구 것인지 확인이 어려워 입고 처리가 늦어질 수 있습니다.</p>
          <p>· 입고ID는 회원님 전용입니다. 다른 사람과 공유하면 상품이 뒤섞일 수 있습니다.</p>
          <p>· 주문 전 창고 주소가 최신인지 이 화면에서 다시 확인해 주세요.</p>
        </div>
      </section>
    </div>
  );
}
