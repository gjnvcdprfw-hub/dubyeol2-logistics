import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-bg text-body">
      <header className="sticky top-0 bg-white/90 backdrop-blur border-b border-black/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <span className="font-bold text-brand text-lg">물류</span>
          <nav className="flex items-center gap-6 text-sm text-[#666666]">
            <Link href="/auth/login">로그인</Link>
            <Link href="/auth/register" className="bg-accent text-white font-semibold rounded-[12px] px-4 py-2">무료 가입하기</Link>
          </nav>
        </div>
      </header>
      <section className="max-w-6xl mx-auto px-6 py-24">
        <h1 className="text-[56px] md:text-[96px] leading-none font-semibold text-heading">
          중국 소싱 물류,<br /><span className="text-accent">투명하게.</span>
        </h1>
        <p className="mt-6 text-lg text-secondary">주문 접수부터 입고 확인, 항목별 견적까지. 사업자 셀러를 위한 중국→한국 통합 물류.</p>
        <div className="mt-8 flex gap-4">
          <Link href="/auth/register" className="bg-accent text-white text-lg font-semibold rounded-[12px] px-8 py-4">무료 가입하기</Link>
          <Link href="/auth/login" className="text-heading text-lg font-semibold px-4 py-4">로그인 →</Link>
        </div>
        <ul className="mt-10 flex gap-6 text-sm text-secondary">
          <li>✓ 입고 사진 기본 제공</li>
          <li>✓ 항목별 투명 견적</li>
          <li>✓ 사업자 셀러 전용</li>
        </ul>
      </section>
      <section className="bg-surface border-t border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">
          {[
            ["주문 접수", "상품 링크와 수량만 입력하면 접수 완료. 구매대행·배송대행 중 선택합니다."],
            ["입고 확인", "중국 창고 도착 시 입고 사진 1~2장과 외포장 이상 여부를 기본 제공합니다. 수량·외관·하자 확인은 유료 검수 옵션입니다."],
            ["투명 견적", "상품가, 수수료, 검수비, 예상 국제운임을 항목별로 보여드립니다. 숨은 비용이 없습니다."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-[16px] bg-bg p-6">
              <h3 className="font-semibold text-heading mb-2">{t}</h3>
              <p className="text-sm text-secondary">{d}</p>
            </div>
          ))}
        </div>
      </section>
      <footer className="max-w-6xl mx-auto px-6 py-10 text-xs text-muted">
        © 2026 물류. 요율·검수 정책은 서비스 준비 중 기준이며 변경될 수 있습니다.
      </footer>
    </main>
  );
}
