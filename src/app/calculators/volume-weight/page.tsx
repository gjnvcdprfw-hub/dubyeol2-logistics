"use client";

import { useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import { calcVolumetricKg } from "@/lib/calculators";
import { RATES } from "@/lib/rates";

const DIVISOR = RATES.volumeDivisor.toLocaleString("ko-KR");

// 계산 원리 안내 — 수치는 RATES 파생
const PRINCIPLES = [
  {
    title: "부피중량이 왜 필요한가요?",
    body: "항공기·선박의 적재 공간은 무게보다 부피로 먼저 차기 때문에, 국제운임은 무게와 부피를 함께 봅니다. 가볍지만 자리를 많이 차지하는 화물에 실중량만 적용하면 운송 원가가 맞지 않아, 부피를 무게로 환산한 부피중량 개념을 사용합니다.",
  },
  {
    title: "산출 공식",
    body: `부피중량(kg) = 가로 × 세로 × 높이(cm) ÷ ${DIVISOR}. 국제 특송에서 널리 쓰이는 환산 계수이며, 요금 안내와 견적서도 같은 계수를 사용합니다.`,
  },
  {
    title: "청구중량 결정 규칙",
    body: "실중량과 부피중량 중 큰 값이 청구중량입니다. 청구중량이 정해지면 해운은 kg 단위, 항공은 100g 단위로 올림해 운임이 계산됩니다.",
  },
];

// 사용 예시 — 부피중량은 calcVolumetricKg로 계산 (숫자 하드코딩 금지)
function buildExamples() {
  const ex1 = calcVolumetricKg(60, 40, 50);
  const ex2 = calcVolumetricKg(80, 60, 60);
  const ex3 = calcVolumetricKg(30, 20, 15);
  return [
    {
      title: "예시 1 — 의류 박스 60×40×50cm, 실중량 15kg",
      body: `부피중량은 ${ex1.toLocaleString("ko-KR")}kg로 실중량 15kg보다 큽니다. 청구중량은 부피중량 ${ex1.toLocaleString("ko-KR")}kg가 되어, 저울 무게보다 운임이 높게 나옵니다.`,
    },
    {
      title: "예시 2 — 쿠션·인형류 80×60×60cm, 실중량 8kg",
      body: `부피중량이 ${ex2.toLocaleString("ko-KR")}kg까지 커지는 대표적인 부피 화물입니다. 실중량 8kg의 몇 배로 청구되므로, 압축 포장이나 묶음 포장으로 부피를 줄이면 운임을 크게 아낄 수 있습니다.`,
    },
    {
      title: "예시 3 — 소형 전자기기 30×20×15cm, 실중량 3kg",
      body: `부피중량은 ${ex3.toLocaleString("ko-KR")}kg에 불과해 실중량 3kg이 청구중량이 됩니다. 작고 밀도 높은 화물은 실중량 기준이라 예상 운임 계산이 단순합니다.`,
    },
  ];
}

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

        {/* 계산 원리 */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-heading">계산 원리</h2>
          <div className="mt-5 space-y-4">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="rounded-[16px] bg-surface border border-black/5 p-6">
                <p className="font-semibold text-heading">{p.title}</p>
                <p className="mt-2 text-sm text-secondary">{p.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 사용 예시 */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-heading">사용 예시</h2>
          <p className="mt-2 text-sm text-secondary">
            같은 무게라도 부피에 따라 청구중량이 달라지는 대표 사례 세 가지입니다.
          </p>
          <div className="mt-5 space-y-4">
            {buildExamples().map((ex) => (
              <div key={ex.title} className="rounded-[16px] bg-surface border border-black/5 p-6">
                <p className="font-semibold text-heading">{ex.title}</p>
                <p className="mt-2 text-sm text-secondary">{ex.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/calculators/shipping-cost" className="font-semibold text-accent">다음 단계: 배송비 계산기 →</Link>
          <Link href="/calculators" className="text-secondary hover:text-heading">계산기 목록으로</Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
