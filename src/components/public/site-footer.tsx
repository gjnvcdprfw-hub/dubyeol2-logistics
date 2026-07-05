import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="bg-surface border-t border-black/5">
      <div className="max-w-6xl mx-auto px-6 py-12 grid gap-8 md:grid-cols-4 text-sm">
        <div>
          <p className="font-bold text-brand text-lg">물류</p>
          <p className="mt-2 text-secondary">
            사업자 셀러를 위한 중국→한국 통합 물류. 주문 접수부터 입고 확인, 항목별 견적, 국제 배송까지
            공개 요율과 투명한 내역으로 처리합니다.
          </p>
        </div>
        <div>
          <p className="font-semibold text-heading mb-3">서비스</p>
          <ul className="space-y-2 text-secondary">
            <li><Link href="/search" className="hover:text-heading">1688 상품검색</Link></li>
            <li><Link href="/services/smart-order" className="hover:text-heading">스마트오더</Link></li>
            <li><Link href="/services/purchase-agency" className="hover:text-heading">구매대행</Link></li>
            <li><Link href="/services/shipping-agency" className="hover:text-heading">배송대행</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-heading mb-3">고객지원</p>
          <ul className="space-y-2 text-secondary">
            <li><Link href="/guide" className="hover:text-heading">이용가이드</Link></li>
            <li><Link href="/calculators" className="hover:text-heading">계산기</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-heading mb-3">약관</p>
          <ul className="space-y-2 text-secondary">
            <li><a href="#" title="준비 중" className="hover:text-heading">이용약관</a></li>
            <li><a href="#" title="준비 중" className="hover:text-heading">개인정보처리방침</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-muted space-y-1">
          <p>상호·대표자·사업자등록번호·주소·연락처: 사업자 정보 오픈 전 기재</p>
          <p>요율·검수 정책은 서비스 준비 중 기준이며 변경될 수 있습니다.</p>
          <p>© 2026 물류.</p>
        </div>
      </div>
    </footer>
  );
}
