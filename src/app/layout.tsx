import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '기획서 테스트케이스 변환기',
  description: '기획서 문서(PDF, DOCX, DOC)를 테스트케이스 Excel 파일로 변환하는 웹 애플리케이션',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}