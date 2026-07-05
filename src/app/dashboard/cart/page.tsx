import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import PrepNotice from "@/components/dashboard/prep-notice";

// 장바구니 — 벤치마크 문서 §2.12 빈 상태 구조. 기능은 준비 중.

export default async function CartPage() {
  const session = await getSession();
  if (!session.userId) redirect("/auth/login");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-heading">장바구니</h1>

      <section className="bg-surface rounded-[27px] shadow-card p-10 text-center">
        <p className="text-3xl">🛒</p>
        <p className="mt-4 font-semibold text-heading">아직 담긴 상품이 없습니다</p>
        <p className="mt-2 text-sm text-secondary">1688 검색에서 상품을 담아 두면, 여러 상품을 한 번에 견적 요청할 수 있습니다.</p>
        <Link
          href="/search"
          className="mt-5 inline-block rounded-[18px] bg-brand text-white text-sm font-semibold px-5 py-2.5"
        >
          1688 상품 검색하러 가기
        </Link>
      </section>

      <PrepNotice feature="장바구니·일괄 견적" />
    </div>
  );
}
