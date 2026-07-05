import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "부피중량 계산기 | 물류",
  description: "국제운임은 실중량과 부피중량 중 큰 값인 청구중량으로 계산됩니다. 치수와 실중량을 입력해 어느 쪽이 적용되는지 확인하세요.",
};

export default function VolumeWeightCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
