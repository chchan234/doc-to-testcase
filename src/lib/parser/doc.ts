/**
 * DOC 파일을 텍스트로 변환하는 파서
 * DOC 파일 형식은 이진 형식이라 직접 파싱이 어려움
 * 대부분의 DOC 파일은 DOCX 파서로 처리할 수 있도록 시도
 */

/**
 * DOC 파일을 텍스트로 변환
 * @param file DOC 파일
 * @returns 추출된 텍스트
 */
export async function parseDOC(file: File): Promise<string> {
  try {
    // DOC 파일을 ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    
    // DOCX 파서와 동일한 방식으로 처리 시도
    // 일부 DOC 파일은 mammoth로 처리 가능함
    const mammoth = require('mammoth');
    
    try {
      console.log('DOC 파일 처리 시도 (mammoth 사용)');
      // Node.js 환경을 위한 Buffer 변환
      const buffer = Buffer.from(arrayBuffer);
      
      // mammoth를 사용하여 DOC 파싱 시도
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value || '';
      
      if (text && text.length > 0) {
        console.log('DOC 파싱 성공 (mammoth):', text.length, '자');
        return cleanText(text);
      }
    } catch (mammothError) {
      console.error('DOC mammoth 파싱 실패:', mammothError);
      // 실패 시 다른 방법 시도
    }
    
    // 여기까지 왔다면 파싱에 실패한 것이므로 오류 발생
    throw new Error('DOC 파일 파싱에 실패했습니다. DOCX 형식으로 변환 후 다시 시도해주세요.');
  } catch (error) {
    console.error('DOC 파싱 중 오류:', error);
    throw new Error('DOC 파일을 파싱하는 중 오류가 발생했습니다. DOCX 형식으로 변환 후 다시 시도해주세요.');
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