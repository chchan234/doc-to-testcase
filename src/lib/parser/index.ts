import { parsePDF } from './pdf';
import { parseDOCX } from './docx';
import { parseDOC } from './doc';

/**
 * 파일 타입에 따라 적절한 파서를 선택하여 텍스트를 추출
 * @param file 파싱할 파일
 * @returns 추출된 텍스트
 */
export async function parseFile(file: File): Promise<string> {
  try {
    console.log('파싱 시작:', file.name, file.type);
    
    // 파일 확장자로 파서 선택
    const fileType = file.name.toLowerCase().split('.').pop();
    
    if (fileType === 'pdf') {
      console.log('PDF 파서 사용');
      return await parsePDF(file);
    } else if (fileType === 'docx') {
      console.log('DOCX 파서 사용');
      return await parseDOCX(file);
    } else if (fileType === 'doc') {
      console.log('DOC 파서 사용');
      return await parseDOC(file);
    } else {
      throw new Error(`지원되지 않는 파일 형식입니다: ${fileType}`);
    }
  } catch (error) {
    console.error('파일 파싱 중 오류:', error);
    throw error;
  }
}