import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/public/site-header";
import SiteFooter from "@/components/public/site-footer";
import TrustStats from "@/components/public/trust-stats";
import SectionCta from "@/components/public/section-cta";
import { RATES } from "@/lib/rates";

export const metadata: Metadata = {
  title: "구매대행 | 물류",
  description: "상품 링크와 수량만 입력하면 1688 구매·결제·중국 내 배송을 대신 처리합니다. 수수료와 부가세까지 항목별 견적으로 투명하게 안내합니다.",
};

const CARD = "rounded-[16px] bg-surface shadow-[0_7px_30px_rgba(90,114,123,0.11)]";

const COMMISSION_LABEL = `상품가의 ${RATES.commissionRate * 100}%`;
const VAT_LABEL = `수수료의 ${RATES.commissionVatRate * 100}%`;
const INSPECTION_LABEL = `개당 ¥${RATES.inspectionFeeFenPerUnit / 100}`;

const METRICS: [string, string][] = [
  ["경험 지표", "오픈 전 확정"],
  ["수수료", COMMISSION_LABEL],
  ["AI 번역", "준비 중"],
];

// 비교표 8행: 일반 배대지 vs 일반 구매대행 vs 물류
const COMPARE_ROWS: [string, string, string, string][] = [
  ["구매·결제 대행", "직접 구매해야 함", "대행", "대행 (링크·수량만 입력)"],
  ["수수료 기준", "구매 수수료 없음", "업체별 상이·기준 불명확", `${COMMISSION_LABEL} + VAT ${RATES.commissionVatRate * 100}% 공개`],
  ["견적 방식", "출고 시 운임만 안내", "총액 위주 안내", "상품가·수수료·검수비·예상 운임 항목별 표시"],
  ["입고 확인", "업체별 상이", "요청 시 제공", "입고 사진 1~2장 기본 제공"],
  ["검수", "대부분 유료 옵션", "업체별 상이", `외포장 이상 안내 무료 + 유료 검수 ${INSPECTION_LABEL}`],
  ["부가서비스", "제한적", "업체별 상이", "원산지·바코드·포장 등 항목별 신청"],
  ["숨은 비용", "확인 어려움", "확인 어려움", "없음 — 확정 전 금액은 참고용 표기"],
  ["진행 상태 확인", "운송장 조회 위주", "채팅 문의 위주", "대시보드에서 단계별 확인"],
];

const FEATURES: [string, string][] = [
  ["링크만으로 주문 접수", "1688 상품 링크와 수량만 입력하면 접수 완료. 중국어 소통, 위안화 결제, 판매자 관리는 저희가 대신하므로 중국어를 몰라도 소싱할 수 있습니다."],
  ["항목별 투명 견적", "상품가(당일 환율 환산), 중국 내 배송비, 수수료와 부가세, 검수비, 예상 국제운임을 항목별로 나눠 보여드립니다. 총액만 알려주는 방식이 아닙니다."],
  ["입고 사진 기본 제공", "중국 창고 도착 시 입고 사진 1~2장과 외포장 이상 여부를 무료로 알려드립니다. 수량·외관·하자까지 보려면 유료 검수를 함께 신청하면 됩니다."],
  ["부가서비스 한 번에", "원산지 표기, 바코드 부착, 재포장 등을 주문 단계에서 함께 신청할 수 있습니다. 창고에서 판매 준비까지 마친 상태로 받아볼 수 있습니다."],
  ["진행 상태 단계별 확인", "접수부터 입고까지 주문이 지금 어느 단계인지 대시보드에서 건별로 확인합니다. 채팅으로 물어봐야 아는 방식이 아닙니다."],
  ["주문 이력 재사용", "접수한 상품과 견적 이력이 계정에 남아, 같은 상품을 다시 주문할 때 처음부터 입력을 반복하지 않아도 됩니다."],
];

