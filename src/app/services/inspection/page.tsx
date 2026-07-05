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
  ["품질검품", "생산 완료된 상품의 외관·수량·기능을 현장에서 직접 확인해 불량을 선적 전에 걸러냅니다. 불량률과 유형이 정리된 보고서로 재작업 여부를 판단할 수 있습니다."],
  ["공장감사", "거래를 시작하기 전에 공장의 실체, 생산 능력, 품질 관리 체계를 방문 확인해 사기·부실 거래를 예방합니다. 첫 거래 공장일수록 효과가 큽니다."],
  ["선적검품", "출고 직전 포장 상태·수량·라벨·마킹을 확인해 잘못 실리거나 빠지는 선적 사고를 막습니다. 대량 발주의 마지막 안전장치입니다."],
];

const STEPS: [string, string][] = [
  ["신청 접수", "품목·수량·공장 지역과 특별 요구사항을 입력해 검품을 신청합니다."],
  ["일정 조율", "공장과 방문 일정을 조율해 확정하고 진행 상황을 알려드립니다."],
  ["견적·결제", "검품 일수 기준 견적을 확인하고 결제하면 일정이 확정됩니다."],
  ["검품 진행", "검품원이 현장에서 체크리스트 기준으로 항목별 확인을 진행합니다."],
  ["보고서 수령", "사진이 포함된 검품 보고서를 완료 후 24시간 내 받아봅니다."],
];

const PRICE_TIERS: [string, string][] = [
  ["단기 (1~4일)", "짧은 일정의 단건 검품"],
  ["중기 (5~9일)", "여러 공장·품목을 묶은 일정"],
  ["장기 (10일 이상)", "정기 검품·상주형 일정"],
];

const APPLICATION_TABS: [string, string][] = [
  ["기본정보", "품목, 수량, 검사 목적을 정리하는 자리입니다."],
  ["공장정보", "공장명과 위치 정보는 고객 입력 전까지 저장하지 않습니다."],
  ["일정관리", "방문 희망일과 검품 가능 일정을 조율하는 흐름입니다."],
  ["보고서", "사진과 체크리스트 결과가 담긴 보고서 샘플 자리입니다."],
];

const RELATED_SERVICES: [string, string, string, string][] = [
  ["🛒", "구매대행", "상품 구매와 판매자 협의를 함께 진행", "/services/purchase-agency"],
  ["🚢", "배송대행", "검품 후 출고와 통관까지 이어지는 흐름", "/services/shipping-agency"],
  ["₩", "요금 안내", "검수·부가서비스 단가 기준 확인", "/guide/pricing"],
  ["📘", "이용가이드", "신청 전 준비할 항목 확인", "/guide"],
];

