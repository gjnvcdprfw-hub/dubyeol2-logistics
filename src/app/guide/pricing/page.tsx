import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import SectionCta from "@/components/public/section-cta";
import { RATES } from "@/lib/rates";
import { PRICING } from "@/lib/pricing-data";

export const metadata: Metadata = {
  title: "요금 안내 | 물류",
  description: "국제 배송비·창고 보관료·부가서비스·재포장 요율을 전면 공개합니다.",
};

const yuan = (fen: number) => `¥${(fen / 100).toLocaleString("ko-KR")}`;
const won = (v: number) => `₩${v.toLocaleString("ko-KR")}`;

// RATES 파생 배송비 표 행 (요율 숫자 하드코딩 금지 — rates.ts 단일 정본)
const SHIPPING_ROWS = [
  {
    method: "해운 택배",
    rate: `첫 1kg ${yuan(RATES.sea.firstKgFen)} + 추가 kg당 ${yuan(RATES.sea.additionalPerKgFen)} (kg 올림)`,
    leadTime: "약 5~7일",
  },
  {
    method: "항공 택배",
    rate: `서류비 ${yuan(RATES.air.docFeeFen)} 고정 + 100g당 ${yuan(RATES.air.per100gFen)} (100g 올림)`,
    leadTime: "약 3일",
  },
  { method: "LCL 해운 (사업자)", rate: "준비 중", leadTime: "준비 중" },
];

