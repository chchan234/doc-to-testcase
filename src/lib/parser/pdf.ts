/**
 * PDF 파일을 텍스트로 변환하는 파서
 */

/**
 * PDF 파일을 텍스트로 변환
 * @param file PDF 파일
 * @returns 추출된 텍스트
 */
export async function parsePDF(file: File): Promise<string> {
  try {
    // PDF 파일을 ArrayBuffer로 변환
    const buffer = await file.arrayBuffer();
    
    // Node.js 환경에서 pdf-parse 사용 (서버 측에서만 동작)
    // 클라이언트에서는 보안 제약으로 인해 직접 PDF를 파싱할 수 없음
    const result = await extractPDFText(buffer);
    
    // 불필요한 공백 및 특수 문자 정리
    const cleanedText = cleanText(result);
    console.log('PDF 파싱 완료:', cleanedText.length, '자');
    
    return cleanedText;
  } catch (error) {
    console.error('PDF 파싱 중 오류:', error);
    throw new Error('PDF 파일을 파싱하는 중 오류가 발생했습니다.');
  }
}

/**
 * PDF 파일의 ArrayBuffer를 텍스트로 변환
 * 서버 측에서 pdf-parse 라이브러리 사용
 */
async function extractPDFText(buffer: ArrayBuffer): Promise<string> {
  try {
    // 서버 측에서만 PDF 파싱이 가능
    const pdfParse = require('pdf-parse');
    
    // Buffer 객체로 변환
    const bufferObj = Buffer.from(buffer);
    
    // PDF 파싱
    const data = await pdfParse(bufferObj);
    
    return data.text || '';
  } catch (error) {
    console.error('pdf-parse 오류:', error);
    throw new Error('PDF 파일을 처리하는 중 오류가 발생했습니다.');
  }
}

/**
 * 추출된 텍스트 정리
 */
function cleanText(text: string): string {
  if (!text) return '';
  
  // 중복된 줄바꿈 제거
  let cleaned = text.replace(/\n{3,}/g, '\n\n');
  
  // 여러 줄의 빈 공백 제거
  cleaned = cleaned.replace(/[ \t]{2,}/g, ' ');
  
  // 앞뒤 공백 제거
  cleaned = cleaned.trim();
  
  return cleaned;
}