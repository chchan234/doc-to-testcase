import { NextRequest, NextResponse } from 'next/server';
import { generateExcel } from '@/lib/excel';
import { TestDocument } from '@/types';

/**
 * 테스트케이스 JSON을 받아 Excel 파일로 반환하는 API
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Excel 생성 API 호출됨');
    
    // JSON 데이터 파싱
    const body = await request.json();
    
    // 요청 데이터 유효성 검사
    if (!body.testItems || !Array.isArray(body.testItems)) {
      console.error('유효하지 않은 테스트케이스 데이터:', body);
      return NextResponse.json(
        { error: '유효하지 않은 테스트케이스 데이터 구조입니다. testItems 배열이 필요합니다.' },
        { status: 400 }
      );
    }
    
    // testItems 가 있는지 확인
    const testItems = body.testItems;
    console.log(`테스트 항목 ${testItems.length}개로 Excel 생성 시작`);
    
    // 테스트 데이터를 사용하여 Excel 파일 생성
    const testData: TestDocument = { testItems };
    const excelBlob = await generateExcel(testData);
    
    // 응답 헤더 설정 (다운로드를 위한 설정)
    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.set('Content-Disposition', 'attachment; filename="testcases.xlsx"');
    
    // ArrayBuffer로 변환하여 반환
    const arrayBuffer = await excelBlob.arrayBuffer();
    
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Excel 생성 중 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Excel 파일 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}