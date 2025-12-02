import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Diagen Playground',
  description: '코드 기반 다이어그램 생성기 - 실시간 편집기',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
