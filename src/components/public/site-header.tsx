import Link from "next/link";

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

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-black/5">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
        <Link href="/" className="font-bold text-brand text-lg shrink-0">물류</Link>
        <nav className="hidden md:flex items-center gap-5 text-sm text-[#666666]">
          {MENU.map((m) => (
            <Link key={m.href} href={m.href} className="hover:text-heading">{m.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm shrink-0">
          <Link href="/auth/login" className="text-secondary">로그인</Link>
          <Link href="/auth/register" className="bg-accent text-white font-semibold rounded-[12px] px-4 py-2">무료 가입하기</Link>
        </div>
      </div>
    </header>
  );
}
