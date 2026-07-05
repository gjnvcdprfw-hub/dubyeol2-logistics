import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import SectionCta from "@/components/public/section-cta";

export const metadata: Metadata = {
  title: "이용 가이드 | 물류",
  description: "구매대행·배송대행 이용 흐름과 요금·부가서비스 가이드를 안내합니다.",
};

const FLOWS = [
  {
    title: "구매대행 이용 흐름",
    desc: "1688 상품을 찾아 주문부터 국내 수령까지 대신 처리합니다.",
    steps: [
      { title: "상품 찾기·견적 요청", desc: "1688에서 상품을 찾아 수량·옵션과 함께 견적을 요청합니다." },
      { title: "견적 확인·결제", desc: "상품가·수수료·부가서비스가 항목별로 표시된 견적을 확인하고 결제합니다." },
      { title: "구매·창고 입고", desc: "저희가 대신 구매하고, 중국 창고 도착 시 입고 사진을 보내드립니다." },
      { title: "국제 배송·수령", desc: "운임 확정 후 출고하고, 한국 주소로 배송됩니다." },
    ],
  },
  {
    title: "배송대행 이용 흐름",
    desc: "직접 구매한 상품을 중국 창고로 보내면, 모아서 한국으로 배송합니다.",
    steps: [
      { title: "창고 주소 확인", desc: "가입 후 발급되는 전용 입고 주소를 확인합니다." },
      { title: "상품 발송·입고 등록", desc: "판매자가 창고로 보내도록 하고, 주문 정보를 입고 신청에 등록합니다." },
      { title: "입고 확인", desc: "창고 도착 시 입고 사진 1~2장과 외포장 이상 여부를 알려드립니다." },
      { title: "출고·국내 수령", desc: "묶음 배송 여부를 선택하면 운임 확정 후 한국으로 출고됩니다." },
    ],
  },
];

const GUIDE_CARDS = [
  { title: "구매대행 가이드", desc: "견적 요청부터 결제·구매 진행까지 단계별 안내", href: null },
  { title: "배송대행 가이드", desc: "창고 주소 사용법·입고 등록·출고 신청 안내", href: null },
  { title: "내 상품 가이드", desc: "견적 이력 관리와 재구매 방법 안내", href: null },
  { title: "플랫폼 사용법", desc: "화면별 사용 방법과 자주 겪는 상황 안내", href: null },
  { title: "부가서비스 안내", desc: "원산지·판매표기·포장·검수 단가와 신청 방법", href: "/guide/services" },
  { title: "요금 안내", desc: "배송비·보관료·부가서비스 공개 요율표", href: "/guide/pricing" },
];

export default function GuideHubPage() {
  return (
    <main className="bg-bg text-body">
      <SiteHeader />

      {/* 히어로 */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-8">
        <p className="text-sm font-semibold text-accent">이용 가이드</p>
        <h1 className="mt-2 text-4xl md:text-5xl font-semibold text-heading">이용 가이드</h1>
        <p className="mt-4 text-secondary max-w-2xl">
          처음이어도 괜찮습니다. 주문부터 수령까지의 흐름과 요금을 한눈에 확인하세요.
        </p>
      </section>

      {/* 이용 흐름 (구매/배송 4단계) */}
      <section className="max-w-6xl mx-auto px-6 py-8 space-y-10">
        {FLOWS.map((flow) => (
          <div key={flow.title}>
            <h2 className="text-2xl font-semibold text-heading">{flow.title}</h2>
            <p className="mt-1 text-sm text-secondary">{flow.desc}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-4">
              {flow.steps.map((s, i) => (
                <div key={s.title} className="rounded-[16px] bg-surface border border-black/5 p-5">
                  <p className="text-accent font-bold">{i + 1}단계</p>
                  <p className="mt-2 font-semibold text-heading text-sm">{s.title}</p>
                  <p className="mt-2 text-xs text-secondary">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* 가이드 카드 6종 */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold text-heading">가이드 선택</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {GUIDE_CARDS.map((c) =>
            c.href ? (
              <Link
                key={c.title}
                href={c.href}
                className="rounded-[16px] bg-surface border border-black/5 p-6 hover:border-accent/40 transition-colors"
              >
                <p className="font-semibold text-heading">{c.title}</p>
                <p className="mt-2 text-sm text-secondary">{c.desc}</p>
                <p className="mt-4 text-sm font-medium text-accent">보러 가기 →</p>
              </Link>
            ) : (
              <div key={c.title} className="rounded-[16px] bg-surface-alt border border-black/5 p-6">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-heading">{c.title}</p>
                  <span className="text-[11px] font-semibold text-secondary bg-white border border-black/10 rounded-[18px] px-2 py-0.5">준비 중</span>
                </div>
                <p className="mt-2 text-sm text-secondary">{c.desc}</p>
                <p className="mt-4 text-sm text-muted">정식 오픈 시 열립니다</p>
              </div>
            )
          )}
        </div>
      </section>

      {/* 빠른 링크 */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="rounded-[16px] bg-surface border border-black/5 p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-heading">예상 비용이 궁금하신가요?</p>
            <p className="mt-1 text-sm text-secondary">부피중량·배송비를 계산기에서 바로 확인해 보세요.</p>
          </div>
          <div className="flex gap-3 text-sm">
            <Link href="/calculators" className="bg-accent text-white font-semibold rounded-[12px] px-5 py-3">계산기 바로가기</Link>
            <Link href="/guide/pricing" className="text-heading font-semibold px-3 py-3">요금 안내 →</Link>
          </div>
        </div>
      </section>

      <SectionCta
        title="가이드대로 따라오시면 됩니다."
        sub="가입 후 첫 주문부터 단계별로 안내해 드립니다."
      />
      <SiteFooter />
    </main>
  );
}
