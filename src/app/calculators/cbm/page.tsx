"use client";

import { useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import { calcCbm } from "@/lib/calculators";

export default function CbmCalculatorPage() {
  const [width, setWidth] = useState("");
  const [depth, setDepth] = useState("");
  const [height, setHeight] = useState("");
  const [quantity, setQuantity] = useState("1");

  const w = parseFloat(width);
  const d = parseFloat(depth);
  const h = parseFloat(height);
  const q = parseInt(quantity, 10);
  const valid = w > 0 && d > 0 && h > 0 && q > 0;
  const cbm = valid ? calcCbm(w, d, h, q) : null;

  const inputClass =
    "w-full rounded-[12px] border border-black/10 bg-bg px-4 py-3 text-sm text-body outline-none focus:border-accent";

  return (
    <main className="bg-bg text-body">
      <SiteHeader />

      <section className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-sm text-secondary">
          <Link href="/calculators" className="hover:text-heading">계산기</Link> / CBM 계산기
        </p>
        <h1 className="mt-2 text-3xl md:text-4xl font-semibold text-heading">CBM 계산기</h1>
        <p className="mt-3 text-secondary">
          박스 한 개의 치수(cm)와 박스 수를 입력하면 화물 전체 부피(CBM)를 계산합니다.
          해운 견적과 컨테이너 적재 계획의 기준이 되는 값입니다.
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
              <span className="font-semibold text-heading">박스 수</span>
              <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="1" className={`mt-1 ${inputClass}`} />
            </label>
          </div>

          <div className="mt-6 rounded-[12px] bg-bg border border-black/5 p-6 text-center">
            {cbm === null ? (
              <p className="text-sm text-muted">치수와 박스 수를 입력하면 결과가 표시됩니다.</p>
            ) : (
              <>
                <p className="text-sm text-secondary">전체 부피</p>
                <p className="mt-1 text-3xl font-semibold text-heading">
                  {cbm.toFixed(4)} <span className="text-lg text-secondary">CBM</span>
                </p>
                <p className="mt-2 text-xs text-muted">
                  참고: 20ft 컨테이너에는 일반적으로 약 28CBM을 적재합니다.
                </p>
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-xs text-muted">
          계산식: 가로 × 세로 × 높이(cm) × 박스 수 ÷ 1,000,000. 참고용 안내이며 최종 금액이 아닙니다.
        </p>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/calculators/volume-weight" className="font-semibold text-accent">다음 단계: 부피중량 계산기 →</Link>
          <Link href="/calculators" className="text-secondary hover:text-heading">계산기 목록으로</Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
