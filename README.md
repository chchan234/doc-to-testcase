# 기획서 테스트케이스 변환기

기획서 문서(PDF, DOCX, DOC)를 테스트케이스 Excel 파일로 변환하는 웹 애플리케이션입니다.

## 기능

- PDF, DOCX, DOC 파일 업로드
- 파일 내용 추출 및 파싱
- Google Gemini API를 통한 테스트케이스 생성
- Excel 형식의 테스트케이스 다운로드

## 기술 스택

- Next.js
- TypeScript
- TailwindCSS
- Google Gemini API
- exceljs

## 설치 및 실행

1. 저장소 클론
   ```bash
   git clone https://github.com/chchan234/doc-to-testcase.git
   cd doc-to-testcase
   ```

2. 의존성 설치
   ```bash
   npm install
   ```

3. 환경 변수 설정
   - `.env.local` 파일을 생성하고 다음과 같이 설정:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your-api-key-here
   ```
   - Gemini API 키는 [Google AI Studio](https://aistudio.google.com/app/apikey)에서 발급 받을 수 있습니다.

4. 개발 서버 실행
   ```bash
   npm run dev
   ```

5. 웹 브라우저에서 `http://localhost:3000` 접속