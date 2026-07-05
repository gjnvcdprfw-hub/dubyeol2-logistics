import SiteFooter from "../../../components/public/site-footer";
import SiteHeader from "../../../components/public/site-header";

const SECTIONS = [
  "수집 항목과 이용 목적",
  "보유 및 이용 기간",
  "제3자 제공과 처리 위탁",
  "정보주체 권리",
  "안전성 확보조치",
];

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-bg">
        <section className="max-w-6xl mx-auto px-6 py-20">
          <p className="text-sm font-semibold text-brand">법무 문서</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-semibold text-heading">개인정보처리방침</h1>
          <p className="mt-5 max-w-3xl text-lg text-secondary">
            개인정보처리방침은 오픈 전 확정합니다. 이 페이지는 공개 링크 구조 확인을 위한 비공개 기준판 자리표시입니다.
          </p>
        </section>

        <section className="bg-surface border-y border-black/5">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="rounded-[16px] bg-surface-alt border border-black/5 p-8">
              <p className="font-semibold text-heading">개인정보처리방침은 오픈 전 확정</p>
              <p className="mt-2 text-sm text-secondary">
                원본 방침 본문은 반입하지 않습니다. 실제 운영 전 수집 항목, 보관 기간, 책임자 표기를 확정합니다.
              </p>
              <ul className="mt-6 grid gap-3 md:grid-cols-2 text-sm text-secondary">
                {SECTIONS.map((section) => (
                  <li key={section} className="rounded-[12px] bg-surface border border-black/5 px-4 py-3">
                    {section}: 오픈 전 확정
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
