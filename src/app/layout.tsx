import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  title: "물류 — 중국 소싱 물류 플랫폼",
  description: "주문 접수부터 입고 확인, 항목별 견적까지. 사업자 셀러를 위한 중국→한국 통합 물류.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className={`${dmSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
