"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewOrderPage() {
  const [form, setForm] = useState({ productUrl: "", productName: "", optionText: "", quantity: 1, serviceType: "PURCHASE", inspectionRequested: false, memo: "" });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, quantity: Number(form.quantity) }) });
    const data = await res.json();
    if (data.ok) router.push("/dashboard/orders");
    else setError(data.error);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-heading">주문 접수</h1>
      <form onSubmit={submit} className="bg-surface rounded-[27px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-6 space-y-4">
        <label className="block text-sm text-secondary">상품 링크
          <input required value={form.productUrl} onChange={(e) => setForm({ ...form, productUrl: e.target.value })} placeholder="https://detail.1688.com/offer/..." className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
        </label>
        <label className="block text-sm text-secondary">상품명
          <input required value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm text-secondary">옵션
            <input value={form.optionText} onChange={(e) => setForm({ ...form, optionText: e.target.value })} className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
          </label>
          <label className="block text-sm text-secondary">수량
            <input type="number" min={1} required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
          </label>
        </div>
        <fieldset className="text-sm text-secondary space-x-4">
          <label><input type="radio" checked={form.serviceType === "PURCHASE"} onChange={() => setForm({ ...form, serviceType: "PURCHASE" })} /> 구매대행 (수수료 5% + VAT)</label>
          <label><input type="radio" checked={form.serviceType === "SHIPPING"} onChange={() => setForm({ ...form, serviceType: "SHIPPING" })} /> 배송대행 (수수료 0%)</label>
        </fieldset>
        <div className="rounded-lg bg-surface-alt p-4 text-sm">
          <label className="font-medium text-body"><input type="checkbox" checked={form.inspectionRequested} onChange={(e) => setForm({ ...form, inspectionRequested: e.target.checked })} /> 유료 검수 신청 (수량·외관·하자 확인)</label>
          <p className="mt-1 text-muted">기본 제공(무료): 입고 사진 1~2장 + 외포장 이상 안내. 수량·외관·하자 확인은 유료 검수를 신청한 건에만 제공됩니다.</p>
        </div>
        <label className="block text-sm text-secondary">요청 메모 (선택)
          <textarea value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2" />
        </label>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button type="submit" className="bg-accent text-white font-semibold rounded-[12px] px-6 py-3">접수하기</button>
      </form>
    </div>
  );
}
