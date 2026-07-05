"use client";

import { useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import { calcShipping, calcVolumetricKg } from "@/lib/calculators";
import { RATES } from "@/lib/rates";

const DEFAULT_RATE = "190";

const fmtYuan = (fen: number) => (fen / 100).toLocaleString("ko-KR", { maximumFractionDigits: 2 });

// 계산 원리 안내 — 공식·수치는 전부 RATES 파생
const PRINCIPLES = [
  {
    title: "해운 운임 공식",
    body: `첫 1kg ¥${fmtYuan(RATES.sea.firstKgFen)} + 추가 1kg마다 ¥${fmtYuan(RATES.sea.additionalPerKgFen)}씩 더해집니다. 청구중량은 kg 단위로 올림해 적용합니다. 무겁거나 부피가 큰 화물일수록 항공 대비 유리해지는 구조입니다.`,
  },
  {
    title: "항공 운임 공식",
    body: `서류비 ¥${fmtYuan(RATES.air.docFeeFen)}이 고정으로 붙고, 청구중량 100g마다 ¥${fmtYuan(RATES.air.per100gFen)}씩 더해집니다. 100g 단위로 올림해 적용하므로 가벼운 화물을 빠르게 받고 싶을 때 적합합니다.`,
  },
  {
    title: "부피중량 산출",
    body: `가로 × 세로 × 높이(cm)를 ${RATES.volumeDivisor.toLocaleString("ko-KR")}으로 나눈 값이 부피중량(kg)입니다. 실중량과 부피중량 중 큰 값이 청구중량이 되므로, 가볍지만 부피가 큰 화물은 부피중량 기준으로 운임이 계산됩니다.`,
  },
];

// 사용 예시 3건 — 운임은 calcShipping으로 계산 (숫자 하드코딩 금지)
function buildExamples() {
  const ex1Air = calcShipping("AIR", 5 * 1000);
  const ex1Sea = calcShipping("SEA", 5 * 1000);
  const ex2VolKg = calcVolumetricKg(100, 60, 50); // 부피중량 kg
  const ex2Sea = calcShipping("SEA", Math.ceil(ex2VolKg * 1000));
  const ex3VolKg = calcVolumetricKg(30, 20, 15);
  const ex3Sea = calcShipping("SEA", 3 * 1000);
  return [
    {
      title: "예시 1 — 의류 5kg, 항공 택배",
      body: `의류처럼 가볍고 빨리 받아야 하는 화물입니다. 실중량 5kg 기준 항공 운임은 ¥${fmtYuan(ex1Air.fen)}입니다. 같은 무게 해운은 ¥${fmtYuan(ex1Sea.fen)}으로 더 저렴하지만 리드타임이 길어, 판매 일정이 급하면 항공을 선택합니다.`,
    },
    {
      title: "예시 2 — 가구(대형 화물), 해운",
      body: `100×60×50cm 가구는 실중량이 20kg여도 부피중량이 ${ex2VolKg.toLocaleString("ko-KR")}kg라서 부피중량이 청구중량이 됩니다. 해운 운임은 ¥${fmtYuan(ex2Sea.fen)}입니다. 이 정도 부피부터는 항공보다 해운이 확실히 유리하고, 대량이면 CBM 기준 LCL 해운(준비 중)도 검토 대상입니다.`,
    },
    {
      title: "예시 3 — 소형 전자기기, 실중량 적용",
      body: `30×20×15cm 소형 전자기기는 부피중량이 ${ex3VolKg.toLocaleString("ko-KR")}kg에 불과해, 실중량 3kg이 그대로 청구중량이 됩니다. 해운 운임은 ¥${fmtYuan(ex3Sea.fen)}입니다. 작고 밀도 높은 화물은 실중량 기준이라 계산이 단순합니다.`,
    },
  ];
}

const FAQ = [
  {
    q: "계산 결과가 실제 결제 금액과 다를 수 있나요?",
    a: "네. 이 계산기는 공개 요율 기준 참고용 안내이며 최종 금액이 아닙니다. 확정 운임은 창고에서 실측한 중량·치수로 출고 시점에 정해지고, ¥ 단가는 결제일 당일 환율로 원화 환산됩니다.",
  },
  {
    q: "해운과 항공 중 무엇을 골라야 하나요?",
    a: "가볍고 급한 화물은 항공, 무겁거나 부피가 큰 화물은 해운이 대체로 유리합니다. 위 계산기에 같은 값을 넣으면 두 방식 운임이 나란히 비교되므로, 금액 차이와 리드타임을 함께 보고 결정하시면 됩니다.",
  },
  {
    q: "사업자 대량 화물(LCL 해운)도 계산할 수 있나요?",
    a: "LCL 해운 요율은 준비 중입니다. 지금은 해운·항공 택배 기준으로 비교할 수 있으며, CBM 단위 대량 화물은 접수 후 항목별 견적으로 별도 안내드립니다.",
  },
];

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

        {/* 계산 원리 */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-heading">계산 원리</h2>
          <p className="mt-2 text-sm text-secondary">
            이 계산기는 요금 안내에 공개된 요율을 그대로 사용합니다. 견적서의 예상 운임도 같은 공식으로 계산되므로, 여기서 확인한 구조가 실제 청구 구조와 동일합니다.
          </p>
          <div className="mt-5 space-y-4">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="rounded-[16px] bg-surface border border-black/5 p-6">
                <p className="font-semibold text-heading">{p.title}</p>
                <p className="mt-2 text-sm text-secondary">{p.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 사용 예시 3건 */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-heading">사용 예시</h2>
          <p className="mt-2 text-sm text-secondary">
            자주 들어오는 화물 유형 세 가지로 계산 흐름을 보여드립니다. 아래 운임은 공개 요율로 계산한 값이며, 원화 금액은 결제일 환율에 따라 달라집니다.
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

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-heading">자주 묻는 질문</h2>
          <div className="mt-5 space-y-4">
            {FAQ.map((f) => (
              <div key={f.q} className="rounded-[16px] bg-surface border border-black/5 p-6">
                <p className="font-semibold text-heading">Q. {f.q}</p>
                <p className="mt-2 text-sm text-secondary">A. {f.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/guide/pricing" className="font-semibold text-accent">전체 요율표 보기 →</Link>
          <Link href="/calculators" className="text-secondary hover:text-heading">계산기 목록으로</Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
