import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import SectionCta from "@/components/public/section-cta";
import { RATES } from "@/lib/rates";
import { PRICING } from "@/lib/pricing-data";

export const metadata: Metadata = {
  title: "부가서비스 안내 | 물류",
  description: "원산지 표기·판매 표기·포장·검수 부가서비스 단가와 신청 방법을 안내합니다.",
};

const STEPS = [
  {
    step: "1",
    title: "견적 요청 시 함께 선택",
    desc: "상품 견적을 요청할 때 필요한 부가서비스를 항목별로 선택합니다.",
  },
  {
    step: "2",
    title: "견적서에서 금액 확인",
    desc: "선택한 부가서비스 비용이 견적서에 항목별로 표시됩니다. 확인 후 결제하면 작업이 예약됩니다.",
  },
  {
    step: "3",
    title: "창고 작업 후 출고",
    desc: "상품 입고 후 창고에서 선택한 작업을 처리하고, 완료된 상태로 출고합니다.",
  },
];

const FAQ = [
  {
    q: "부가서비스는 언제 신청하나요?",
    a: "견적 요청 단계에서 함께 선택하는 것이 기본입니다. 입고 후 추가 신청이 필요한 경우 상담을 통해 접수할 수 있으며, 이 경우 출고 일정이 늦어질 수 있습니다.",
  },
  {
    q: "비용은 어떻게 청구되나요?",
    a: "개당 단가 × 수량으로 계산되며, ¥ 단가는 결제일 당일 환율로 원화 환산됩니다. 견적서에 항목별로 나눠서 표시되므로 숨은 비용이 없습니다.",
  },
  {
    q: "원산지 표기는 꼭 해야 하나요?",
    a: "대외무역법상 수입 물품에는 원산지 표시 의무가 있는 품목이 많습니다. 품목별 표시 의무 여부는 통관 요건에 따라 다르므로, 판매 전 스티커·라벨·도장·행택 중 상품에 맞는 방식을 선택하시길 권장합니다.",
  },
];

