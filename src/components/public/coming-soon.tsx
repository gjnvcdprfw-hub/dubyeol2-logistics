import Link from "next/link";

export default function ComingSoon({ feature }: { feature: string }) {
  return (
    <div className="rounded-[16px] bg-surface-alt border border-black/5 p-10 text-center">
      <p className="text-sm font-semibold text-brand">준비 중</p>
      <p className="mt-3 text-xl font-semibold text-heading">{feature}</p>
      <p className="mt-2 text-sm text-secondary">
        비공개 기준판에서는 화면 자리와 진입 흐름만 제공합니다. 실제 조회, 신청, 결제, 주문 생성은 오픈 전 확정 후 연결합니다.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4 text-sm">
        <Link href="/" className="text-secondary hover:text-heading">홈으로</Link>
        <Link href="/auth/register" className="bg-accent text-white font-semibold rounded-[12px] px-4 py-2">무료 가입하기</Link>
      </div>
    </div>
  );
}
