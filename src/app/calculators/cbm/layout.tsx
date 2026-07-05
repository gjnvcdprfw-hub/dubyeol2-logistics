import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CBM 계산기 | 물류",
  description: "박스 한 개의 치수(cm)와 박스 수를 입력하면 화물 전체 부피(CBM)를 계산합니다. 해운 견적과 컨테이너 적재 계획의 기준이 되는 값입니다.",
};

export default function CbmCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
