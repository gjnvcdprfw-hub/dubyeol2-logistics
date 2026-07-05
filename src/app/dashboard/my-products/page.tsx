import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import PrepNotice from "@/components/dashboard/prep-notice";

// 내 상품 리스트 — 벤치마크 문서 §2.3 구조.
// 액션 3종은 전부 준비 중(disabled) — 거짓 기능 0 원칙.

const ACTIONS = ["엑셀 업로드", "일괄 장바구니", "새 상품"];

export default async function MyProductsPage() {
  const session = await getSession();
  if (!session.userId) redirect("/auth/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-heading">내 상품 리스트</h1>
        <p className="mt-1 text-sm text-secondary">견적 요청한 상품을 확인하고 재구매</p>
      </div>

      <section className="bg-surface rounded-[27px] shadow-card p-6 space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          {ACTIONS.map((label) => (
            <button
              key={label}
              type="button"
              disabled
              className="rounded-[18px] bg-surface-alt text-muted text-sm font-medium px-4 py-2 cursor-not-allowed"
            >
              {label}
              <span className="ml-2 rounded-full bg-black/5 text-muted text-xs px-2 py-0.5">준비 중</span>
            </button>
          ))}
        </div>

        <div className="flex gap-6 text-sm text-secondary">
          <p><span className="font-semibold text-heading">0</span>개 상품</p>
          <p><span className="font-semibold text-heading">0</span>회 구매</p>
        </div>

        <div className="rounded-[16px] bg-surface-alt p-10 text-center">
          <p className="font-semibold text-heading">아직 견적 요청한 상품이 없습니다</p>
          <p className="mt-2 text-sm text-secondary">1688에서 상품을 찾아 견적을 요청해 보세요.</p>
          <Link
            href="/search"
            className="mt-5 inline-block rounded-[18px] bg-brand text-white text-sm font-semibold px-5 py-2.5"
          >
            상품 찾아보기
          </Link>
        </div>
      </section>

      <PrepNotice feature="내 상품 리스트" description="엑셀 업로드·일괄 장바구니·재구매 기능은 정식 오픈 시 이용하실 수 있습니다." />
    </div>
  );
}
