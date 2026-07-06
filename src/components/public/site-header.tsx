import Link from "next/link";
import HeaderAuthActions from "./header-auth-actions";

const MENU = [
  { href: "/about", label: "회사소개" },
  { href: "/search", label: "1688 상품" },
  { href: "/services/smart-order", label: "스마트오더" },
  { href: "/services/inspection", label: "검품감사" },
  { href: "/services/purchase-agency", label: "구매대행" },
  { href: "/services/shipping-agency", label: "배송대행" },
  { href: "/tracking", label: "배송조회" },
  { href: "/calculators", label: "계산기" },
  { href: "/guide", label: "이용가이드" },
];

export default function SiteHeader({ initialRole }: { initialRole?: string | null } = {}) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-black/5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-6 px-6 h-16">
        <Link href="/" className="shrink-0" aria-label="홈으로">
          <span className="block text-xs font-semibold text-muted">비공개 기준판</span>
          <span className="block font-bold text-brand text-lg leading-5">브랜드 자리표시</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-[#666666]" aria-label="공개 메뉴">
          {MENU.map((m) => (
            <Link key={m.href} href={m.href} className="hover:text-heading">{m.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm shrink-0">
          <HeaderAuthActions initialRole={initialRole} />
        </div>
      </div>
    </header>
  );
}
