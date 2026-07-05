import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import ComingSoon from "@/components/public/coming-soon";

export const metadata: Metadata = {
  title: "통관 진행 조회 | 물류",
  description: "화물관리번호 또는 BL 번호로 세관 통관 진행 상태를 단계별로 조회하는 도구를 준비하고 있습니다.",
};

const TIMELINE = [
  ["도착", "화물이 한국 도착지에 반입됩니다."],
  ["신고", "수입신고와 서류 확인이 진행됩니다."],
  ["심사", "품목, 요건, 세액 확인이 이뤄집니다."],
  ["수리", "통관이 끝나고 국내 배송으로 넘어갑니다."],
] as const;

const DELAY_GUIDE = [
  "화물관리번호 또는 BL 번호가 아직 반영되지 않았을 수 있습니다.",
  "세관 요건, 서류 보완, 검사 지정으로 시간이 늘어날 수 있습니다.",
  "정확한 상태는 세관 기준이 우선이며, 로컬 기준판에서는 실제 조회하지 않습니다.",
] as const;

export default function CustomsTrackPage() {
  return (
    <main className="bg-bg text-body">
      <SiteHeader />

      <section className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-sm text-secondary">
          <Link href="/calculators" className="hover:text-heading">계산기</Link> / 통관 진행 조회
        </p>
        <h1 className="mt-2 text-3xl md:text-4xl font-semibold text-heading">통관 진행 조회</h1>
        <p className="mt-3 text-secondary">
          화물이 한국에 도착한 뒤 지금 통관 어느 단계인지 궁금할 때가 많습니다.
          반입·신고·수리 중 어디에 있는지 알면 국내 배송 일정과 판매 준비를 미리 계획할 수 있습니다.
          화물관리번호 또는 BL 번호를 입력하면 세관 통관 진행 상태를 단계별로 조회하는 도구를 준비하고 있습니다.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-secondary">
          <li>· 화물관리번호 · BL 번호로 조회</li>
          <li>· 반입 → 신고 → 수리 등 진행 단계 표시</li>
          <li>· 지연 시 확인할 사항 안내</li>
        </ul>
        <p className="mt-4 text-xs text-muted">
          조회 결과는 참고용 안내이며, 정확한 통관 상태는 세관 기준이 우선합니다.
        </p>

        <div className="mt-8 rounded-[16px] bg-surface border border-black/5 p-6">
          <label className="text-sm">
            <span className="font-semibold text-heading">화물관리번호 또는 BL 번호</span>
            <input
              type="text"
              disabled
              placeholder="번호 입력"
              className="mt-2 w-full rounded-[12px] border border-black/10 bg-bg px-4 py-3 text-sm text-body outline-none"
            />
          </label>
          <button type="button" disabled className="mt-4 w-full rounded-[12px] bg-accent px-4 py-3 text-sm font-semibold text-white opacity-60 cursor-not-allowed">
            통관 진행 조회
          </button>
          <p className="mt-3 text-xs text-muted">실조회 아님: 세관 통관 API를 호출하지 않습니다.</p>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-heading">통관 단계</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            {TIMELINE.map(([title, desc], index) => (
              <div key={title} className="rounded-[16px] bg-surface border border-black/5 p-5">
                <p className="text-sm font-bold text-accent">{index + 1}단계</p>
                <p className="mt-2 font-semibold text-heading">{title}</p>
                <p className="mt-2 text-sm text-secondary">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-[16px] bg-surface-alt border border-black/5 p-6">
          <h2 className="text-2xl font-semibold text-heading">지연될 때 확인할 것</h2>
          <ul className="mt-4 space-y-2 text-sm text-secondary">
            {DELAY_GUIDE.map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link href="/calculators/customs-req" className="rounded-[12px] bg-white border border-black/10 px-4 py-3 font-semibold text-heading hover:border-accent/40">
              세관 요건 확인
            </Link>
            <Link href="/tracking" className="rounded-[12px] bg-white border border-black/10 px-4 py-3 font-semibold text-heading hover:border-accent/40">
              배송조회로 이동
            </Link>
          </div>
        </div>

        <div className="mt-10">
          <ComingSoon feature="통관 진행 조회" />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
