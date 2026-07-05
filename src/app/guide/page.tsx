import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import SectionCta from "@/components/public/section-cta";

export const metadata: Metadata = {
  title: "이용 가이드 | 물류",
  description: "구매대행, 배송대행, 내상품, 플랫폼 사용법, 부가서비스, 무역지식, 품목별 수입 가이드를 한곳에서 안내합니다.",
};

const QUICK_START = [
  { title: "상품을 찾는 고객", desc: "1688 상품 검색 후 구매대행 견적을 요청합니다.", href: "/search" },
  { title: "이미 구매한 고객", desc: "중국 창고 입고와 국제배송 흐름을 확인합니다.", href: "/services/shipping-agency" },
  { title: "비용이 궁금한 고객", desc: "요금표와 계산기로 예상 비용을 먼저 봅니다.", href: "/guide/pricing" },
] as const;

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
  { title: "구매대행 가이드", desc: "상품 검색, 견적 요청, 결제, 구매 진행까지 단계별 안내", href: "/services/purchase-agency", ready: true },
  { title: "배송대행 가이드", desc: "창고 주소 사용법, 입고 등록, 묶음 출고, 배송조회 안내", href: "/services/shipping-agency", ready: true },
  { title: "내 상품 가이드", desc: "견적 이력, 장바구니, 재구매, 상품 라이브러리 사용법", href: null, ready: false },
  { title: "플랫폼 사용법", desc: "회원가입, 주문 접수, 대시보드 확인, 알림 확인 방법", href: null, ready: false },
  { title: "부가서비스 안내", desc: "원산지·판매표기·포장·검수 단가와 신청 방법", href: "/guide/services", ready: true },
  { title: "요금 안내", desc: "배송비·보관료·부가서비스 공개 요율표", href: "/guide/pricing", ready: true },
  { title: "무역지식", desc: "HS코드, FTA, 관세, 통관 요건을 이해하는 기본 안내", href: "/calculators/hs-code", ready: false },
  { title: "품목별 수입 가이드", desc: "전자제품, 식품, 섬유 등 품목별 확인 사항", href: null, ready: false },
  { title: "배송추적 FAQ", desc: "중국 운송장, 한국 배송, 통관 지연 상황별 확인 방법", href: "/tracking", ready: true },
] as const;

const FAQ = [
  {
    q: "처음이면 무엇부터 보면 되나요?",
    a: "상품을 아직 고르지 않았다면 1688 검색, 이미 구매했다면 배송대행, 비용이 먼저 궁금하면 요금 안내와 계산기를 먼저 보시면 됩니다.",
  },
  {
    q: "계산기 결과가 결제 금액인가요?",
    a: "아닙니다. 계산기는 참고용이고, 실제 금액은 입고 후 실측 중량·치수와 선택한 부가서비스를 반영한 항목별 견적으로 확정됩니다.",
  },
  {
    q: "준비 중인 가이드는 언제 쓰나요?",
    a: "비공개 기준판에서는 원본과 같은 진입 구조만 먼저 닫고, 실제 운영 문구와 정책은 정식 오픈 전 확정합니다.",
  },
] as const;

const CALCULATOR_LINKS = [
  { title: "수입 비용 계산기", href: "/calculators/import-cost", desc: "상품가, 운임, 세금을 한 번에 보는 도구입니다. 준비 중입니다." },
  { title: "운임 계산기", href: "/calculators/shipping-cost", desc: "해운·항공 예상 운임을 공개 요율로 비교합니다." },
  { title: "HS코드 조회", href: "/calculators/hs-code", desc: "품목 분류와 관세율 확인 도구입니다. 준비 중입니다." },
] as const;

