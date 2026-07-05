import Link from "next/link";

export default function SectionCta({ title, sub }: { title: string; sub: string }) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 text-center">
      <h2 className="text-3xl md:text-4xl font-semibold text-heading">{title}</h2>
      <p className="mt-4 text-secondary">{sub}</p>
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/auth/register" className="bg-accent text-white text-lg font-semibold rounded-[12px] px-8 py-4">무료 가입하기</Link>
        <Link href="/auth/login" className="text-heading text-lg font-semibold px-4 py-4">로그인 →</Link>
      </div>
    </section>
  );
}
