import { NextRequest, NextResponse } from 'next/server';
import { parseFile } from '@/lib/parser';
import { generateTestCases } from '@/lib/gemini';

/**
 * 문서 파일을 업로드하여 테스트케이스를 생성하는 API
 */
export async function POST(request: NextRequest) {
  try {
    console.log('파일 업로드 API 호출됨');
    
    // FormData 객체 생성 및 파싱
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    // 파일 유효성 검사
    if (!file) {
      console.error('파일이 제공되지 않음');
      return NextResponse.json(
        { error: '파일이 제공되지 않았습니다.' },
        { status: 400 }
      );
    }
    
    // 파일 타입 확인
    const fileType = file.name.toLowerCase().split('.').pop();
    if (!['pdf', 'docx', 'doc'].includes(fileType || '')) {
      console.error('지원되지 않는 파일 형식:', fileType);
      return NextResponse.json(
        { error: '지원되지 않는 파일 형식입니다. PDF, DOCX, DOC 파일만 지원합니다.' },
        { status: 400 }
      );
    }
    
    // 파일 크기 확인 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      console.error('파일 크기 초과:', file.size);
      return NextResponse.json(
        { error: '파일 크기가 너무 큽니다. 최대 10MB까지 지원합니다.' },
        { status: 400 }
      );
    }
    
    console.log('파일 파싱 시작:', file.name, file.type, file.size);
    
    try {
      // 파일 내용 파싱
      const text = await parseFile(file);
      console.log('파일 파싱 완료, 텍스트 길이:', text.length);
      
      if (!text || text.length < 10) {
        throw new Error('파일에서 추출한 텍스트가 너무 적습니다.');
      }
      
      // Gemini API를 통해 테스트케이스 생성
      console.log('테스트케이스 생성 시작');
      const testData = await generateTestCases(text);
      console.log('테스트케이스 생성 완료:', testData.testItems.length, '개 항목');
      
      return NextResponse.json(testData);
    } catch (processingError) {
      console.error('파일 처리 중 오류:', processingError);
      return NextResponse.json(
        { error: processingError instanceof Error ? processingError.message : '파일 처리 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('업로드 API 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '파일 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}