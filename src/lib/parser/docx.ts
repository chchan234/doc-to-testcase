/**
 * DOCX 파일을 텍스트로 변환하는 파서
 */

/**
 * DOCX 파일을 텍스트로 변환
 * @param file DOCX 파일
 * @returns 추출된 텍스트
 */
export async function parseDOCX(file: File): Promise<string> {
  try {
    // DOCX 파일을 ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    console.log('DOCX ArrayBuffer 크기:', arrayBuffer.byteLength);
    
    // mammoth 라이브러리를 사용하여 DOCX 파싱 (서버 측에서만 동작)
    const result = await extractDOCXText(arrayBuffer);
    
    // 불필요한 공백 및 특수 문자 정리
    const cleanedText = cleanText(result);
    console.log('DOCX 파싱 완료:', cleanedText.length, '자');
    
    return cleanedText;
  } catch (error) {
    console.error('DOCX 파싱 중 오류:', error);
    throw new Error('DOCX 파일을 파싱하는 중 오류가 발생했습니다.');
  }
}

/**
 * DOCX 파일의 ArrayBuffer를 텍스트로 변환
 * 서버 측에서 mammoth 라이브러리 사용
 */
async function extractDOCXText(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    // 서버 측에서만 DOCX 파싱이 가능
    const mammoth = require('mammoth');
    
    // Node.js 환경을 위한 Buffer 변환
    const buffer = Buffer.from(arrayBuffer);
    
    // mammoth를 사용하여 DOCX 파싱
    // buffer 프로퍼티에 ArrayBuffer를 직접 전달
    const result = await mammoth.extractRawText({ buffer });
    
    return result.value || '';
  } catch (error) {
    console.error('mammoth 오류:', error);
    throw new Error('DOCX 파일을 처리하는 중 오류가 발생했습니다.');
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