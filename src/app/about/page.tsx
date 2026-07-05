import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import TrustStats from "@/components/public/trust-stats";
import SectionCta from "@/components/public/section-cta";

export const metadata: Metadata = {
  title: "회사소개 | 물류",
  description: "사업자 셀러를 위한 중국→한국 통합 물류. 투명한 요율과 항목별 견적으로 시작합니다.",
};

const GLANCE = [
  { label: "설립", value: "오픈 전 확정" },
  { label: "팀 규모", value: "오픈 전 확정" },
  { label: "중국 창고", value: "오픈 전 확정" },
  { label: "요율 정책", value: "전면 공개" },
];

const TECH = [
  {
    title: "1688 연동",
    desc: "한국어 검색, 이미지 검색 자리, 주문 연동 흐름으로 상품 찾기부터 견적까지 한 화면에서 처리합니다.",
  },
  {
    title: "실시간 추적",
    desc: "중국 운송장 조회와 입고 예정일 계산을 자동화해 상품 위치를 놓치지 않습니다.",
  },
  {
    title: "AI HS코드 추천",
    desc: "관세율 비교를 위한 HS코드 후보를 추천합니다. 최종 판단은 관세사·세관 기준을 우선합니다.",
  },
  {
    title: "자체 WMS",
    desc: "입고 사진, 재고 위치, 출고 상태를 창고 관리 시스템으로 기록하고 보여드립니다.",
  },
];

const SERVICES = [
  { title: "구매대행", desc: "1688 상품을 대신 구매하고 견적부터 입고까지 처리합니다.", href: "/services/purchase-agency" },
  { title: "배송대행", desc: "직접 구매한 상품을 중국 창고에서 모아 한국으로 배송합니다.", href: "/services/shipping-agency" },
  { title: "스마트오더", desc: "플랫폼 주문 Excel 업로드로 대량 구매를 자동화합니다.", href: "/services/smart-order" },
  { title: "검품감사", desc: "공장 출장 검품으로 선적 전 품질을 확인합니다.", href: "/services/inspection" },
];

const EDGES = [
  {
    title: "요율 전면 공개",
    desc: "수수료·운임·검수비·부가서비스 단가를 공개 요율표로 확인할 수 있습니다. 확인할 수 없는 금액은 청구하지 않습니다.",
  },
  {
    title: "항목별 투명 견적",
    desc: "상품가·수수료·검수비·예상 운임을 항목별로 나눠 보여드립니다. 확정 전 금액은 참고용임을 함께 표기합니다.",
  },
  {
    title: "입고 사진 기본 제공",
    desc: "중국 창고 도착 시 입고 사진 1~2장과 외포장 이상 여부를 무료로 안내합니다.",
  },
  {
    title: "책임 경계 명시",
    desc: "무엇이 포함되고 무엇이 별도인지, 통관·검수 책임 범위를 계약 전에 문서로 명시합니다.",
  },
];

const AUTOMATION_FLOW: [string, string][] = [
  ["검색·접수", "1688 검색, 상품 링크, 주문 엑셀을 공개 진입 화면에서 접수 흐름으로 연결합니다."],
  ["입고·상태", "입고 사진, 외포장 확인, 검수 신청 상태를 고객이 단계별로 볼 수 있게 준비합니다."],
  ["견적·출고", "상품가·수수료·검수비·예상 운임을 항목별로 나눠 보여주고 출고로 이어집니다."],
];

const COMPARISON_ROWS: [string, string, string][] = [
  ["비용 안내", "총액 위주 안내", "요율과 항목별 견적 공개"],
  ["진행 확인", "문의 후 확인", "대시보드 단계별 확인"],
  ["입고 확인", "요청 시 확인", "입고 사진과 외포장 상태 기본 제공"],
  ["검수 경계", "무료·유료 범위가 모호함", "기본 확인과 유료 검수를 분리 표시"],
];

