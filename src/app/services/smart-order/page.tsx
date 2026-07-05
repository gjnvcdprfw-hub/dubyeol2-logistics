import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import TrustStats from "@/components/public/trust-stats";
import SectionCta from "@/components/public/section-cta";
import { RATES } from "@/lib/rates";

export const metadata: Metadata = {
  title: "스마트오더 | 물류",
  description: "플랫폼 주문 엑셀을 올리면 1688 매칭부터 구매, 입출고 추적, 국내 운송장 회신까지 하나의 흐름으로 처리합니다.",
};

const CARD = "rounded-[16px] bg-surface shadow-[0_7px_30px_rgba(90,114,123,0.11)]";

const FLOW: [string, string][] = [
  ["엑셀 업로드", "스마트스토어·쿠팡에서 내려받은 주문 엑셀을 양식 변환 없이 그대로 올립니다."],
  ["AI 파싱·매칭", "주문 행을 자동 구조화하고, 1688 링크가 포함된 행은 상품·옵션 매칭까지 추천합니다."],
  ["확인·주문", "추천 매칭을 확인·확정하면 구매가 진행됩니다. 확인 전에는 주문되지 않습니다."],
  ["입출고·운송장 회신", "창고 입고·한국행 출고를 추적하고, 플랫폼 업로드용 국내 운송장 회신 엑셀을 받습니다."],
];

const TEAMS = [
  "스마트스토어·쿠팡에서 매일 수십~수백 건 주문을 처리하는 셀러",
  "주문 엑셀을 손으로 옮겨 적다가 실수가 나는 팀",
  "같은 상품을 반복 발주하는 위탁·사입 셀러",
  "운송장 회신까지 하나의 흐름으로 끝내고 싶은 팀",
];

const PAINS = [
  "주문 엑셀을 1688 주문서로 수작업 변환하는 시간",
  "옵션 매칭 실수로 잘못 발주되는 사고",
  "주문 건별 진행 상태를 따로 추적하는 번거로움",
  "국내 운송장 번호를 플랫폼에 일일이 입력하는 작업",
  "반복 주문마다 같은 매칭을 다시 찾는 낭비",
];

const FEATURES: [string, string][] = [
  ["엑셀 자동 파싱", "플랫폼 주문 엑셀을 업로드하면 주문 행이 자동으로 구조화됩니다. 열 순서가 달라도 AI가 항목을 인식하므로 양식을 맞출 필요가 없습니다."],
  ["1688 옵션 매칭 추천", "상품·옵션 매칭 후보를 추천하고, 고객 확인 후에만 주문합니다. 애매한 건은 확인 필요 목록으로 분리되어 그 건만 검토하면 됩니다."],
  ["매칭 라이브러리", "한 번 확정한 매칭은 저장되어 다음 주문에 자동 재사용됩니다. 반복 주문이 많을수록 확인할 건이 줄어듭니다."],
  ["운송장 회신 엑셀", "출고 후 국내 운송장 번호를 플랫폼 업로드용 엑셀로 돌려드립니다. 건별로 복사해 붙여넣는 작업이 사라집니다."],
  ["구매 방식 선택", `주문 건마다 구매대행(수수료 상품가의 ${RATES.commissionRate * 100}% + VAT)과 직접구매(고객 1688 계정 사용, 구매 수수료 없음) 중 선택할 수 있게 준비하고 있습니다.`],
  ["진행 현황 한눈에", "신청 건수, 확인 필요, 주문 준비 상태를 작업공간 카운터로 한눈에 보고, 건별 상세는 목록에서 확인합니다."],
];

const STEPS: [string, string][] = [
  ["주문 엑셀 업로드", "플랫폼에서 내려받은 주문 엑셀(.xlsx)을 작업공간에 올립니다."],
  ["자동 파싱 확인", "구조화된 주문 목록에서 확인 필요로 분류된 건만 검토합니다."],
  ["매칭 확정", "추천된 1688 상품·옵션 매칭을 확정합니다. 확정본은 라이브러리에 저장됩니다."],
  ["구매 진행", "확정된 주문이 일괄 구매로 진행됩니다. 구매 방식은 건별로 선택합니다."],
  ["입고·출고 추적", "창고 입고와 한국행 출고를 대시보드에서 건별로 추적합니다."],
  ["운송장 회신", "국내 운송장 회신 엑셀을 받아 플랫폼에 그대로 업로드하면 끝입니다."],
];