function PriceCard({
  title,
  desc,
  items,
}: {
  title: string;
  desc: string;
  items: readonly { name: string; price: string }[];
}) {
  return (
    <div className="rounded-[16px] bg-surface border border-black/5 p-6">
      <p className="font-semibold text-heading">{title}</p>
      <p className="mt-1 text-xs text-secondary">{desc}</p>
      <ul className="mt-4 space-y-2 text-sm">
        {items.map((it) => (
          <li key={it.name} className="flex items-center justify-between gap-3 border-b border-black/5 pb-2 last:border-b-0">
            <span className="text-secondary">{it.name}</span>
            <span className="font-medium text-heading whitespace-nowrap">{it.price}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdditionalServicesPage() {
  const svc = PRICING.additionalServices;
  const y = (v: number) => `¥${v.toLocaleString("ko-KR")}`;

  const groups = [
    {
      title: "원산지 표기",
      desc: "수입 통관·판매에 필요한 원산지 표시 작업. 상품 재질과 판매 방식에 따라 스티커·봉제 라벨·도장·행택 중 맞는 방식을 고르면 됩니다.",
      items: svc.origin.map((s) => ({ name: s.name, price: `${y(s.yuanPerUnit)}/개` })),
    },
    {
      title: "판매 표기",
      desc: "국내 판매 요건에 맞춘 표기·라벨 작업. 바코드, KC, 식품검역, 연령 표기처럼 판매 채널·품목이 요구하는 표시를 창고에서 부착합니다.",
      items: svc.salesLabel.map((s) => ({ name: s.name, price: `${y(s.yuanPerUnit)}/개` })),
    },
    {
      title: "포장",
      desc: "상품 보호·묶음 구성 등 포장 작업. 낱개 OPP 포장부터 세트 묶음, 불필요한 태그·포장 제거까지 판매 형태에 맞춰 처리합니다.",
      items: svc.packaging.map((s) => ({ name: s.name, price: `${y(s.yuanPerUnit)}/개` })),
    },
    {
      title: "검수",
      desc: "수량·외관 확인과 기록 옵션. 기본 입고 확인은 무료이며, 상세 확인이 필요하면 유료 검수와 사진·동영상 기록을 추가할 수 있습니다.",
      items: [
        { name: "기본 입고 확인 (사진 1~2장)", price: "무료" },
        { name: "유료 검수", price: `¥${(RATES.inspectionFeeFenPerUnit / 100).toLocaleString("ko-KR")}/개` },
        { name: "추가 사진", price: `${y(PRICING.inspection.extraPhotoYuanPerPhoto)}/장` },
        { name: "동영상 촬영", price: `${y(PRICING.inspection.videoYuanPerMinute)}/분` },
      ],
    },
  ];

  return (
    <main className="bg-bg text-body">
      <SiteHeader />

      {/* 히어로 */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-8">
        <p className="text-sm font-semibold text-accent">이용 가이드 · 부가서비스</p>
        <h1 className="mt-2 text-4xl md:text-5xl font-semibold text-heading">부가서비스 안내</h1>
        <p className="mt-4 text-secondary max-w-2xl">
          원산지 표기부터 포장·검수까지, 중국 창고에서 판매 준비를 끝내고 출고합니다. 모든 단가는 공개 요율입니다.
        </p>
      </section>

      {/* 부가서비스란 */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="rounded-[16px] bg-surface-alt border border-black/5 p-6 text-sm text-secondary space-y-2">
          <p className="font-semibold text-heading text-base">부가서비스란?</p>
          <p>
            중국 창고에 입고된 상품에 원산지 표기, 판매 표기, 재포장, 검수 같은 작업을 대신 처리해 드리는 서비스입니다.
            한국 도착 후 따로 작업할 필요 없이, 창고에서 판매 가능한 상태로 만들어 출고합니다.
          </p>
          <p>비용은 개당 단가 × 수량으로 견적서에 항목별로 표시되며, ¥ 단가는 결제일 당일 환율이 적용됩니다.</p>
          <p>
            국내에서 같은 작업을 하려면 인건비와 재작업 시간이 더 들기 때문에, 대량 판매 준비일수록 중국 창고 단계에서 끝내는 것이 비용·일정 모두 유리합니다.
          </p>
        </div>
      </section>

      {/* 단가 카드 4그룹 */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold text-heading">단가표 (개당)</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {groups.map((g) => (
            <PriceCard key={g.title} title={g.title} desc={g.desc} items={g.items} />
          ))}
        </div>
        <p className="mt-4 text-sm text-secondary">
          ⚠️ {PRICING.disclaimer} 재포장 부자재 단가는{" "}
          <Link href="/guide/pricing" className="text-accent font-medium hover:underline">요금 안내</Link>
          에서 확인할 수 있습니다.
        </p>
      </section>

      {/* 신청 방법 3단계 */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold text-heading">신청 방법</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.step} className="rounded-[16px] bg-surface border border-black/5 p-6">
              <p className="text-accent font-bold text-lg">{s.step}</p>
              <p className="mt-2 font-semibold text-heading">{s.title}</p>
              <p className="mt-2 text-sm text-secondary">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ 3문항 */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold text-heading">자주 묻는 질문</h2>
        <div className="mt-6 space-y-4">
          {FAQ.map((f) => (
            <div key={f.q} className="rounded-[16px] bg-surface border border-black/5 p-6">
              <p className="font-semibold text-heading">Q. {f.q}</p>
              <p className="mt-2 text-sm text-secondary">A. {f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <SectionCta
        title="창고에서 판매 준비까지 끝내세요."
        sub="가입 후 견적 요청 시 부가서비스를 함께 선택할 수 있습니다."
      />
      <SiteFooter />
    </main>
  );
}
