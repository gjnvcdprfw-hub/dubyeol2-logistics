import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "배송비 계산기 | 물류",
  description: "무게와 치수를 입력하면 공개 요율 기준으로 해운·항공 예상 운임을 비교합니다. 청구중량은 실중량과 부피중량 중 큰 값입니다.",
};

export default function ShippingCostCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