function Disclaimer() {
  return (
    <div className="rounded-[16px] bg-warning-tint border border-black/5 p-5 text-sm text-secondary">
      ⚠️ {PRICING.disclaimer}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-semibold text-heading">{children}</h2>;
}

function PriceTable({
  head,
  rows,
}: {
  head: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="mt-4 overflow-x-auto rounded-[16px] border border-black/5 bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-alt text-left text-heading">
            {head.map((h) => (
              <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-black/5">
              {r.map((c, j) => (
                <td key={j} className={`px-4 py-3 ${j === 0 ? "text-heading font-medium" : "text-secondary"}`}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PricingGuidePage() {
  const svc = PRICING.additionalServices;
  const rep = PRICING.repackaging;

  return (
    <main className="bg-bg text-body">
      <SiteHeader />

      {/* 히어로 */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-8">
        <p className="text-sm font-semibold text-accent">이용 가이드 · 요금 안내</p>
        <h1 className="mt-2 text-4xl md:text-5xl font-semibold text-heading">요금 안내</h1>
        <p className="mt-4 text-secondary">
          배송비·보관료·부가서비스 요율을 전면 공개합니다. 견적서에는 항목별 금액이 그대로 나눠서 표시됩니다.
        </p>
        <div className="mt-6">
          <Disclaimer />
        </div>
      </section>

      {/* 국제 배송비 */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <SectionTitle>국제 배송비</SectionTitle>
        <PriceTable
          head={["배송 방식", "요율", "리드타임"]}
          rows={SHIPPING_ROWS.map((r) => [r.method, r.rate, r.leadTime])}
        />
        <div className="mt-4 rounded-[16px] bg-surface-alt border border-black/5 p-5 text-sm text-secondary space-y-2">
          <p className="font-semibold text-heading">계산 규칙</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>부피중량 = 가로 × 세로 × 높이(cm³) ÷ {RATES.volumeDivisor.toLocaleString("ko-KR")}</li>
            <li>실중량과 부피중량 중 <span className="font-medium text-heading">큰 값</span>을 청구중량으로 과금합니다.</li>
            <li>¥ 단가는 결제일 당일 환율로 원화 환산됩니다.</li>
          </ul>
          <p>
            예상 운임은{" "}
            <Link href="/calculators" className="text-accent font-medium hover:underline">배송비 계산기</Link>
            에서 직접 확인할 수 있습니다.
          </p>
        </div>
        <div className="mt-4">
          <p className="text-sm font-semibold text-heading">국내 택배 추가비 (규격 초과 시)</p>
          <PriceTable
            head={["구간 (무게 또는 세변 합)", "추가비"]}
            rows={PRICING.domesticSurcharge.map((t) => [t.condition, won(t.won)])}
          />
        </div>
      </section>

      {/* 창고 보관료 */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <SectionTitle>창고 보관료</SectionTitle>
        <PriceTable
          head={["보관 기간", "보관료 (박스당·1일)"]}
          rows={[
            [`입고 후 ${PRICING.storage.freeDays}일까지`, "무료"],
            ...PRICING.storage.tiers.map((t) => [t.range, `${won(t.wonPerDayPerBox)}/일`]),
          ]}
        />
        <p className="mt-3 text-sm text-secondary">※ {PRICING.storage.disposalNotice}</p>
      </section>

      {/* 검수 */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <SectionTitle>검수</SectionTitle>
        <PriceTable
          head={["항목", "단가", "비고"]}
          rows={[
            ["기본 입고 확인", "무료", "입고 사진 1~2장 + 외포장 이상 안내 (구매·배송대행 포함)"],
            ["유료 검수", `개당 ${yuan(RATES.inspectionFeeFenPerUnit)}`, "수량·외관 확인"],
            ["추가 사진", `장당 ¥${PRICING.inspection.extraPhotoYuanPerPhoto.toLocaleString("ko-KR")}`, "유료 검수 부가 옵션"],
            ["동영상 촬영", `분당 ¥${PRICING.inspection.videoYuanPerMinute.toLocaleString("ko-KR")}`, "유료 검수 부가 옵션"],
          ]}
        />
        <p className="mt-3 text-sm text-secondary">
          ※ 기본 입고 확인은 전수·샘플링·기능·치수 검사가 아닙니다. 상세 검수는 유료 옵션으로 신청해 주세요.
        </p>
      </section>

      {/* 부가서비스 */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <SectionTitle>부가서비스 (개당, ¥)</SectionTitle>
        <p className="mt-2 text-sm text-secondary">
          상세 안내는{" "}
          <Link href="/guide/services" className="text-accent font-medium hover:underline">부가서비스 안내</Link>
          에서 확인할 수 있습니다.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {(
            [
              ["원산지 표기", svc.origin],
              ["판매 표기", svc.salesLabel],
              ["포장", svc.packaging],
            ] as const
          ).map(([title, items]) => (
            <div key={title}>
              <p className="mt-4 text-sm font-semibold text-heading">{title}</p>
              <PriceTable
                head={["항목", "단가"]}
                rows={items.map((s) => [s.name, `¥${s.yuanPerUnit.toLocaleString("ko-KR")}`])}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 재포장 부자재 */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <SectionTitle>재포장 부자재 (₩)</SectionTitle>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="mt-4 text-sm font-semibold text-heading">박스</p>
            <PriceTable head={["항목", "단가"]} rows={rep.boxes.map((b) => [b.name, won(b.won)])} />
            <p className="mt-4 text-sm font-semibold text-heading">라벨</p>
            <PriceTable head={["항목", "단가"]} rows={rep.labels.map((l) => [l.name, won(l.won)])} />
            <p className="mt-4 text-sm font-semibold text-heading">기타</p>
            <PriceTable head={["항목", "단가"]} rows={rep.etc.map((e) => [e.name, won(e.won)])} />
          </div>
          <div>
            <p className="mt-4 text-sm font-semibold text-heading">포장재</p>
            <PriceTable
              head={["항목", "단가"]}
              rows={rep.materials.map((m) => [
                m.name,
                "unit" in m ? `${won(m.won)} (${m.unit})` : won(m.won),
              ])}
            />
          </div>
        </div>
        <p className="mt-3 text-sm text-secondary">※ {rep.autoPackNote}</p>
      </section>

      {/* 하단 면책 */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <Disclaimer />
      </section>

      <SectionCta
        title="요율은 공개, 견적은 항목별로."
        sub="가입하고 첫 주문부터 항목별 투명 견적을 받아보세요."
      />
      <SiteFooter />
    </main>
  );
}
