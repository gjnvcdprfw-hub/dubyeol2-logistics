import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import TrustStats from "@/components/public/trust-stats";
import SectionCta from "@/components/public/section-cta";
import { RATES } from "@/lib/rates";

export const metadata: Metadata = {
  title: "검품 | 물류",
  description: "전문 검품원이 중국 공장·생산 현장을 직접 방문해 품질·수량·포장을 확인하고 사진이 담긴 보고서로 알려드립니다.",
};

const CARD = "rounded-[16px] bg-surface shadow-[0_7px_30px_rgba(90,114,123,0.11)]";
const BADGE = "text-xs font-semibold rounded-full bg-warning-tint text-heading px-3 py-1";

const TYPES: [string, string][] = [
  ["품질검품", "생산 완료된 상품의 외관·수량·기능을 현장에서 확인해 불량을 선적 전에 걸러냅니다."],
  ["공장감사", "거래 전 공장의 실체, 생산 능력, 품질 관리 체계를 방문 확인해 사기·부실 거래를 예방합니다."],
  ["선적검품", "출고 직전 포장 상태·수량·라벨을 확인해 선적 사고를 막습니다."],
];

const STEPS: [string, string][] = [
  ["신청 접수", "품목·수량·공장 지역을 입력해 검품을 신청합니다."],
  ["일정 조율", "공장과 방문 일정을 조율해 확정합니다."],
  ["견적·결제", "검품 일수 기준 견적을 확인하고 결제합니다."],
  ["검품 진행", "검품원이 현장에서 체크리스트 기준으로 확인합니다."],
  ["보고서 수령", "사진이 포함된 검품 보고서를 24시간 내 받아봅니다."],
];

const PRICE_TIERS: [string, string][] = [
  ["단기 (1~4일)", "짧은 일정의 단건 검품"],
  ["중기 (5~9일)", "여러 공장·품목을 묶은 일정"],
  ["장기 (10일 이상)", "정기 검품·상주형 일정"],
];

const FAQ: [string, string][] = [
  ["창고 검수와 출장검품은 무엇이 다른가요?", `창고 검수는 저희 중국 창고에 입고된 상품을 확인하는 것(유료 검수 개당 ¥${RATES.inspectionFeeFenPerUnit / 100})이고, 출장검품은 전문 검품원이 공장·생산 현장을 직접 방문하는 별도 서비스입니다.`],
  ["비용은 어떻게 책정되나요?", "검품 일수 기준의 일당 요금제이며, 일정이 길수록 일당이 낮아지는 구조입니다. 구체 단가는 오픈 전 확정해 공개합니다."],
  ["보고서는 언제 받을 수 있나요?", "검품 완료 후 24시간 내 사진이 포함된 보고서를 제공합니다."],
  ["어느 지역까지 방문 가능한가요?", "중국 주요 생산 지역을 커버하며, 지역별 가능 여부는 신청 시 확인해 드립니다."],
  ["검품 결과 불량이 많으면 어떻게 하나요?", "보고서를 근거로 재작업·교환·반품 등 판매자와의 협의를 지원합니다. 최종 진행 여부는 고객이 결정합니다."],
];

export default function InspectionPage() {
  return (
    <main className="bg-bg text-body">
      <SiteHeader />

      {/* 히어로 */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex flex-wrap gap-2">
          {["전문 검품원 현장 방문", "보고서 24시간 내 제공", "일당 요금제"].map((b) => (
            <span key={b} className={BADGE}>{b}</span>
          ))}
        </div>
        <h1 className="mt-6 text-4xl md:text-5xl font-semibold text-heading leading-tight">
          받아보기 전에,<br /><span className="text-accent">현장에서 먼저 확인합니다</span>
        </h1>
        <p className="mt-5 text-lg text-secondary max-w-2xl">
          전문 검품원이 중국 공장·생산 현장을 직접 방문해 품질·수량·포장을 확인하고
          사진이 담긴 보고서로 알려드립니다.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/auth/register" className="bg-accent text-white text-lg font-semibold rounded-[12px] px-8 py-4">무료 가입하기</Link>
          <Link href="/guide" className="text-heading text-lg font-semibold px-4 py-4">이용 가이드 →</Link>
        </div>
      </section>

      {/* 정의 문단 */}
      <section className="bg-surface border-y border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold text-heading">검품감사란?</h2>
          <p className="mt-4 text-secondary max-w-3xl leading-relaxed">
            검품감사(출장검품)는 상품이 한국에 도착한 뒤에야 불량을 발견하는 위험을 없애기 위해,
            전문 검품원이 중국 공장이나 생산 현장을 직접 방문해 품질·수량·포장 상태를 확인하는
            서비스입니다. 창고에 입고된 상품을 확인하는 창고 검수와 달리, 생산 단계부터
            선적 직전까지 현장에서 문제를 잡아냅니다. 대량 발주나 첫 거래 공장일수록
            선적 전 검품이 반품·재작업 비용을 크게 줄여줍니다.
          </p>
        </div>
      </section>

      {/* 유형 3카드 */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold text-heading">검품 유형</h2>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {TYPES.map(([t, d]) => (
            <div key={t} className={`${CARD} p-6`}>
              <h3 className="font-semibold text-heading">{t}</h3>
              <p className="mt-2 text-sm text-secondary">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5단계 프로세스 */}
      <section className="bg-surface-alt border-y border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold text-heading">진행 순서 5단계</h2>
          <ol className="mt-8 grid md:grid-cols-5 gap-4">
            {STEPS.map(([t, d], i) => (
              <li key={t} className={`${CARD} p-5`}>
                <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-accent text-white text-sm font-semibold">{i + 1}</span>
                <h3 className="mt-3 font-semibold text-heading">{t}</h3>
                <p className="mt-1 text-xs text-secondary">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 가격 3단 — 오픈 전 확정 자리표시 */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-semibold text-heading">요금 안내</h2>
          <span className={BADGE}>오픈 전 확정</span>
        </div>
        <p className="mt-3 text-secondary">검품 일수 기준 일당 요금제입니다. 일정이 길수록 일당이 낮아집니다.</p>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {PRICE_TIERS.map(([t, d]) => (
            <div key={t} className={`${CARD} p-6`}>
              <p className="text-sm text-secondary">{t}</p>
              <p className="mt-2 text-2xl font-semibold text-heading">오픈 전 확정</p>
              <p className="mt-2 text-xs text-secondary">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">출장검품 단가는 정식 오픈 전 확정해 공개합니다. 확정 전 견적은 신청 시 개별 안내드립니다.</p>
      </section>

      {/* FAQ */}
      <section className="bg-surface border-y border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold text-heading">자주 묻는 질문</h2>
          <div className="mt-8 space-y-4">
            {FAQ.map(([q, a]) => (
              <details key={q} className={`${CARD} p-5`}>
                <summary className="font-semibold text-heading cursor-pointer">{q}</summary>
                <p className="mt-3 text-sm text-secondary">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <TrustStats />
      <SectionCta title="선적 전에 확인하면 반품이 줄어듭니다" sub="가입 후 검품 일정과 견적을 안내받아 보세요." />
      <SiteFooter />
    </main>
  );
}
