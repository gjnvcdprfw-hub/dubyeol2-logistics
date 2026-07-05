import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import PrepNotice from "@/components/dashboard/prep-notice";

// 내 프로필 — 벤치마크 §2.10 탭 4종. 기본 프로필만 활성(실데이터), 나머지는 준비 중.
// 민감 필드(passwordHash 등)는 렌더하지 않는다.

const PREP_TABS = ["배송 정보", "세금계산서 자료", "알림 설정"];

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-black/5 py-3 last:border-b-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm font-medium text-heading">{value}</dd>
    </div>
  );
}

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-heading">내 프로필</h1>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-[18px] bg-brand text-white text-sm font-semibold px-4 py-2">
          기본 프로필
        </span>
        {PREP_TABS.map((tab) => (
          <span
            key={tab}
            className="rounded-[18px] bg-surface-alt text-muted text-sm px-4 py-2"
          >
            {tab}
            <span className="ml-1.5 rounded-full bg-surface text-muted text-xs px-2 py-0.5">
              준비 중
            </span>
          </span>
        ))}
      </div>

      <section className="bg-surface rounded-[27px] shadow-card p-6">
        <h2 className="text-[14px] font-semibold text-heading mb-2">기본 정보</h2>
        <dl>
          <InfoRow label="회사명" value={user.companyName ?? "미등록"} />
          <InfoRow label="담당자명" value={user.contactName} />
          <InfoRow label="연락처" value={user.phone ?? "미등록"} />
          <InfoRow label="이메일" value={user.email} />
        </dl>
        <button
          type="button"
          disabled
          className="mt-5 rounded-[18px] bg-surface-alt text-muted text-sm font-semibold px-5 py-2.5 cursor-not-allowed"
        >
          정보 수정 (준비 중)
        </button>
      </section>

      <PrepNotice feature="프로필 수정·배송 정보·세금계산서·알림 설정" />
    </div>
  );
}
