import Link from "next/link";

const SERVICE_LINKS = [
  { href: "/search", label: "1688 상품" },
  { href: "/services/smart-order", label: "스마트오더" },
  { href: "/services/inspection", label: "검품감사" },
  { href: "/services/purchase-agency", label: "구매대행" },
  { href: "/services/shipping-agency", label: "배송대행" },
];

const SUPPORT_LINKS = [
  { href: "/tracking", label: "배송조회" },
  { href: "/calculators", label: "계산기" },
  { href: "/guide", label: "이용가이드" },
  { href: "/legal/terms", label: "이용약관" },
  { href: "/legal/privacy", label: "개인정보처리방침" },
];

export default function SiteFooter() {
  return (
    <footer className="bg-surface border-t border-black/5">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold text-muted">비공개 공개 화면 기준판</p>
          <p className="mt-1 font-bold text-brand text-lg">브랜드 자리표시</p>
          <p className="mt-2 text-sm text-secondary">
            중국 무역 공개 서비스 흐름을 비교하기 위한 로컬 기준판입니다. 운영 전 회사 정보와 정책은 모두 확정 대기값으로 둡니다.
          </p>
        </div>
      </div>
      <div className="border-t border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-3 text-sm">
          <div>
            <p className="font-semibold text-heading mb-3">서비스</p>
            <ul className="space-y-2 text-secondary">
              {SERVICE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-heading">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-heading mb-3">고객지원</p>
            <ul className="space-y-2 text-secondary">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-heading">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-heading mb-3">회사정보</p>
            <dl className="space-y-2 text-secondary">
              <div>
                <dt className="inline text-heading">회사소개</dt>
                <dd className="inline">: <Link href="/about" className="hover:text-heading">보기</Link></dd>
              </div>
              <div>
                <dt className="inline text-heading">사업자정보</dt>
                <dd className="inline">: 오픈 전 확정</dd>
              </div>
              <div>
                <dt className="inline text-heading">주소</dt>
                <dd className="inline">: 오픈 전 확정</dd>
              </div>
              <div>
                <dt className="inline text-heading">연락처</dt>
                <dd className="inline">: 오픈 전 확정</dd>
              </div>
              <div>
                <dt className="inline text-heading">정산 정보</dt>
                <dd className="inline">: 오픈 전 확정</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      <div className="border-t border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-muted space-y-1">
          <p>회사 식별값, 연락 경로, 정산 정보는 오픈 전 확정 자리표시입니다.</p>
          <p>요율·검수 정책은 비공개 기준판 상태이며 운영 전 최종 확정이 필요합니다.</p>
          <p>(c) 2026 브랜드 자리표시.</p>
        </div>
      </div>
    </footer>
  );
}
