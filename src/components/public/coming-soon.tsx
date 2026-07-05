import Link from "next/link";

export default function ComingSoon({ feature }: { feature: string }) {
  return (
    <div className="rounded-[16px] bg-surface-alt border border-black/5 p-10 text-center">
      <p className="text-2xl">🚧</p>
      <p className="mt-3 font-semibold text-heading">준비 중 — {feature}은(는) 곧 열립니다</p>
      <p className="mt-2 text-sm text-secondary">정식 오픈 시 이용하실 수 있습니다. 가입하시면 오픈 소식을 먼저 알려드립니다.</p>
      <div className="mt-6 flex justify-center gap-4 text-sm">
        <Link href="/" className="text-secondary hover:text-heading">홈으로</Link>
        <Link href="/auth/register" className="bg-accent text-white font-semibold rounded-[12px] px-4 py-2">무료 가입하기</Link>
      </div>
    </div>
  );
}
