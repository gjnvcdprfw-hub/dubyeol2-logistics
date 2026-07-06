"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RATES } from "@/lib/rates";

type OrderSkuForm = {
  optionText: string;
  quantity: number;
};

type OrderItemForm = {
  productUrl: string;
  productName: string;
  skus: OrderSkuForm[];
};

type OrderForm = {
  serviceType: "PURCHASE" | "SHIPPING";
  inspectionRequested: boolean;
  memo: string;
  items: OrderItemForm[];
};

function createSku(): OrderSkuForm {
  return { optionText: "", quantity: 1 };
}

function createItem(): OrderItemForm {
  return { productUrl: "", productName: "", skus: [createSku()] };
}

export default function NewOrderPage() {
  const [form, setForm] = useState<OrderForm>({
    serviceType: "PURCHASE",
    inspectionRequested: false,
    memo: "",
    items: [createItem()],
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function updateItem(itemIndex: number, patch: Partial<OrderItemForm>) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, index) => (index === itemIndex ? { ...item, ...patch } : item)),
    }));
  }

  function updateSku(itemIndex: number, skuIndex: number, patch: Partial<OrderSkuForm>) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              skus: item.skus.map((sku, innerIndex) => (innerIndex === skuIndex ? { ...sku, ...patch } : sku)),
            }
          : item,
      ),
    }));
  }

  function addProduct() {
    setForm((current) => ({ ...current, items: [...current.items, createItem()] }));
  }

  function removeProduct(itemIndex: number) {
    setForm((current) => ({
      ...current,
      items: current.items.filter((_, index) => index !== itemIndex),
    }));
  }

  function addSku(itemIndex: number) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, index) =>
        index === itemIndex ? { ...item, skus: [...item.skus, createSku()] } : item,
      ),
    }));
  }

  function removeSku(itemIndex: number, skuIndex: number) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, index) =>
        index === itemIndex
          ? { ...item, skus: item.skus.filter((_, innerIndex) => innerIndex !== skuIndex) }
          : item,
      ),
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        items: form.items.map((item) => ({
          ...item,
          skus: item.skus.map((sku) => ({ ...sku, quantity: Number(sku.quantity) })),
        })),
      }),
    });
    const data = await res.json();
    if (data.ok) router.push("/dashboard/orders");
    else setError(data.error);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-heading">주문 접수</h1>
      <form onSubmit={submit} className="bg-surface rounded-[27px] shadow-[0_7px_30px_rgba(90,114,123,0.11)] p-6 space-y-4">
        <div className="space-y-4">
          {form.items.map((item, itemIndex) => (
            <section key={`item-${itemIndex}`} className="rounded-[16px] border border-black/5 bg-surface-alt p-4 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-heading">상품 {itemIndex + 1}</p>
                  <p className="text-xs text-muted">주문 묶음 안에서 상품별 SKU를 나눠 적습니다.</p>
                </div>
                {form.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProduct(itemIndex)}
                    className="shrink-0 rounded-[12px] border border-black/10 px-3 py-2 text-xs font-medium text-secondary"
                  >
                    상품 삭제
                  </button>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm text-secondary">상품 링크
                  <input
                    required
                    value={item.productUrl}
                    onChange={(e) => updateItem(itemIndex, { productUrl: e.target.value })}
                    placeholder="https://detail.1688.com/offer/..."
                    className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2"
                  />
                </label>
                <label className="block text-sm text-secondary">상품명
                  <input
                    required
                    value={item.productName}
                    onChange={(e) => updateItem(itemIndex, { productName: e.target.value })}
                    className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2"
                  />
                </label>
              </div>
              <div className="space-y-3">
                {item.skus.map((sku, skuIndex) => (
                  <div key={`sku-${itemIndex}-${skuIndex}`} className="rounded-[12px] bg-white p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-body">SKU {skuIndex + 1}</p>
                        <p className="text-xs text-muted">옵션별 수량과 이후 입고·검수 근거가 이 줄에 연결됩니다.</p>
                      </div>
                      {item.skus.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSku(itemIndex, skuIndex)}
                          className="shrink-0 rounded-[12px] border border-black/10 px-3 py-2 text-xs font-medium text-secondary"
                        >
                          SKU 삭제
                        </button>
                      )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block text-sm text-secondary">옵션
                        <input
                          value={sku.optionText}
                          onChange={(e) => updateSku(itemIndex, skuIndex, { optionText: e.target.value })}
                          className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2"
                        />
                      </label>
                      <label className="block text-sm text-secondary">수량
                        <input
                          type="number"
                          min={1}
                          required
                          value={sku.quantity}
                          onChange={(e) => updateSku(itemIndex, skuIndex, { quantity: Number(e.target.value) })}
                          className="mt-1 w-full border border-black/10 rounded-lg px-3 py-2"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addSku(itemIndex)}
                className="rounded-[12px] border border-black/10 bg-white px-4 py-2 text-sm font-medium text-secondary"
              >
                SKU 추가
              </button>
            </section>
          ))}
        </div>
        <button
          type="button"
          onClick={addProduct}
          className="rounded-[12px] border border-black/10 bg-surface-alt px-4 py-2 text-sm font-medium text-secondary"
        >
          상품 추가
        </button>
        <fieldset className="text-sm text-secondary space-x-4">
          <label><input type="radio" checked={form.serviceType === "PURCHASE"} onChange={() => setForm({ ...form, serviceType: "PURCHASE" })} /> 구매대행 (수수료 {RATES.commissionRate * 100}% + VAT)</label>
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
