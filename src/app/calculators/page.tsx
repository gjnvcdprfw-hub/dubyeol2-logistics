import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import SectionCta from "@/components/public/section-cta";
import { RATES } from "@/lib/rates";

export const metadata: Metadata = {
  title: "무역 계산기 | 물류",
  description: "CBM·부피중량·배송비 계산기로 수입 원가를 미리 확인하세요. HS코드 조회, 수입비용 계산 등 통관 도구도 준비 중입니다.",
};

const FAQ = [
  {
    q: "계산 결과를 그대로 결제 금액으로 봐도 되나요?",
    a: "아니요. 모든 계산기는 참고용 안내이며 최종 금액이 아닙니다. 확정 금액은 접수 후 항목별 견적으로 안내드립니다.",
  },
  {
    q: "배송비는 무게로 계산하나요, 부피로 계산하나요?",
    a: `실중량과 부피중량(cm³ ÷ ${RATES.volumeDivisor.toLocaleString("ko-KR")}) 중 큰 값을 청구중량으로 계산합니다. 부피중량 계산기에서 어느 쪽이 적용되는지 바로 확인할 수 있습니다.`,
  },
  {
    q: "관세·부가세도 계산할 수 있나요?",
    a: "HS코드 조회·수입비용 계산기는 준비 중입니다. 정식 오픈 시 관·부가세 예상 계산까지 제공할 예정입니다.",
  },
];

const STEPS = [
  ["1", "화물 크기 파악", "CBM 계산기와 부피중량 계산기로 내 화물의 부피와 청구 기준 무게를 확인합니다."],
  ["2", "운임 비교", "배송비 계산기로 해운·항공 예상 운임을 나란히 비교해 유리한 방식을 고릅니다."],
  ["3", "세금 확인", "HS코드 조회·수입비용 계산기로 관·부가세를 확인합니다. (준비 중)"],
  ["4", "통관 확인", "세관 요건 확인과 통관 진행 조회로 수입 가능 여부와 진행 상황을 확인합니다. (준비 중)"],
] as const;

type Tool = { href: string; name: string; desc: string; ready: boolean };

const GROUPS: { title: string; tools: Tool[] }[] = [
  {
    title: "배송 계산",
    tools: [
      { href: "/calculators/cbm", name: "CBM 계산기", desc: "박스 치수와 수량으로 화물 전체 부피(CBM)를 계산합니다.", ready: true },
      { href: "/calculators/volume-weight", name: "부피중량 계산기", desc: "부피중량과 실중량을 비교해 청구중량을 확인합니다.", ready: true },
      { href: "/calculators/shipping-cost", name: "배송비 계산기", desc: "공개 요율 기준 해운·항공 예상 운임을 비교합니다.", ready: true },
    ],
  },
  {
    title: "HS코드·관세",
    tools: [
      { href: "/calculators/hs-code", name: "HS코드 조회", desc: "상품에 맞는 HS코드와 기본 관세율을 찾아봅니다.", ready: false },
      { href: "/calculators/fta", name: "FTA 관세율 비교", desc: "기본세율·WTO·한중 FTA 세율을 비교합니다.", ready: false },
    ],
  },
  {
    title: "수입비용",
    tools: [
      { href: "/calculators/import-cost", name: "수입비용 계산기", desc: "상품가부터 관·부가세까지 총 수입비용을 추정합니다.", ready: false },
      { href: "/calculators/exchange", name: "환율 계산기", desc: "USD·CNY·KRW 금액을 서로 환산합니다.", ready: false },
    ],
  },
  {
    title: "통관 조회",
    tools: [
      { href: "/calculators/customs-req", name: "세관 요건 확인", desc: "KC 인증 등 수입 요건 대상 여부를 확인합니다.", ready: false },
      { href: "/calculators/customs-track", name: "통관 진행 조회", desc: "화물관리번호·BL로 통관 진행 상태를 조회합니다.", ready: false },
    ],
  },
];

