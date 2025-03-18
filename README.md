# TestCase_Generator

기획서 문서(PDF, DOCX, DOC)를 테스트케이스 Excel 파일로 자동 변환하는 웹 애플리케이션입니다.

## 기능

- PDF, DOCX, DOC 파일 업로드 및 분석
- 파일 내용 추출 및 파싱
- Google Gemini API를 통한 테스트케이스 자동 생성
- Excel 형식으로 테스트케이스 생성 및 다운로드
- 테스트 상태 추적 (Not Tested, Pass, Fail)
- 다양한 플랫폼 지원 (iOS, Android, PC, Jira)

## 기술 스택

- **프론트엔드**: Next.js 14, React, TypeScript, TailwindCSS
- **백엔드**: Next.js API Routes
- **AI**: Google Gemini 1.5 Flash API
- **파일 처리**: mammoth (DOCX), pdf-parse (PDF)
- **Excel 생성**: exceljs
- **배포**: Vercel

## 변경 내역

### 2025-03-18 업데이트

1. **Gemini 모델 업데이트**
   - 기존 'gemini-2.0-flash' 모델에서 'gemini-1.5-flash'로 변경
   - API 응답 처리 로직 개선 및 오류 복구 기능 강화

2. **UI/UX 개선**
   - 파일 업로드 컴포넌트 반응형 디자인 적용
   - 처리 상태 표시 개선 및 오류 메시지 상세화
   - 다운로드 버튼 스타일 및 사용성 개선

3. **성능 최적화**
   - 클라이언트 컴포넌트와 서버 컴포넌트 분리 최적화
   - 불필요한 동적 임포트 제거 및 코드 통합
   - Suspense 관련 서버 렌더링 이슈 해결

4. **버그 수정**
   - React Error #419 (Suspense) 관련 문제 해결
   - `suppressHydrationWarning` 속성 관련 문제 해결
   - 모듈 경로 해결 문제 수정

5. **환경 설정 개선**
   - SWC 의존성 문제 해결을 위한 패키지 업데이트
   - 환경 변수 설정 개선 (Vercel 배포용)

## 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone https://github.com/chchan234/doc-to-testcase.git
   cd doc-to-testcase
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경 변수 설정**
   - `.env.local` 파일을 생성하고 다음과 같이 설정:
   ```
   GEMINI_API_KEY=your-api-key-here
   ```
   - Gemini API 키는 [Google AI Studio](https://aistudio.google.com/app/apikey)에서 발급 받을 수 있습니다.

4. **개발 서버 실행**
   ```bash
   npm run dev
   ```

5. **웹 브라우저에서 접속**
   - 개발 환경: `http://localhost:3000`
   - 프로덕션: [https://doc-to-testcase.vercel.app](https://doc-to-testcase.vercel.app)

## 배포 가이드

### Vercel 배포

1. GitHub 저장소와 Vercel 계정 연결
2. Vercel 대시보드에서 새 프로젝트 생성 및 저장소 선택
3. 환경 변수 설정:
   - `GEMINI_API_KEY`: Google Gemini API 키
4. 배포 완료 후 제공된 URL로 접속

## 문제 해결

### 일반적인 문제

1. **모듈 경로 해결 오류 (Module not found: Can't resolve '@/components/...)**
   - 이 문제는 Next.js의 경로 별칭(@) 사용 시 발생할 수 있습니다.
   - 해결 방법: 상대 경로 사용 또는 tsconfig.json에서 경로 별칭 올바르게 설정

2. **SWC 의존성 문제**
   - 빌드 과정에서 "Found lockfile missing swc dependencies" 경고가 표시될 수 있습니다.
   - 해결 방법: package.json에 @swc/helpers, @swc/cli, @swc/core 의존성 추가

3. **API 키 관련 오류**
   - "Gemini API 키가 설정되지 않았습니다" 오류 발생 시
   - 해결 방법: .env.local 파일에 GEMINI_API_KEY 설정 또는 Vercel 대시보드에서 환경 변수 설정

4. **React Error #419 (Suspense 관련)**
   - 클라이언트 컴포넌트와 서버 컴포넌트 혼합 사용 시 발생할 수 있는 오류
   - 해결 방법: 'use client' 지시문 올바르게 사용 및 동적 임포트 최소화

## 라이센스

MIT
