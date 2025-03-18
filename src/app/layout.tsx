import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '기획서 테스트케이스 변환기',
  description: '기획서 문서를 업로드하여 테스트케이스를 자동으로 생성합니다.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {/* Suspense 오류 방지를 위해 suppressHydrationWarning 추가 */}
        <div suppressHydrationWarning>
          {children}
        </div>
      </body>
    </html>
  );
}