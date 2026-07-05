import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import ComingSoon from "@/components/public/coming-soon";

export const metadata: Metadata = {
  title: "세관 요건 확인 | 물류",
  description: "품목별 수입 요건과 KC 인증, 검역 등 필요한 절차를 주문 전에 미리 확인하는 도구를 준비하고 있습니다.",
};

const REQUIREMENTS = [
  ["KC 인증", "전자제품, 어린이 제품 등 안전 인증 대상 여부를 확인합니다."],
  ["검역", "식품, 식물, 동물성 원료 등 검역 대상 여부를 확인합니다."],
  ["원산지 표기", "국내 판매 전 원산지 표시 방식이 필요한지 봅니다."],
  ["수입 제한", "반입 금지 또는 별도 허가 품목인지 확인합니다."],
] as const;

const FLOW = [
  "품목명 또는 HS코드 입력",
  "요건 후보 확인",
  "필요 서류와 통관 위험 확인",
  "관세사·세관 최종 판단으로 확정",
] as const;

export default function CustomsReqPage() {
  return (
    <main className="bg-bg text-body">
      <SiteHeader />

      <section className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-sm text-secondary">
          <Link href="/calculators" className="hover:text-heading">계산기</Link> / 세관 요건 확인
        </p>
        <h1 className="mt-2 text-3xl md:text-4xl font-semibold text-heading">세관 요건 확인</h1>
        <p className="mt-3 text-secondary">
          전자제품의 KC 인증, 식품의 검역처럼 품목에 따라 수입 전 갖춰야 하는 요건이 다릅니다.
          요건을 모르고 들여오면 통관이 막히거나 반송·폐기로 이어질 수 있어, 요건 확인은 주문 전에 끝내는 것이 안전합니다.
          품목별 수입 요건을 미리 확인하는 도구를 준비하고 있습니다.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-secondary">
          <li>· 품목·HS코드로 수입 요건 대상 여부 확인</li>
          <li>· KC 인증, 검역 등 필요한 절차 안내</li>
          <li>· 요건 미충족 시 통관 위험 사전 안내</li>
        </ul>
        <p className="mt-4 text-xs text-muted">
          요건 확인은 참고용 안내이며, 최종 판단은 관세사·세관 기준이 우선합니다.
        </p>

        <div className="mt-8 rounded-[16px] bg-surface border border-black/5 p-6">
          <label className="text-sm">
            <span className="font-semibold text-heading">품목명 또는 HS코드</span>
            <input
              type="text"
              disabled
              placeholder="예: 전자기기, 식품 용기, 섬유 제품"
              className="mt-2 w-full rounded-[12px] border border-black/10 bg-bg px-4 py-3 text-sm text-body outline-none"
            />
          </label>
          <button type="button" disabled className="mt-4 w-full rounded-[12px] bg-accent px-4 py-3 text-sm font-semibold text-white opacity-60 cursor-not-allowed">
            세관 요건 확인
          </button>
          <p className="mt-3 text-xs text-muted">실조회 아님: 세관·인증기관 API를 호출하지 않습니다.</p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {REQUIREMENTS.map(([title, desc]) => (
            <div key={title} className="rounded-[16px] bg-surface border border-black/5 p-5">
              <p className="font-semibold text-heading">{title}</p>
              <p className="mt-2 text-sm text-secondary">{desc}</p>
              <p className="mt-4 text-sm text-muted">준비 중</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-[16px] bg-surface-alt border border-black/5 p-6">
          <h2 className="text-2xl font-semibold text-heading">확인 흐름</h2>
          <ol className="mt-4 space-y-2 text-sm text-secondary">
            {FLOW.map((item, index) => (
              <li key={item}>{index + 1}. {item}</li>
            ))}
          </ol>
          <Link href="/calculators/hs-code" className="mt-5 inline-block text-sm font-semibold text-accent">
            HS코드 조회로 이동 →
          </Link>
        </div>

        <div className="mt-10">
          <ComingSoon feature="세관 요건 확인" />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
