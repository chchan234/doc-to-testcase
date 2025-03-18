import * as ExcelJS from 'exceljs';
import { TestDocument, TestItem } from '../types';

/**
 * 테스트케이스 JSON 데이터를 Excel 파일로 변환
 */
export async function generateExcel(data: TestDocument): Promise<Blob> {
  try {
    console.log(`Excel 생성 시작: ${data.testItems.length}개 항목`);
    
    // 데이터 검증
    if (!data.testItems || !Array.isArray(data.testItems) || data.testItems.length === 0) {
      console.error('유효하지 않은 테스트 아이템 데이터:', data);
      throw new Error('유효하지 않은 테스트케이스 구조입니다.');
    }
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('테스트케이스');
    
    // 헤더 설정
    worksheet.columns = [
      { header: '번호', key: 'number', width: 10 },
      { header: '대분류', key: 'category', width: 15 },
      { header: '중분류', key: 'subCategory', width: 15 },
      { header: '소분류', key: 'smallCategory', width: 15 },
      { header: '항목내용', key: 'content', width: 40 },
      { header: '결과', key: 'result', width: 25 },
      { header: 'JIRA', key: 'jiraResult', width: 12 },
      { header: 'AD', key: 'adResult', width: 12 },
      { header: 'iOS', key: 'iosResult', width: 12 },
      { header: 'PC', key: 'pcResult', width: 12 }
    ];
    
    // 헤더 스타일링
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF808080' } // 회색 배경
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    
    // 세부 헤더 스타일링 (개별 셀)
    const headerCells = ['JIRA', 'AD', 'iOS', 'PC'];
    headerCells.forEach((header, index) => {
      const cell = headerRow.getCell(7 + index);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF404040' } // 더 진한 회색
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // 흰색 글씨
    });
    
    // 데이터 추가 (번호 확인 및 추가)
    data.testItems.forEach((item, index) => {
      try {
        // 번호 필드가 없거나 비어있으면 자동 생성
        if (!item.number || item.number.trim() === '') {
          item.number = `TC-${String(index + 1).padStart(2, '0')}`;
        }
        
        // 누락된 필드 보완
        const safeItem = {
          number: item.number,
          category: item.category || '분류 없음',
          subCategory: item.subCategory || '',
          smallCategory: item.smallCategory || '',
          content: item.content || '내용 없음',
          result: item.result || '',
          jiraResult: item.jiraResult || 'Not Tested',
          adResult: item.adResult || 'Not Tested',
          iosResult: item.iosResult || 'Not Tested',
          pcResult: item.pcResult || 'Not Tested'
        };
        
        const row = worksheet.addRow({
          number: safeItem.number,
          category: safeItem.category,
          subCategory: safeItem.subCategory,
          smallCategory: safeItem.smallCategory,
          content: safeItem.content,
          result: safeItem.result,
          jiraResult: safeItem.jiraResult,
          adResult: safeItem.adResult,
          iosResult: safeItem.iosResult,
          pcResult: safeItem.pcResult
        });
        
        // 번호 셀 스타일링
        const numberCell = row.getCell(1);
        numberCell.alignment = { vertical: 'middle', horizontal: 'center' };
        numberCell.font = { bold: true };
        
        // 결과 셀 스타일링
        const resultCells = ['jiraResult', 'adResult', 'iosResult', 'pcResult'];
        resultCells.forEach((key, index) => {
          const cell = row.getCell(7 + index);
          const resultValue = safeItem[key as keyof typeof safeItem] as string;
          
          // 결과에 따라 스타일 적용
          if (resultValue.includes('Pass')) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFCCFFCC' } // 연한 녹색
            };
          } else if (resultValue.includes('Fail')) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFCCCC' } // 연한 빨간색
            };
          } else { // Not Tested
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFEEEEEE' } // 연한 회색
            };
          }
          
          // 화살표 추가
          cell.value = resultValue.includes('▼') ? resultValue : resultValue + ' ▼';
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
      } catch (rowError) {
        console.error(`행 ${index + 2} 추가 중 오류:`, rowError);
        // 오류가 발생해도 계속 진행
      }
    });
    
    // 데이터가 없을 경우 샘플 데이터 추가
    if (data.testItems.length === 0 || (data.testItems.length === 1 && data.testItems[0].category === '파싱 오류')) {
      console.log('테스트케이스가 없거나 파싱 오류가 발생하여 샘플 데이터를 추가합니다.');
      
      // 샘플 데이터 추가
      const sampleData = [
        {
          number: 'TC-01',
          category: '아이템',
          subCategory: '장비아이템',
          smallCategory: '무기',
          content: '캐릭터가 무기 아이템을 인벤토리에서 장착 버튼으로 장착',
          result: '캐릭터 모델에 해당 무기가 적용되고 능력치가 증가됨',
          jiraResult: 'Pass ▼',
          adResult: 'Not Tested ▼',
          iosResult: 'Not Tested ▼',
          pcResult: 'Not Tested ▼'
        },
        {
          number: 'TC-02',
          category: '아이템',
          subCategory: '소비아이템',
          smallCategory: '포션',
          content: 'HP가 감소된 상태에서 HP 포션 사용',
          result: '캐릭터 HP가 포션 효과만큼 증가하고 인벤토리에서 해당 포션 수량 감소',
          jiraResult: 'Not Tested ▼',
          adResult: 'Fail ▼',
          iosResult: 'Not Tested ▼',
          pcResult: 'Not Tested ▼'
        },
        {
          number: 'TC-03',
          category: '아이템',
          subCategory: '재료아이템',
          smallCategory: '강화석',
          content: '장비 강화 UI에서 강화석을 이용한 무기 강화 시도',
          result: '정해진 확률에 따라 강화 성공/실패가 결정되고 강화석이 소모됨',
          jiraResult: 'Not Tested ▼',
          adResult: 'Not Tested ▼',
          iosResult: 'Not Tested ▼',
          pcResult: 'Not Tested ▼'
        }
      ];
      
      sampleData.forEach(item => {
        const row = worksheet.addRow(item);
        
        // 번호 셀 스타일링
        const numberCell = row.getCell(1);
        numberCell.alignment = { vertical: 'middle', horizontal: 'center' };
        numberCell.font = { bold: true };
        
        // 결과 셀 스타일링
        ['jiraResult', 'adResult', 'iosResult', 'pcResult'].forEach((key, index) => {
          const cell = row.getCell(7 + index);
          const resultValue = item[key as keyof typeof item] as string;
          
          // 결과에 따라 스타일 적용
          if (resultValue.includes('Pass')) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFCCFFCC' } // 연한 녹색
            };
          } else if (resultValue.includes('Fail')) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFCCCC' } // 연한 빨간색
            };
          } else { // Not Tested
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFEEEEEE' } // 연한 회색
            };
          }
          
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
      });
    }
    
    // 테두리 설정
    const rowCount = worksheet.rowCount;
    const columnCount = worksheet.columnCount;
    
    for (let i = 1; i <= rowCount; i++) {
      for (let j = 1; j <= columnCount; j++) {
        const cell = worksheet.getCell(i, j);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
    }
    
    // 텍스트 줄바꿈 설정
    worksheet.eachRow({ includeEmpty: true }, (row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.alignment = {
          ...cell.alignment,
          wrapText: true
        };
      });
    });
    
    // 항목 내용 열과 결과 열을 왼쪽 정렬로 설정
    worksheet.getColumn('content').alignment = { 
      vertical: 'top', 
      horizontal: 'left', 
      wrapText: true 
    };
    worksheet.getColumn('result').alignment = { 
      vertical: 'top', 
      horizontal: 'left', 
      wrapText: true 
    };
    
    // Excel 파일을 Blob으로 변환
    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  } catch (error) {
    console.error('Excel 생성 중 오류:', error);
    throw new Error('Excel 파일 생성 중 오류가 발생했습니다.');
  }
}