const DETAILS: { name: string; body: string; href: string; ready: boolean }[] = [
  {
    name: "CBM 계산기",
    href: "/calculators/cbm",
    ready: true,
    body: "가로×세로×높이(cm)×수량 ÷ 1,000,000으로 화물 전체 부피를 계산합니다. 해운 견적과 컨테이너 적재 계획의 출발점입니다.",
  },
  {
    name: "부피중량 계산기",
    href: "/calculators/volume-weight",
    ready: true,
    body: `치수 기준 부피중량(cm³ ÷ ${RATES.volumeDivisor.toLocaleString("ko-KR")})과 실중량을 비교해, 국제운임 청구 기준이 되는 청구중량이 어느 쪽인지 알려줍니다.`,
  },
  {
    name: "배송비 계산기",
    href: "/calculators/shipping-cost",
    ready: true,
    body: "무게와 치수를 입력하면 공개 요율 기준으로 해운·항공 예상 운임을 위안화·원화로 나란히 비교합니다. 요율은 요금 안내 페이지에 공개되어 있습니다.",
  },
  {
    name: "HS코드 조회",
    href: "/calculators/hs-code",
    ready: false,
    body: "상품명으로 HS코드 후보와 기본 관세율을 조회하는 도구입니다. 최종 판단은 관세사·세관 기준이 우선합니다.",
  },
  {
    name: "FTA 관세율 비교",
    href: "/calculators/fta",
    ready: false,
    body: "같은 HS코드에 대해 기본세율·WTO 협정세율·한중 FTA 세율을 비교해 가장 유리한 세율을 확인하는 도구입니다.",
  },
  {
    name: "수입비용 계산기",
    href: "/calculators/import-cost",
    ready: false,
    body: "상품가·운임·관세·부가세를 합산해 통관까지의 총 수입비용을 추정하는 도구입니다.",
  },
  {
    name: "환율 계산기",
    href: "/calculators/exchange",
    ready: false,
    body: "USD·CNY·KRW 세 통화 금액을 서로 환산하는 도구입니다. 실제 정산은 결제일 환율 기준입니다.",
  },
  {
    name: "세관 요건 확인",
    href: "/calculators/customs-req",
    ready: false,
    body: "KC 인증, 식품 검역 등 품목별 수입 요건 대상 여부를 미리 확인하는 도구입니다.",
  },
  {
    name: "통관 진행 조회",
    href: "/calculators/customs-track",
    ready: false,
    body: "화물관리번호 또는 BL 번호로 세관 통관 진행 단계를 조회하는 도구입니다.",
  },
];

function ReadyBadge({ ready }: { ready: boolean }) {
  return ready ? (
    <span className="text-xs font-semibold text-accent bg-accent/10 rounded-full px-2 py-0.5">바로 사용</span>
  ) : (
    <span className="text-xs font-semibold text-muted bg-black/5 rounded-full px-2 py-0.5">준비 중</span>
  );
}

export default function CalculatorsHub() {
  return (
    <main className="bg-bg text-body">
      <SiteHeader />

      {/* 히어로 */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h1 className="text-4xl md:text-5xl font-semibold text-heading">무역 계산기</h1>
        <p className="mt-4 text-lg text-secondary max-w-2xl">
          부피 계산부터 운임 비교, 관세·통관 확인까지. 중국 수입에 필요한 계산을 한곳에서 해결하세요.
          계산에 쓰이는 요율은 요금 안내에 전면 공개된 값과 동일하며, 회원가입 없이 누구나 사용할 수 있습니다.
          모든 결과는 참고용 안내이며 최종 금액이 아닙니다.
        </p>
      </section>

      {/* FAQ 3카드 */}
      <section className="bg-surface border-y border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-14 grid gap-6 md:grid-cols-3">
          {FAQ.map((f) => (
            <div key={f.q} className="rounded-[16px] bg-bg p-6">
              <p className="font-semibold text-heading">{f.q}</p>
              <p className="mt-2 text-sm text-secondary">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 이 순서로 시작 4단계 */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-semibold text-heading">이 순서로 시작하세요</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          {STEPS.map(([n, t, d]) => (
            <div key={n} className="rounded-[16px] bg-surface border border-black/5 p-6">
              <p className="text-sm font-bold text-accent">{n}단계</p>
              <p className="mt-2 font-semibold text-heading">{t}</p>
              <p className="mt-2 text-sm text-secondary">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 카테고리 그룹 + 9개 카드 */}
      <section className="bg-surface border-y border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-16 space-y-10">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <h2 className="text-xl font-semibold text-heading">{g.title}</h2>
              <div className="mt-4 grid gap-6 md:grid-cols-3">
                {g.tools.map((t) => (
                  <Link
                    key={t.href}
                    href={t.href}
                    className="rounded-[16px] bg-bg border border-black/5 p-6 hover:border-accent/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-heading">{t.name}</p>
                      <ReadyBadge ready={t.ready} />
                    </div>
                    <p className="mt-2 text-sm text-secondary">{t.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 도구별 상세 안내 */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-semibold text-heading">도구별 상세 안내</h2>
        <div className="mt-8 space-y-6">
          {DETAILS.map((d) => (
            <div key={d.href} className="rounded-[16px] bg-surface border border-black/5 p-6">
              <div className="flex items-center gap-3">
                <p className="font-semibold text-heading">{d.name}</p>
                <ReadyBadge ready={d.ready} />
              </div>
              <p className="mt-2 text-sm text-secondary">{d.body}</p>
              <Link href={d.href} className="mt-3 inline-block text-sm font-semibold text-accent">
                {d.ready ? "계산하러 가기 →" : "자세히 보기 →"}
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-8 text-xs text-muted">
          모든 계산기는 참고용 안내이며 최종 금액이 아닙니다. 확정 금액은 접수 후 항목별 견적으로 안내드립니다.
        </p>
      </section>

      <SectionCta title="계산이 끝났다면, 견적으로 확인하세요" sub="가입 후 주문을 접수하면 항목별 견적으로 확정 금액을 안내드립니다." />
      <SiteFooter />
    </main>
  );
}
