import Link from "next/link";

// 두리무역 벤치(benchmark-duly.md §1) 4그룹 12메뉴. 구매대행 관리·창고 주소는 기존 경로 재사용.
const GROUPS: { label: string; items: { label: string; href: string }[] }[] = [
  {
    label: "🏠 마이페이지",
    items: [{ label: "마이페이지", href: "/dashboard" }],
  },
  {
    label: "🛒 구매대행",
    items: [
      { label: "장바구니", href: "/dashboard/cart" },
      { label: "내 상품 리스트", href: "/dashboard/my-products" },
      { label: "구매대행 관리", href: "/dashboard/orders" },
      { label: "스마트오더", href: "/dashboard/smart-order" },
    ],
  },
  {
    label: "📦 배송대행",
    items: [
      { label: "입고 관리", href: "/dashboard/inbound" },
      { label: "출고 관리", href: "/dashboard/shipment" },
      { label: "반품 관리", href: "/dashboard/returns" },
      { label: "창고 주소", href: "/dashboard/warehouse-address" },
    ],
  },
  {
    label: "📊 서비스",
    items: [{ label: "출장검품", href: "/dashboard/inspection" }],
  },
  {
    label: "👤 내정보",
    items: [
      { label: "내 프로필", href: "/dashboard/profile" },
      { label: "예치금 관리", href: "/dashboard/wallet" },
    ],
  },
];

export default function DashboardSidebar() {
  return (
    <aside className="w-[221px] shrink-0 bg-surface border-r border-black/5 p-4 flex flex-col gap-6">
      <Link href="/" className="block font-bold text-brand text-lg">물류</Link>
      <Link
        href="/dashboard/orders/new"
        className="block bg-accent text-white text-sm font-semibold text-center rounded-[12px] px-4 py-2.5"
      >
        주문 접수
      </Link>
      <nav className="space-y-4 text-[15px] flex-1">
        {GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-[12px] font-bold uppercase text-muted mb-2">{group.label}</p>
            {group.items.map((item) => (
              <Link key={item.href} href={item.href} className="block py-1.5 text-body">
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <form action="/api/auth/logout" method="post"><button className="text-sm text-muted">로그아웃</button></form>
    </aside>
  );
}