export default function AboutPage() {
  return (
    <main className="bg-bg text-body">
      <SiteHeader />

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-12">
        <p className="text-sm font-semibold text-accent">회사소개</p>
        <h1 className="mt-2 text-4xl md:text-6xl font-semibold text-heading leading-tight">
          한-중 무역의<br />
          <span className="text-accent">든든한 파트너</span>
        </h1>
        <p className="mt-6 text-lg text-secondary max-w-2xl">
          사업자 셀러가 중국 상품 소싱과 물류를 안심하고 맡길 수 있도록 공개 요율, 항목별 견적,
          입고 확인, 배송·통관 흐름을 한 화면에서 확인하는 기준판을 만들고 있습니다.
          실제 회사 실주소·연락처·회사 등록 정보는 정식 오픈 전 확정 자리표시로만 둡니다.
        </p>
        <div className="mt-8 rounded-[16px] bg-surface border border-black/5 p-8">
          <p className="text-xs font-semibold text-muted">이미지 자리표시</p>
          <p className="mt-3 text-2xl font-semibold text-heading">회사·창고·운영 이미지 영역</p>
          <p className="mt-2 text-sm text-secondary">원본의 시각 자료 위치만 대응하며 실제 로고·사진·주소 정보는 넣지 않습니다.</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold text-heading">한눈에 보기</h2>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {GLANCE.map((g) => (
            <div key={g.label} className="rounded-[16px] bg-surface border border-black/5 p-6 text-center">
              <p className="text-xs text-muted">{g.label}</p>
              <p className="mt-2 font-semibold text-heading">{g.value}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">※ 회사 정보는 정식 오픈 시 확정해 공개합니다.</p>
      </section>

      <section className="bg-surface border-y border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold text-heading">회사 소개</h2>
          <p className="mt-4 text-secondary max-w-3xl leading-relaxed">
            구매대행, 배송대행, 스마트오더, 검품감사를 각각 떨어진 업무가 아니라 하나의 수입 업무 흐름으로 연결합니다.
            고객은 상품을 찾고, 구매를 맡기고, 입고 상태를 확인하고, 출고 비용을 비교한 뒤 한국 수령까지 이어지는 일을 한 곳에서 끝냅니다.
          </p>
          <p className="mt-4 text-secondary max-w-3xl leading-relaxed">
            기준판에서는 원본 공개 화면의 구성과 정보 밀도를 비교할 수 있게 만들고, 우리 회사용 실제 정보와 정책은 정식 운영 전 별도 확정합니다.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold text-heading">기술력</h2>
        <p className="mt-1 text-sm text-secondary">사람 손에 의존하던 물류 과정을 시스템으로 만들고 있습니다.</p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {TECH.map((t) => (
            <div key={t.title} className="rounded-[16px] bg-surface border border-black/5 p-6">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-heading">{t.title}</p>
                <span className="text-[11px] font-semibold text-secondary bg-surface-alt border border-black/10 rounded-[18px] px-2 py-0.5">준비 중</span>
              </div>
              <p className="mt-2 text-sm text-secondary">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface-alt border-y border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold text-heading">자동화 시스템</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {AUTOMATION_FLOW.map(([title, desc], index) => (
              <div key={title} className="rounded-[16px] bg-surface border border-black/5 p-6">
                <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-accent text-white text-sm font-semibold">{index + 1}</span>
                <h3 className="mt-3 font-semibold text-heading">{title}</h3>
                <p className="mt-2 text-sm text-secondary">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold text-heading">서비스</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {SERVICES.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              className="rounded-[16px] bg-surface border border-black/5 p-6 hover:border-accent/40 transition-colors"
            >
              <p className="font-semibold text-heading">{s.title}</p>
              <p className="mt-2 text-sm text-secondary">{s.desc}</p>
              <p className="mt-4 text-sm font-medium text-accent">자세히 보기 →</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-surface border-y border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold text-heading">비교표</h2>
          <div className="mt-8 overflow-x-auto rounded-[16px] bg-bg shadow-[0_7px_30px_rgba(90,114,123,0.11)]">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-black/5 text-left">
                  <th className="px-5 py-4 font-semibold text-heading">구분</th>
                  <th className="px-5 py-4 font-semibold text-secondary">일반 방식</th>
                  <th className="px-5 py-4 font-semibold text-accent">우리 기준판</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map(([label, before, after]) => (
                  <tr key={label} className="border-b border-black/5 last:border-0">
                    <td className="px-5 py-4 font-semibold text-heading">{label}</td>
                    <td className="px-5 py-4 text-secondary">{before}</td>
                    <td className="px-5 py-4 text-heading font-medium">{after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold text-heading">우리가 다르게 하는 것</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {EDGES.map((e) => (
            <div key={e.title} className="rounded-[16px] bg-surface-alt border border-black/5 p-6">
              <p className="font-semibold text-heading">✓ {e.title}</p>
              <p className="mt-2 text-sm text-secondary">{e.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <TrustStats />

      {/* 연락처 */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold text-heading">회사 정보</h2>
        <div className="mt-6 rounded-[16px] bg-surface border border-black/5 p-6 text-sm text-secondary space-y-1">
          <p>상호·대표자·회사 등록 정보: 오픈 전 확정</p>
          <p>실주소·연락처·문의 채널: 오픈 전 확정</p>
          <p className="text-muted">정식 오픈 시 확정된 회사 정보를 이 페이지와 푸터에 공개합니다. 지금은 실제 정보 반입 없이 자리표시만 둡니다.</p>
        </div>
      </section>

      <SectionCta
        title="오픈 소식을 가장 먼저 받아보세요."
        sub="지금 가입하면 정식 오픈과 요율 확정 소식을 먼저 알려드립니다."
      />
      <SiteFooter />
    </main>
  );
}