// 비교 6행: 수기 처리 vs 스마트오더
const COMPARE_ROWS: [string, string, string][] = [
  ["주문 변환", "엑셀을 열어 한 줄씩 옮겨 적기", "업로드 한 번으로 자동 구조화"],
  ["상품 매칭", "1688에서 매번 검색해 대조", "AI 추천 + 매칭 라이브러리 재사용"],
  ["주문 실수", "옵션 오기입 위험 상존", "고객 확인 후에만 주문 진행"],
  ["진행 추적", "주문 건별로 개별 확인", "대시보드에서 일괄 추적"],
  ["운송장 입력", "플랫폼에 건별 수동 입력", "회신 엑셀로 일괄 업로드"],
  ["반복 주문", "같은 작업을 처음부터 반복", "저장된 매칭으로 즉시 재주문"],
];

const RELATED_LINKS: [string, string, string][] = [
  ["구매대행", "1688 상품 구매와 결제까지 맡기는 흐름", "/services/purchase-agency"],
  ["배송대행", "직접 구매한 상품의 입고와 출고 흐름", "/services/shipping-agency"],
  ["이용 가이드", "주문 엑셀을 준비하는 기본 흐름", "/guide"],
];

const FAQ: [string, string][] = [
  ["엑셀을 올리면 바로 주문되나요?", "아닙니다. 기준판에서는 업로드를 받지 않고, 정식 오픈 후에도 고객이 매칭을 확인·확정한 뒤에만 주문 흐름으로 넘어갑니다."],
  ["양식을 꼭 맞춰야 하나요?", "정식 오픈 후에는 주요 플랫폼 주문 엑셀을 그대로 읽는 방향으로 준비합니다. 기준판에서는 양식 변환 없이 시작한다는 흐름만 보여줍니다."],
  ["한 번 매칭한 상품은 다시 쓸 수 있나요?", "매칭 라이브러리에 저장해 반복 주문 때 다시 쓰는 구조를 준비합니다. 현재 화면에서는 자리표시입니다."],
  ["운송장 회신도 되나요?", "출고 후 국내 운송장 회신 엑셀을 돌려주는 흐름을 준비합니다. 기준판에서는 실제 파일 생성이나 외부 상태 변경을 하지 않습니다."],
];

