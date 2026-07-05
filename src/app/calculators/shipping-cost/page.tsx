"use client";

import { useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import { calcShipping } from "@/lib/calculators";
import { RATES } from "@/lib/rates";

const DEFAULT_RATE = "190";

export default function ShippingCostCalculatorPage() {
  const [weightKg, setWeightKg] = useState("");
  const [width, setWidth] = useState("");
  const [depth, setDepth] = useState("");
  const [height, setHeight] = useState("");
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_RATE);

  const weight = parseFloat(weightKg);
  const w = parseFloat(width);
  const d = parseFloat(depth);
  const h = parseFloat(height);
  const rate = parseFloat(exchangeRate);

  const hasDims = w > 0 && d > 0 && h > 0;
  const valid = weight > 0 && rate > 0;

  let result: {
    volumetricKg: number | null;
    sea: { fen: number; chargeableWeightKg: number };
    air: { fen: number; chargeableWeightKg: number };
  } | null = null;

  if (valid) {
    // quote.ts와 동일한 규칙: 청구중량(g) = max(실중량g, 부피중량g), 부피중량g = ceil(cm³×1000÷계수)
    const weightGrams = Math.ceil(weight * 1000);
    const volumetricGrams = hasDims ? Math.ceil((w * d * h * 1000) / RATES.volumeDivisor) : 0;
    const chargeableGrams = Math.max(weightGrams, volumetricGrams);
    result = {
      volumetricKg: hasDims ? volumetricGrams / 1000 : null,
      sea: calcShipping("SEA", chargeableGrams),
      air: calcShipping("AIR", chargeableGrams),
    };
  }

  const yuan = (fen: number) => (fen / 100).toLocaleString("ko-KR", { maximumFractionDigits: 2 });
  const won = (fen: number) => Math.round((fen / 100) * rate).toLocaleString("ko-KR");

  const inputClass =
    "w-full rounded-[12px] border border-black/10 bg-bg px-4 py-3 text-sm text-body outline-none focus:border-accent";

  return (
    <main className="bg-bg text-body">
      <SiteHeader />

      <section className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-sm text-secondary">
          <Link href="/calculators" className="hover:text-heading">계산기</Link> / 배송비 계산기
        </p>
        <h1 className="mt-2 text-3xl md:text-4xl font-semibold text-heading">배송비 계산기</h1>
        <p className="mt-3 text-secondary">
          무게와 치수를 입력하면 공개 요율 기준으로 해운·항공 예상 운임을 비교합니다.
          청구중량은 실중량과 부피중량 중 큰 값입니다.
        </p>

        <div className="mt-8 rounded-[16px] bg-surface border border-black/5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm">
              <span className="font-semibold text-heading">실중량 (kg)</span>
              <input type="number" min="0" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="13.5" className={`mt-1 ${inputClass}`} />
            </label>
            <label className="text-sm">
              <span className="font-semibold text-heading">환율 (₩/¥)</span>
              <input type="number" min="0" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)} className={`mt-1 ${inputClass}`} />
              <span className="mt-1 block text-xs text-muted">기본값 {DEFAULT_RATE} — 참고용이며 실제 정산은 결제일 환율 기준입니다.</span>
            </label>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="text-sm">
              <span className="font-semibold text-heading">가로 (cm) <span className="font-normal text-muted">선택</span></span>
              <input type="number" min="0" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="60" className={`mt-1 ${inputClass}`} />
            </label>
            <label className="text-sm">
              <span className="font-semibold text-heading">세로 (cm) <span className="font-normal text-muted">선택</span></span>
              <input type="number" min="0" value={depth} onChange={(e) => setDepth(e.target.value)} placeholder="40" className={`mt-1 ${inputClass}`} />
            </label>
            <label className="text-sm">
              <span className="font-semibold text-heading">높이 (cm) <span className="font-normal text-muted">선택</span></span>
              <input type="number" min="0" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="50" className={`mt-1 ${inputClass}`} />
            </label>
          </div>
          <p className="mt-2 text-xs text-muted">치수를 입력하면 부피중량을 반영해 청구중량을 계산합니다.</p>

          <div className="mt-6">
            {result === null ? (
              <div className="rounded-[12px] bg-bg border border-black/5 p-6 text-center">
                <p className="text-sm text-muted">실중량과 환율을 입력하면 해운·항공 예상 운임이 비교됩니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-[12px] border border-black/5 bg-bg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/5 text-left text-secondary">
                      <th className="px-4 py-3 font-semibold">배송 방식</th>
                      <th className="px-4 py-3 font-semibold">청구중량</th>
                      <th className="px-4 py-3 font-semibold">예상 운임 (¥)</th>
                      <th className="px-4 py-3 font-semibold">예상 운임 (₩)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-black/5">
                      <td className="px-4 py-3 font-semibold text-heading">해운</td>
                      <td className="px-4 py-3">{result.sea.chargeableWeightKg.toLocaleString("ko-KR")} kg</td>
                      <td className="px-4 py-3">¥{yuan(result.sea.fen)}</td>
                      <td className="px-4 py-3 font-semibold text-heading">약 ₩{won(result.sea.fen)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-heading">항공</td>
                      <td className="px-4 py-3">{result.air.chargeableWeightKg.toLocaleString("ko-KR")} kg</td>
                      <td className="px-4 py-3">¥{yuan(result.air.fen)}</td>
                      <td className="px-4 py-3 font-semibold text-heading">약 ₩{won(result.air.fen)}</td>
                    </tr>
                  </tbody>
                </table>
                {result.volumetricKg !== null && (
                  <p className="px-4 pb-4 text-xs text-muted">
                    부피중량 {result.volumetricKg.toFixed(2)}kg과 실중량 {weight.toFixed(2)}kg 중 큰 값을 청구중량으로 사용했습니다.
                    (해운은 kg 단위, 항공은 100g 단위 올림)
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-xs text-muted">
          요율 출처: <Link href="/guide/pricing" className="text-accent font-semibold">요금 안내</Link>에 공개된 해운·항공 요율 기준.
          참고용 안내이며 최종 금액이 아닙니다. 확정 금액은 접수 후 항목별 견적으로 안내드립니다.
        </p>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/guide/pricing" className="font-semibold text-accent">전체 요율표 보기 →</Link>
          <Link href="/calculators" className="text-secondary hover:text-heading">계산기 목록으로</Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