const FAQ: [string, string][] = [
  ["창고 검수와 출장검품은 무엇이 다른가요?", `창고 검수는 저희 중국 창고에 입고된 상품을 확인하는 것(유료 검수 개당 ¥${RATES.inspectionFeeFenPerUnit / 100})이고, 출장검품은 전문 검품원이 공장·생산 현장을 직접 방문하는 별도 서비스입니다. 창고 입고 전, 생산 단계에서 문제를 잡아야 하는 대량 발주에는 출장검품이 맞습니다.`],
  ["비용은 어떻게 책정되나요?", "검품 일수 기준의 일당 요금제이며, 일정이 길수록 일당이 낮아지는 구조입니다. 교통·출장 실비 포함 여부는 견적에 항목으로 표기합니다. 구체 단가는 오픈 전 확정해 공개합니다."],
  ["보고서는 언제, 어떤 형태로 받을 수 있나요?", "검품 완료 후 24시간 내 제공합니다. 확인 항목별 결과와 현장 사진이 포함되어, 재작업·협상의 근거 자료로 그대로 쓸 수 있습니다."],
  ["어느 지역까지 방문 가능한가요?", "중국 주요 생산 지역을 커버하며, 지역별 가능 여부와 일정은 신청 시 확인해 드립니다. 공장 주소만 알려주시면 됩니다."],
  ["공장에 전달할 요구사항이 있으면 어떻게 하나요?", "신청 시 특별 요구사항을 남기면 검품원에게 전달되어 체크리스트에 반영됩니다. 치수 기준, 기능 확인 방법 등 구체적으로 적을수록 좋습니다."],
  ["검품 결과 불량이 많으면 어떻게 하나요?", "보고서를 근거로 재작업·교환·반품 등 판매자와의 협의를 지원합니다. 최종 진행 여부는 고객이 결정하며, 선적 보류 요청도 가능합니다."],
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
          제품 검수 대행<br /><span className="text-accent">현장에서 먼저 확인합니다</span>
        </h1>
        <p className="mt-5 text-lg text-secondary max-w-2xl">
          전문 검품원이 중국 공장·생산 현장을 직접 방문해 품질·수량·포장을 확인하고
          사진이 담긴 보고서로 알려드립니다. 신청부터 일정 조율, 보고서 수령까지
          대시보드에서 단계별로 확인할 수 있습니다.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="#inspection-request" className="bg-accent text-white text-lg font-semibold rounded-[12px] px-8 py-4">검사 신청하기</Link>
          <Link href="#inspection-report" className="text-heading text-lg font-semibold px-4 py-4">샘플 보기 →</Link>
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
            선적 직전까지 현장에서 문제를 잡아냅니다.
          </p>
          <p className="mt-4 text-secondary max-w-3xl leading-relaxed">
            한국에 도착한 뒤 발견된 불량은 반품 운임과 재작업 기간을 모두 고객이 부담하게 되지만,
            선적 전에 발견하면 판매자 부담으로 현지에서 처리할 수 있습니다. 대량 발주나
            첫 거래 공장일수록 선적 전 검품이 반품·재작업 비용을 크게 줄여주는 이유입니다.
            검품 목적에 따라 품질검품, 공장감사, 선적검품 세 가지 유형 중에 선택할 수 있습니다.
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

      <section id="inspection-request" className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-semibold text-heading">검사 신청 흐름</h2>
          <span className={BADGE}>제출 없음</span>
        </div>
        <p className="mt-3 text-secondary max-w-2xl">
          원본의 신청 탭 구조를 기준판에 두되, 실제 폼 제출·공장 연락·외부 상태 변경은 하지 않습니다.
        </p>
        <div className="mt-8 grid md:grid-cols-4 gap-4">
          {APPLICATION_TABS.map(([title, desc], index) => (
            <div key={title} className={`${CARD} p-5`}>
              <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-accent text-white text-sm font-semibold">{index + 1}</span>
              <h3 className="mt-3 font-semibold text-heading">{title}</h3>
              <p className="mt-2 text-sm text-secondary">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="inspection-report" className="bg-surface border-y border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold text-heading">보고서 흐름</h2>
          <div className="mt-8 rounded-[16px] bg-bg border border-black/5 p-8">
            <p className="text-xs font-semibold text-muted">이미지·보고서 자리표시</p>
            <p className="mt-3 text-2xl font-semibold text-heading">검품 사진, 불량 유형, 수량 확인, 조치 의견</p>
            <p className="mt-2 text-sm text-secondary">
              실제 보고서 파일이나 현장 이미지는 반입하지 않습니다. 정식 오픈 전 샘플 양식을 확정합니다.
            </p>
          </div>
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

      <section className="bg-surface-alt border-y border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold text-heading">관련 서비스</h2>
          <div className="mt-8 grid md:grid-cols-4 gap-4">
            {RELATED_SERVICES.map(([icon, title, desc, href]) => (
              <Link key={title} href={href} className={`${CARD} p-5 border border-black/5 hover:border-accent/40 transition-colors`}>
                <span className="text-2xl">{icon}</span>
                <h3 className="mt-3 font-semibold text-heading">{title}</h3>
                <p className="mt-2 text-sm text-secondary">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
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