export default function SmartOrderPage() {
  return (
    <main className="bg-bg text-body">
      <SiteHeader />

      {/* 준비 중 상단 고정 배지 */}
      <div className="sticky top-16 z-30 bg-warning-tint border-b border-black/5">
        <p className="max-w-6xl mx-auto px-6 py-2.5 text-sm font-semibold text-heading text-center">
          🚧 스마트오더는 준비 중입니다 — 정식 오픈 후 이용하실 수 있습니다.
        </p>
      </div>

      {/* 히어로 */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex flex-wrap gap-2">
          {["엑셀 대량 주문", "AI 매칭 추천", "운송장 회신까지"].map((b) => (
            <span key={b} className="text-xs font-semibold rounded-full bg-warning-tint text-heading px-3 py-1">{b}</span>
          ))}
        </div>
        <h1 className="mt-6 text-4xl md:text-5xl font-semibold text-heading leading-tight">
          스마트오더<br /><span className="text-accent">Excel로 시작하는 1688 대량 구매 자동화</span>
        </h1>
        <p className="mt-5 text-lg text-secondary max-w-2xl">
          스마트스토어·쿠팡 주문 엑셀을 올리면 AI가 주문 행을 구조화하고,
          1688 상품·옵션 매칭부터 구매, 입출고 추적, 국내 운송장 회신까지
          하나의 흐름으로 처리합니다. 수작업 변환과 옵션 오기입이 사라집니다.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/auth/register" className="bg-accent text-white text-lg font-semibold rounded-[12px] px-8 py-4">스마트오더 시작</Link>
          <Link href="/dashboard/smart-order" className="text-heading text-lg font-semibold px-4 py-4">작업공간 열기 →</Link>
          <Link href="#smart-order-sample" className="hidden md:inline-flex text-heading text-lg font-semibold px-4 py-4">처리 예시 보기</Link>
        </div>
      </section>

      {/* 운영 흐름 4단계 */}
      <section className="bg-surface border-y border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold text-heading">운영 흐름</h2>
          <ol className="mt-8 grid md:grid-cols-4 gap-4">
            {FLOW.map(([t, d], i) => (
              <li key={t} className="rounded-[16px] bg-bg border border-black/5 p-5">
                <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-accent text-white text-sm font-semibold">{i + 1}</span>
                <h3 className="mt-3 font-semibold text-heading">{t}</h3>
                <p className="mt-1 text-xs text-secondary">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="smart-order-sample" className="max-w-6xl mx-auto px-6 py-16">
        <div className={`${CARD} p-8`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-accent">처리 예시</p>
              <h2 className="mt-2 text-3xl font-semibold text-heading">업로드 화면은 자리표시만 둡니다</h2>
            </div>
            <span className="text-xs font-semibold rounded-full bg-warning-tint text-heading px-3 py-1">실제 파일 업로드 없음</span>
          </div>
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            {["엑셀 행 구조화", "1688 상품 매칭", "운송장 회신"].map((label) => (
              <div key={label} className="rounded-[16px] bg-bg border border-black/5 p-5">
                <p className="font-semibold text-heading">{label}</p>
                <p className="mt-2 text-sm text-secondary">정식 오픈 전 연결 예정인 화면 자리입니다.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 이런 팀에 맞습니다 */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold text-heading">이런 팀에 맞습니다</h2>
        <ul className="mt-8 grid md:grid-cols-2 gap-4">
          {TEAMS.map((t) => (
            <li key={t} className={`${CARD} p-5 text-sm text-secondary`}>✓ <span className="text-heading font-medium">{t}</span></li>
          ))}
        </ul>
      </section>

      {/* 줄여주는 문제 5 */}
      <section className="bg-surface-alt border-y border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold text-heading">이 다섯 가지를 줄여드립니다</h2>
          <ol className="mt-8 space-y-3">
            {PAINS.map((p, i) => (
              <li key={p} className={`${CARD} p-4 flex items-center gap-4 text-sm`}>
                <span className="inline-flex w-7 h-7 shrink-0 items-center justify-center rounded-full bg-warning-tint text-heading font-semibold">{i + 1}</span>
                <span className="text-secondary">{p}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 기능 4카드 */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold text-heading">핵심 기능</h2>
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {FEATURES.map(([t, d]) => (
            <div key={t} className={`${CARD} p-6`}>
              <h3 className="font-semibold text-heading">{t}</h3>
              <p className="mt-2 text-sm text-secondary">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6단계 */}
      <section className="bg-surface border-y border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold text-heading">이용 순서 6단계</h2>
          <ol className="mt-8 grid md:grid-cols-3 gap-4">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="rounded-[16px] bg-bg border border-black/5 p-5">
                <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-accent text-white text-sm font-semibold">{i + 1}</span>
                <h3 className="mt-3 font-semibold text-heading">{t}</h3>
                <p className="mt-1 text-xs text-secondary">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 비교 6행 */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold text-heading">수기 처리와 비교하면</h2>
        <div className={`mt-8 overflow-x-auto ${CARD}`}>
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-black/5 text-left">
                <th className="px-5 py-4 font-semibold text-heading">구분</th>
                <th className="px-5 py-4 font-semibold text-secondary">수기 처리</th>
                <th className="px-5 py-4 font-semibold text-accent">스마트오더</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map(([label, manual, smart]) => (
                <tr key={label} className="border-b border-black/5 last:border-0">
                  <td className="px-5 py-4 font-semibold text-heading">{label}</td>
                  <td className="px-5 py-4 text-secondary">{manual}</td>
                  <td className="px-5 py-4 text-heading font-medium">{smart}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-muted">
          구매 방식은 구매대행(수수료 상품가의 {RATES.commissionRate * 100}% + VAT) 기준이며, 고객 1688 계정으로 직접 구매하는 방식(구매 수수료 없음)도 준비하고 있습니다. 요율은 서비스 준비 중 기준으로 변경될 수 있습니다.
        </p>
      </section>

      <section className="bg-surface border-y border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold text-heading">관련 문서와 서비스</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {RELATED_LINKS.map(([title, desc, href]) => (
              <Link key={title} href={href} className={`${CARD} p-6 hover:border-accent/40 border border-black/5 transition-colors`}>
                <h3 className="font-semibold text-heading">{title}</h3>
                <p className="mt-2 text-sm text-secondary">{desc}</p>
                <p className="mt-4 text-sm font-semibold text-accent">바로가기 →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold text-heading">자주 묻는 질문</h2>
        <div className="mt-8 space-y-4">
          {FAQ.map(([q, a]) => (
            <details key={q} className={`${CARD} p-5`}>
              <summary className="font-semibold text-heading cursor-pointer">{q}</summary>
              <p className="mt-3 text-sm text-secondary">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <TrustStats />
      <SectionCta title="스마트오더 오픈 소식을 먼저 받아보세요" sub="지금 가입하면 정식 오픈 시 가장 먼저 알려드립니다." />
      <SiteFooter />
    </main>
  );
}
