import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import TrustStats from "@/components/public/trust-stats";
import SectionCta from "@/components/public/section-cta";
import { RATES } from "@/lib/rates";

export const metadata: Metadata = {
  title: "물류 — 중국 소싱 물류 플랫폼",
  description: "1688 구매대행, 배송대행, 검품, 스마트오더까지. 주문 접수부터 입고 확인, 항목별 견적까지 사업자 셀러를 위한 중국→한국 통합 물류 플랫폼입니다.",
};

const FAQ = [
  {
    q: "입고 확인은 어떻게 해주나요?",
    a: "중국 창고 도착 시 입고 사진 1~2장과 외포장 이상 여부를 기본 제공합니다. 수량·외관·하자 확인은 유료 검수 옵션입니다.",
  },
  {
    q: "수수료는 얼마인가요?",
    a: `구매대행 수수료는 상품가의 ${RATES.commissionRate * 100}%이고, 배송대행은 구매 수수료가 없습니다. 유료 검수는 개당 ¥${RATES.inspectionFeeFenPerUnit / 100}입니다. 전체 요율은 공개 요율표에서 확인할 수 있습니다.`,
  },
  {
    q: "국제 배송비는 어떻게 계산되나요?",
    a: `실중량과 부피중량(cm³ ÷ ${RATES.volumeDivisor.toLocaleString("ko-KR")}) 중 큰 값을 청구중량으로 하며, 해운·항공 요율을 공개하고 있습니다. 계산기에서 직접 예상 운임을 확인할 수 있습니다.`,
  },
  {
    q: "배송 기간은 얼마나 걸리나요?",
    a: "노선·통관 상황에 따라 달라 정확한 기간은 접수 후 안내드립니다. 정식 오픈 후 노선별 평균 소요일을 공개할 예정입니다.",
  },
  {
    q: "견적에 숨은 비용이 있나요?",
    a: "없습니다. 상품가, 수수료, 검수비, 예상 국제운임을 항목별로 나눠 보여드리며, 확정 전 금액은 참고용임을 함께 표기합니다.",
  },
];