export default function GuideHubPage() {
  return (
    <main className="bg-bg text-body">
      <SiteHeader />

      {/* 히어로 */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-8">
        <p className="text-sm font-semibold text-accent">가이드 허브</p>
        <h1 className="sr-only">이용 가이드</h1>
        <div className="rounded-[16px] bg-surface border border-black/5 p-6 md:p-8">
          <p className="text-3xl md:text-5xl font-semibold text-heading">서비스 안내</p>
          <p className="mt-4 text-secondary max-w-3xl">
            구매대행, 배송대행, 내상품, 플랫폼 사용법, 부가서비스, 무역지식, 품목별 수입 가이드, 배송추적 FAQ까지
            처음 보는 고객이 다음 행동을 고를 수 있게 묶은 기준판입니다.
          </p>
        </div>
      </section>

      {/* 빠른 시작 */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold text-heading">빠른 시작</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {QUICK_START.map((item) => (
            <Link key={item.title} href={item.href} className="rounded-[16px] bg-surface border border-black/5 p-6 hover:border-accent/40 transition-colors">
              <p className="font-semibold text-heading">{item.title}</p>
              <p className="mt-2 text-sm text-secondary">{item.desc}</p>
              <p className="mt-4 text-sm font-semibold text-accent">바로가기 →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 서비스 개요 */}
      <section className="bg-surface border-y border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <h2 className="text-2xl font-semibold text-heading">서비스 개요</h2>
          <p className="mt-3 text-sm text-secondary max-w-3xl">
            공개 가이드는 고객이 맡길 상품의 현재 위치와 다음 결정을 이해하도록 돕는 역할입니다.
            실제 주문, 결제, 파일 업로드, 외부 조회가 필요한 기능은 로그인 후 화면 또는 준비 중 담장으로 분리합니다.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {["상품 찾기", "입고 확인", "비용 확인", "배송 추적"].map((title, index) => (
              <div key={title} className="rounded-[16px] bg-bg border border-black/5 p-5">
                <p className="text-sm font-bold text-accent">{index + 1}단계</p>
                <p className="mt-2 font-semibold text-heading">{title}</p>
                <p className="mt-2 text-sm text-secondary">
                  {index === 0 && "1688 검색 또는 직접 구매 상품으로 시작합니다."}
                  {index === 1 && "창고 입고 사진과 외포장 이상 여부를 확인합니다."}
                  {index === 2 && "상품가, 수수료, 운임, 부가서비스를 항목별로 봅니다."}
                  {index === 3 && "출고 후 국제 운송과 통관 흐름을 확인합니다."}
                </p>
              </div>
            ))}
          </div>
        </div>
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

      {/* 가이드 트리 */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold text-heading">가이드 카테고리</h2>
        <p className="mt-2 text-sm text-secondary">
          세부 미구현 페이지는 준비 중으로 표시합니다. 비공개 기준판 단계에서는 진입 구조와 설명 밀도를 먼저 맞춥니다.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {GUIDE_CARDS.map((c) =>
            c.href ? (
              <Link
                key={c.title}
                href={c.href}
                className="rounded-[16px] bg-surface border border-black/5 p-6 hover:border-accent/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-heading">{c.title}</p>
                  {c.ready === false && <span className="text-[11px] font-semibold text-muted bg-black/5 rounded-[18px] px-2 py-0.5">준비 중</span>}
                </div>
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
                <p className="mt-4 text-sm text-muted">정식 오픈 전 세부 문서를 확정합니다.</p>
              </div>
            )
          )}
        </div>
      </section>

      {/* FAQ + 계산기 바로가기 */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold text-heading">자주 묻는 질문 TOP</h2>
            <div className="mt-6 space-y-4">
              {FAQ.map((f) => (
                <div key={f.q} className="rounded-[16px] bg-surface border border-black/5 p-6">
                  <p className="font-semibold text-heading">Q. {f.q}</p>
                  <p className="mt-2 text-sm text-secondary">A. {f.a}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-heading">계산기 바로가기</h2>
            <div className="mt-6 space-y-4">
              {CALCULATOR_LINKS.map((item) => (
                <Link key={item.href} href={item.href} className="block rounded-[16px] bg-surface border border-black/5 p-6 hover:border-accent/40 transition-colors">
                  <p className="font-semibold text-heading">{item.title}</p>
                  <p className="mt-2 text-sm text-secondary">{item.desc}</p>
                  <p className="mt-4 text-sm font-semibold text-accent">열기 →</p>
                </Link>
              ))}
            </div>
          </div>
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
