import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import PrepNotice from "@/components/dashboard/prep-notice";

// 출장검품 주문 조회 (benchmark §2.9). 신청·조회 기능은 준비 중.
export default async function InspectionPage() {
  const session = await getSession();
  if (!session.userId) redirect("/auth/login");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-heading">출장검품 주문 조회</h1>
        <p className="mt-2 text-sm text-secondary">
          중국 공장 출장검품을 신청한 건의 진행 단계를 접수부터 보고서까지 한눈에 확인하는 화면입니다.{" "}
          <Link href="/services/inspection" className="text-accent font-medium">
            출장검품 서비스 소개 보기
          </Link>
        </p>
      </div>
      <div className="bg-surface rounded-[27px] shadow-card p-12 text-center text-muted">
        아직 신청한 검품 건이 없습니다
      </div>
      <PrepNotice feature="출장검품 신청·조회" />
    </div>
  );
}