const STEPS: [string, string][] = [
  ["주문 접수", "상품 링크·수량·옵션을 입력해 견적을 요청합니다. 부가서비스도 이 단계에서 함께 선택합니다."],
  ["견적 확인", "상품가·수수료·검수비가 나뉜 항목별 견적을 확인합니다. 확정 전 금액은 참고용입니다."],
  ["결제", "견적 승인 후 1차 결제를 진행합니다. 국제운임은 출고 시 별도 확정됩니다."],
  ["구매 진행", "저희가 판매자에게 구매·결제하고 중국 내 배송을 추적해 창고로 받습니다."],
  ["창고 입고·확인", "입고 사진과 외포장 상태를 확인하고, 필요 시 유료 검수·부가서비스를 진행합니다."],
  ["국제 배송·수령", "청구중량 기준 운임 확정 후 한국으로 발송, 통관을 거쳐 국내 배송으로 수령합니다."],
];

const ADDONS = ["원산지 표기", "바코드 부착", "KC 표기", "식품검역 표기", "세탁 라벨", "OPP 포장", "에어캡 포장", "묶음포장", "태그 제거", "포장 제거"];

const FAQ: [string, string][] = [
  ["수수료는 어떻게 계산되나요?", `구매대행 수수료는 ${COMMISSION_LABEL}이고, 수수료에 대한 부가세(${VAT_LABEL})가 더해집니다. 예를 들어 상품가에 수수료율을 곱한 금액이 수수료, 그 수수료의 10%가 부가세입니다. 전체 요율은 요금 안내에서 공개합니다.`],
  ["견적에 포함되는 것과 별도인 것은 무엇인가요?", "견적에는 상품가(당일 환율 환산), 중국 내 배송비, 수수료, 수수료 부가세, 선택한 부가서비스가 포함됩니다. 국제운임(출고 시 확정), 관세·부가세(통관 시), 부가서비스 추가분, 장기 보관료는 별도이며, 별도 항목도 견적 화면에 미리 표기해 드립니다."],
  ["주문 후 진행 상태는 어떻게 확인하나요?", "접수된 주문은 견적 산정, 견적 확정, 구매 진행, 창고 입고의 단계로 진행되며, 각 단계 전환을 대시보드에서 건별로 확인할 수 있습니다. 별도로 문의하지 않아도 현재 위치를 알 수 있습니다."],
  ["결제는 어떻게 하나요?", "원화 이체 또는 예치금으로 결제합니다. 카드 결제는 준비 중입니다. 위안화 결제와 환율 환산은 저희가 처리하며, 적용 환율은 견적에 표기합니다."],
  ["불량품이 오면 어떻게 하나요?", "기본 제공되는 입고 사진과 외포장 이상 안내로 1차 확인이 가능하고, 수량·외관 확인이 필요하면 유료 검수를 신청할 수 있습니다. 이상 발견 시 판매자와의 교환·환불 협의를 대신 진행합니다."],
  ["최소 주문 금액이 있나요?", "최소 주문 금액 제한은 없습니다. 소량 샘플로 품질을 확인한 뒤 본 주문으로 늘리는 방식도 많이 이용하십니다."],
  ["직접 구매한 상품도 받아줄 수 있나요?", "네, 직접 구매하신 상품은 배송대행으로 접수하시면 됩니다. 배송대행은 구매 수수료 없이 운임 기준으로 안내드리며, 구매대행 상품과 같은 창고에서 함께 관리됩니다."],
];