export default function Home() {
  return (
    <main className="bg-bg text-body">
      <SiteHeader />

      {/* 히어로: 가치제안 + 검색창 UI + 신뢰 뱃지 3 */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <h1 className="text-[56px] md:text-[96px] leading-none font-semibold text-heading">
          중국 소싱 물류,<br /><span className="text-accent">투명하게.</span>
        </h1>
        <p className="mt-6 text-lg text-secondary">주문 접수부터 입고 확인, 항목별 견적까지. 사업자 셀러를 위한 중국→한국 통합 물류.</p>
        <div className="mt-8 flex gap-4">
          <Link href="/auth/register" className="bg-accent text-white text-lg font-semibold rounded-[12px] px-8 py-4">무료 가입하기</Link>
          <Link href="/auth/login" className="text-heading text-lg font-semibold px-4 py-4">로그인 →</Link>
        </div>
        <div className="mt-10 max-w-2xl">
          <div className="flex items-center gap-2 rounded-[16px] bg-surface border border-black/10 p-2 shadow-sm">
            <input
              type="text"
              placeholder="상품명을 입력하세요"
              disabled
              className="flex-1 px-4 py-3 bg-transparent text-sm text-body placeholder:text-muted outline-none"
            />
            <Link href="/search" className="bg-accent text-white text-sm font-semibold rounded-[12px] px-6 py-3 shrink-0">검색</Link>
          </div>
          <p className="mt-2 text-xs text-muted">🚧 1688 상품 검색은 준비 중입니다 — 오픈 후 이용하실 수 있습니다.</p>
        </div>
        <ul className="mt-10 flex flex-wrap gap-6 text-sm text-secondary">
          <li>✓ 입고 사진 기본 제공</li>
          <li>✓ 항목별 투명 견적</li>
          <li>✓ 사업자 셀러 전용</li>
        </ul>
      </section>

      {/* 서비스 1 — 1688 검색·구매대행 */}
      <section className="bg-surface border-t border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <p className="text-sm font-semibold text-accent">1688 검색·구매대행</p>
          <h2 className="mt-2 text-3xl font-semibold text-heading">상품 링크만 있으면 구매까지 대신합니다</h2>
          <p className="mt-3 text-secondary max-w-2xl">
            상품 링크와 수량만 입력하면 접수 완료. 구매·결제·중국 내 배송을 대신 처리하고,
            수수료(상품가의 {RATES.commissionRate * 100}%)와 부가세까지 항목별 견적으로 보여드립니다.
          </p>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {[
              ["주문 접수", "상품 링크와 수량만 입력하면 접수 완료. 구매대행·배송대행 중 선택합니다."],
              ["입고 확인", "중국 창고 도착 시 입고 사진 1~2장과 외포장 이상 여부를 기본 제공합니다."],
              ["투명 견적", "상품가, 수수료, 검수비, 예상 국제운임을 항목별로 보여드립니다. 숨은 비용이 없습니다."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-[16px] bg-bg p-6">
                <h3 className="font-semibold text-heading mb-2">{t}</h3>
                <p className="text-sm text-secondary">{d}</p>
              </div>
            ))}
          </div>
          <Link href="/services/purchase-agency" className="inline-block mt-8 text-sm font-semibold text-accent">구매대행 자세히 보기 →</Link>
        </div>
      </section>

      {/* 서비스 2 — 배송대행 5단계 플로우 */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <p className="text-sm font-semibold text-accent">배송대행</p>
        <h2 className="mt-2 text-3xl font-semibold text-heading">직접 구매한 짐, 창고에서 한국까지 5단계</h2>
        <p className="mt-3 text-secondary max-w-2xl">중국 창고 주소로 보내주시면 입고부터 한국 도착까지 단계별로 알려드립니다. 구매 수수료는 없습니다.</p>
        <ol className="mt-8 grid md:grid-cols-5 gap-4">
          {[
            ["1", "접수", "운송장 번호로 입고 예정 등록"],
            ["2", "창고 입고", "중국 창고 도착 확인"],
            ["3", "입고 사진", "사진 1~2장·외포장 상태 기본 제공"],
            ["4", "출고", "청구중량 기준 국제운임 확정"],
            ["5", "한국 도착", "국내 배송으로 최종 수령"],
          ].map(([n, t, d]) => (
            <li key={n} className="rounded-[16px] bg-surface border border-black/5 p-5">
              <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-accent text-white text-sm font-semibold">{n}</span>
              <h3 className="mt-3 font-semibold text-heading">{t}</h3>
              <p className="mt-1 text-xs text-secondary">{d}</p>
            </li>
          ))}
        </ol>
        <Link href="/services/shipping-agency" className="inline-block mt-8 text-sm font-semibold text-accent">배송대행 자세히 보기 →</Link>
      </section>

      {/* 서비스 3 — 스마트오더 4단계 */}
      <section className="bg-surface border-t border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-accent">스마트오더</p>
            <span className="text-xs font-semibold rounded-full bg-warning-tint text-heading px-3 py-1">준비 중</span>
          </div>
          <h2 className="mt-2 text-3xl font-semibold text-heading">대량 주문은 엑셀 한 장으로</h2>
          <p className="mt-3 text-secondary max-w-2xl">여러 상품을 한 건씩 올릴 필요 없이, 엑셀 업로드로 한 번에 접수하는 기능을 준비하고 있습니다.</p>
          <ol className="mt-8 grid md:grid-cols-4 gap-4">
            {[
              ["1", "엑셀 작성", "양식에 상품·수량 입력"],
              ["2", "업로드", "파일 한 번으로 일괄 접수"],
              ["3", "검토·견적", "항목별 견적 자동 생성"],
              ["4", "일괄 진행", "구매부터 배송까지 한 번에"],
            ].map(([n, t, d]) => (
              <li key={n} className="rounded-[16px] bg-bg p-5">
                <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-accent text-white text-sm font-semibold">{n}</span>
                <h3 className="mt-3 font-semibold text-heading">{t}</h3>
                <p className="mt-1 text-xs text-secondary">{d}</p>
              </li>
            ))}
          </ol>
          <Link href="/services/smart-order" className="inline-block mt-8 text-sm font-semibold text-accent">스마트오더 자세히 보기 →</Link>
        </div>
      </section>

      {/* 서비스 4 — 검품감사 */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <p className="text-sm font-semibold text-accent">검품감사</p>
        <h2 className="mt-2 text-3xl font-semibold text-heading">불량은 한국 도착 전에 걸러냅니다</h2>
        <p className="mt-3 text-secondary max-w-2xl">
          기본 입고 확인은 무료, 수량·외관·하자까지 확인하는 유료 검수는 개당 ¥{RATES.inspectionFeeFenPerUnit / 100}.
          공장 검품·선적 검사 등 심화 검품 서비스는 준비 중입니다.
        </p>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {[
            ["기본 입고 확인 (무료)", "입고 사진 1~2장과 외포장 이상 여부를 모든 건에 기본 제공합니다.", false],
            [`유료 검수 (개당 ¥${RATES.inspectionFeeFenPerUnit / 100})`, "수량 확인, 외관 검사, 하자 여부까지 개봉 검수 후 결과를 남깁니다.", false],
            ["심화 검품·공장 감사", "품질 검품, 공장 실사, 선적 검사 서비스를 준비하고 있습니다.", true],
          ].map(([t, d, soon]) => (
            <div key={t as string} className="rounded-[16px] bg-surface border border-black/5 p-6">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-heading">{t as string}</h3>
                {soon && <span className="text-xs font-semibold rounded-full bg-warning-tint text-heading px-2 py-0.5 shrink-0">준비 중</span>}
              </div>
              <p className="mt-2 text-sm text-secondary">{d as string}</p>
            </div>
          ))}
        </div>
        <Link href="/services/inspection" className="inline-block mt-8 text-sm font-semibold text-accent">검품감사 자세히 보기 →</Link>
      </section>

      {/* 신뢰 배너 */}
      <TrustStats />

      {/* FAQ 아코디언 */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-semibold text-heading text-center">자주 묻는 질문</h2>
        <div className="mt-8 space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="group rounded-[16px] bg-surface border border-black/5 px-6 py-4">
              <summary className="cursor-pointer font-semibold text-heading list-none flex justify-between items-center">
                {f.q}
                <span className="text-muted transition-transform group-open:rotate-45">＋</span>
              </summary>
              <p className="mt-3 text-sm text-secondary">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <SectionCta
        title="지금 가입하고 첫 주문을 접수해 보세요"
        sub="가입은 무료입니다. 주문 접수부터 항목별 견적까지 바로 사용할 수 있습니다."
      />

      <SiteFooter />
    </main>
  );
}
