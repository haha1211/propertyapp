import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PropertyApp",
  description: "조건 기반 아파트 추천 MVP"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