export default function PurchaseAgencyPage() {
  return (
    <main className="bg-bg text-body">
      <SiteHeader />

      {/* 히어로 */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex flex-wrap gap-2">
          {[`수수료 ${COMMISSION_LABEL}`, "입고 사진 기본 제공", "항목별 투명 견적"].map((b) => (
            <span key={b} className="text-xs font-semibold rounded-full bg-warning-tint text-heading px-3 py-1">{b}</span>
          ))}
        </div>
        <h1 className="mt-6 text-4xl md:text-5xl font-semibold text-heading leading-tight">
          1688 구매대행<br /><span className="text-accent">검색부터 통관까지 원스톱 서비스</span>
        </h1>
        <p className="mt-5 text-lg text-secondary max-w-2xl">
          상품 링크와 수량만 입력하면 구매·결제·중국 내 배송을 대신 처리합니다.
          중국어를 몰라도, 위안화 계정이 없어도 1688 도매가로 소싱할 수 있습니다.
          수수료와 부가세까지 항목별 견적으로 투명하게 보여드립니다.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/search" className="bg-accent text-white text-lg font-semibold rounded-[12px] px-8 py-4">상품 검색하기</Link>
          <Link href="/dashboard/orders" className="text-heading text-lg font-semibold px-4 py-4">구매 진행 확인 →</Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-4">
          {METRICS.map(([label, value]) => (
            <div key={label} className={`${CARD} p-6 text-center`}>
              <p className="text-xs text-muted">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-heading">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 구매대행이란 */}
      <section className="bg-surface border-y border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold text-heading">구매대행이란?</h2>
          <p className="mt-4 text-secondary max-w-3xl leading-relaxed">
            구매대행은 중국 쇼핑몰(1688 등)의 상품을 고객 대신 구매하고 한국까지 배송하는 서비스입니다.
            1688은 중국 최대 규모의 도매 플랫폼으로 같은 상품도 소매가보다 낮은 도매 단가로 살 수 있지만,
            중국어 페이지, 위안화 결제, 중국 내수 배송이라는 장벽 때문에 한국 셀러가 직접 이용하기는 쉽지 않습니다.
            그 장벽을 저희가 대신 넘습니다. 중국어 소통, 위안화 결제, 판매자 관리, 중국 내 배송 추적을 저희가 처리하므로
            고객은 상품 링크와 수량만 알려주시면 됩니다.
          </p>
          <p className="mt-4 text-secondary max-w-3xl leading-relaxed">
            주문이 접수되면 견적 산정 → 견적 확정 → 구매 진행 → 창고 입고 순서로 진행되고,
            각 단계는 대시보드에서 실시간으로 확인할 수 있습니다. 사업자 셀러가 소싱한 상품을
            검수·부가서비스까지 한 번에 처리해 국내 판매 준비 상태로 받아볼 수 있습니다.
            한국어 키워드·이미지로 1688 상품을 찾는 검색 기능은 준비 중이며, 정식 오픈 후 제공됩니다.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className={`${CARD} p-8 md:flex items-center justify-between gap-8`}>
          <div>
            <p className="text-sm font-semibold text-accent">중국어-한국어 번역 안내</p>
            <h2 className="mt-2 text-3xl font-semibold text-heading">상품명을 몰라도 검색 흐름을 시작할 수 있습니다</h2>
            <p className="mt-3 text-secondary max-w-2xl">
              한국어 키워드 입력, 번역 버튼, 이미지 검색 자리를 공개 화면에 둡니다.
              현재 기준판에서는 실제 번역·검색 API를 호출하지 않고, 정식 오픈 전 연결 예정 상태로 표시합니다.
            </p>
          </div>
          <Link href="/search" className="inline-flex mt-6 md:mt-0 bg-accent text-white text-lg font-semibold rounded-[12px] px-8 py-4 shrink-0">
            AI 번역하기
          </Link>
        </div>
      </section>

      {/* 비교표 */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold text-heading">무엇이 다른가요?</h2>
        <p className="mt-3 text-secondary">일반 배송대행지, 일반 구매대행과 비교해 보세요.</p>
        <div className={`mt-8 overflow-x-auto ${CARD}`}>
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-black/5 text-left">
                <th className="px-5 py-4 font-semibold text-heading">구분</th>
                <th className="px-5 py-4 font-semibold text-secondary">일반 배대지</th>
                <th className="px-5 py-4 font-semibold text-secondary">일반 구매대행</th>
                <th className="px-5 py-4 font-semibold text-accent">물류</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map(([label, a, b, ours]) => (
                <tr key={label} className="border-b border-black/5 last:border-0">
                  <td className="px-5 py-4 font-semibold text-heading">{label}</td>
                  <td className="px-5 py-4 text-secondary">{a}</td>
                  <td className="px-5 py-4 text-secondary">{b}</td>
                  <td className="px-5 py-4 text-heading font-medium">{ours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 핵심 기능 4카드 */}
      <section className="bg-surface-alt border-y border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold text-heading">핵심 기능</h2>
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            {FEATURES.map(([t, d]) => (
              <div key={t} className={`${CARD} p-6`}>
                <h3 className="font-semibold text-heading">{t}</h3>
                <p className="mt-2 text-sm text-secondary">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6단계 프로세스 */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold text-heading">이용 순서 6단계</h2>
        <ol className="mt-8 grid md:grid-cols-3 gap-4">
          {STEPS.map(([t, d], i) => (
            <li key={t} className={`${CARD} p-5`}>
              <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-accent text-white text-sm font-semibold">{i + 1}</span>
              <h3 className="mt-3 font-semibold text-heading">{t}</h3>
              <p className="mt-1 text-xs text-secondary">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 부가서비스 6칩 */}
      <section className="bg-surface border-y border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold text-heading">함께 신청할 수 있는 부가서비스</h2>
          <p className="mt-3 text-secondary">주문 단계에서 항목별로 선택하고, 단가는 요금 안내에서 확인할 수 있습니다.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {ADDONS.map((a) => (
              <span key={a} className="text-sm font-medium rounded-full bg-bg border border-black/5 text-heading px-4 py-2">{a}</span>
            ))}
          </div>
          <Link href="/guide/services" className="inline-block mt-6 text-sm font-semibold text-accent">부가서비스 안내 보기 →</Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold text-heading">내 상품 리스트와 재구매</h2>
        <p className="mt-3 text-secondary max-w-2xl">
          구매가 끝난 상품은 계정 안에 남아 같은 상품을 다시 주문할 때 링크와 옵션을 처음부터 찾지 않도록 준비합니다.
          기준판에서는 목록·재구매 버튼의 위치와 역할만 보여주며 실제 주문 생성은 하지 않습니다.
        </p>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {["상품 보관함", "매칭된 옵션", "재구매 요청"].map((title) => (
            <div key={title} className={`${CARD} p-6`}>
              <p className="text-xs font-semibold text-muted">준비 중</p>
              <h3 className="mt-2 font-semibold text-heading">{title}</h3>
              <p className="mt-2 text-sm text-secondary">정식 오픈 전 기능 연결 예정입니다.</p>
            </div>
          ))}
        </div>
        <Link href="/dashboard/my-products" className="inline-block mt-6 text-sm font-semibold text-accent">내 상품 리스트 보기 →</Link>
      </section>

      {/* 수수료 섹션 */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold text-heading">수수료, 이게 전부입니다</h2>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className={`${CARD} p-6`}>
            <p className="text-sm text-secondary">구매대행 수수료</p>
            <p className="mt-2 text-2xl font-semibold text-heading">{COMMISSION_LABEL}</p>
            <p className="mt-2 text-xs text-secondary">수수료에 대한 부가세({VAT_LABEL})가 더해집니다.</p>
          </div>
          <div className={`${CARD} p-6`}>
            <p className="text-sm text-secondary">유료 검수</p>
            <p className="mt-2 text-2xl font-semibold text-heading">{INSPECTION_LABEL}</p>
            <p className="mt-2 text-xs text-secondary">입고 사진·외포장 이상 안내는 기본 무료입니다.</p>
          </div>
          <div className={`${CARD} p-6`}>
            <p className="text-sm text-secondary">숨은 비용</p>
            <p className="mt-2 text-2xl font-semibold text-heading">없음</p>
            <p className="mt-2 text-xs text-secondary">국제운임·관세는 견적에 별도 항목으로 표시됩니다.</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted">요율은 서비스 준비 중 기준이며 변경될 수 있습니다. 확정 전 금액은 참고용입니다.</p>
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
      <SectionCta title="구매대행, 오늘 시작해 보세요" sub="가입 후 상품 링크만 입력하면 견적을 받아볼 수 있습니다." />
      <SiteFooter />
    </main>
  );
}
