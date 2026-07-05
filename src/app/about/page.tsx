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
    desc: "한국어 검색과 주문 연동으로 상품 찾기부터 견적까지 한 화면에서 처리합니다.",
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

export default function AboutPage() {
  return (
    <main className="bg-bg text-body">
      <SiteHeader />

      {/* 히어로 */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-12">
        <p className="text-sm font-semibold text-accent">회사소개</p>
        <h1 className="mt-2 text-4xl md:text-6xl font-semibold text-heading leading-tight">
          중국 소싱 물류를<br />
          <span className="text-accent">투명하게</span> 만드는 회사
        </h1>
        <p className="mt-6 text-lg text-secondary max-w-2xl">
          사업자 셀러가 상품에만 집중할 수 있도록, 주문 접수부터 입고 확인·항목별 견적·국제 배송까지
          숨은 비용 없이 처리하는 통합 물류 서비스를 만들고 있습니다.
        </p>
      </section>

      {/* 한눈에 보기 */}
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

      {/* 기술력 4카드 */}
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

      {/* 서비스 4카드 */}
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

      {/* 경쟁 우위 */}
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
        <h2 className="text-2xl font-semibold text-heading">연락처</h2>
        <div className="mt-6 rounded-[16px] bg-surface border border-black/5 p-6 text-sm text-secondary space-y-1">
          <p>상호·대표자·사업자등록번호: 오픈 전 확정</p>
          <p>주소·전화·이메일: 오픈 전 확정</p>
          <p className="text-muted">정식 오픈 시 사업자 정보를 이 페이지와 푸터에 공개합니다. 문의는 가입 후 준비되는 채팅 상담으로 받을 예정입니다.</p>
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
