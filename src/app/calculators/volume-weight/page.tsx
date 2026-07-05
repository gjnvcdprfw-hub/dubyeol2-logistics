"use client";

import { useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import { calcVolumetricKg } from "@/lib/calculators";
import { RATES } from "@/lib/rates";

const DIVISOR = RATES.volumeDivisor.toLocaleString("ko-KR");

export default function VolumeWeightCalculatorPage() {
  const [width, setWidth] = useState("");
  const [depth, setDepth] = useState("");
  const [height, setHeight] = useState("");
  const [actualKg, setActualKg] = useState("");

  const w = parseFloat(width);
  const d = parseFloat(depth);
  const h = parseFloat(height);
  const a = parseFloat(actualKg);
  const valid = w > 0 && d > 0 && h > 0 && a > 0;
  const volumetricKg = valid ? calcVolumetricKg(w, d, h) : null;
  const volumetricWins = volumetricKg !== null && volumetricKg > a;

  const inputClass =
    "w-full rounded-[12px] border border-black/10 bg-bg px-4 py-3 text-sm text-body outline-none focus:border-accent";

  return (
    <main className="bg-bg text-body">
      <SiteHeader />

      <section className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-sm text-secondary">
          <Link href="/calculators" className="hover:text-heading">계산기</Link> / 부피중량 계산기
        </p>
        <h1 className="mt-2 text-3xl md:text-4xl font-semibold text-heading">부피중량 계산기</h1>
        <p className="mt-3 text-secondary">
          국제운임은 실중량과 부피중량(가로×세로×높이 cm ÷ {DIVISOR}) 중 큰 값인 <b>청구중량</b>으로 계산됩니다.
          치수와 실중량을 입력해 어느 쪽이 적용되는지 확인하세요.
        </p>

        <div className="mt-8 rounded-[16px] bg-surface border border-black/5 p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <label className="text-sm">
              <span className="font-semibold text-heading">가로 (cm)</span>
              <input type="number" min="0" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="60" className={`mt-1 ${inputClass}`} />
            </label>
            <label className="text-sm">
              <span className="font-semibold text-heading">세로 (cm)</span>
              <input type="number" min="0" value={depth} onChange={(e) => setDepth(e.target.value)} placeholder="40" className={`mt-1 ${inputClass}`} />
            </label>
            <label className="text-sm">
              <span className="font-semibold text-heading">높이 (cm)</span>
              <input type="number" min="0" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="50" className={`mt-1 ${inputClass}`} />
            </label>
            <label className="text-sm">
              <span className="font-semibold text-heading">실중량 (kg)</span>
              <input type="number" min="0" value={actualKg} onChange={(e) => setActualKg(e.target.value)} placeholder="15" className={`mt-1 ${inputClass}`} />
            </label>
          </div>

          <div className="mt-6">
            {volumetricKg === null ? (
              <div className="rounded-[12px] bg-bg border border-black/5 p-6 text-center">
                <p className="text-sm text-muted">치수와 실중량을 입력하면 결과가 표시됩니다.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className={`rounded-[12px] border p-6 text-center ${volumetricWins ? "border-accent bg-accent/5" : "border-black/5 bg-bg"}`}>
                  <p className="text-sm text-secondary">부피중량</p>
                  <p className="mt-1 text-2xl font-semibold text-heading">{volumetricKg.toFixed(2)} kg</p>
                  {volumetricWins && <p className="mt-2 text-xs font-semibold text-accent">청구중량으로 적용</p>}
                </div>
                <div className={`rounded-[12px] border p-6 text-center ${!volumetricWins ? "border-accent bg-accent/5" : "border-black/5 bg-bg"}`}>
                  <p className="text-sm text-secondary">실중량</p>
                  <p className="mt-1 text-2xl font-semibold text-heading">{a.toFixed(2)} kg</p>
                  {!volumetricWins && <p className="mt-2 text-xs font-semibold text-accent">청구중량으로 적용</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-xs text-muted">
          계산식: 부피중량(kg) = 가로 × 세로 × 높이(cm) ÷ {DIVISOR}. 참고용 안내이며 최종 금액이 아닙니다.
        </p>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/calculators/shipping-cost" className="font-semibold text-accent">다음 단계: 배송비 계산기 →</Link>
          <Link href="/calculators" className="text-secondary hover:text-heading">계산기 목록으로</Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
