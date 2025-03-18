import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { TestDocument } from '../types';

// 서버 측 API 키 사용 (클라이언트에 노출되지 않음)
const API_KEY = process.env.GEMINI_API_KEY || '';

// Gemini 모델 초기화
let genAI: GoogleGenerativeAI;
let model: GenerativeModel;

try {
  if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }
} catch (error) {
  console.error('Gemini API 초기화 오류:', error);
}

/**
 * JSON 문자열을 정제하고 유효한 JSON으로 변환하는 함수
 */
function sanitizeAndFixJson(jsonString: string): string {
  console.log('원본 JSON 문자열 길이:', jsonString.length);
  
  // 코드 블록 제거 (```json과 같은 마크다운 코드 블록)
  let sanitized = jsonString.replace(/```(json)?|```/g, '');
  
  // 줄바꿈과 공백 정규화
  sanitized = sanitized.trim();
  
  // JSON 구조 내에서 일반적인 오류 수정 시도
  try {
    // 1. 불필요한 텍스트 제거 (JSON 객체 시작 이전 또는 이후의 텍스트)
    const jsonStart = sanitized.indexOf('{');
    const jsonEnd = sanitized.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      sanitized = sanitized.substring(jsonStart, jsonEnd + 1);
    }
    
    // 2. 따옴표 수정 (잘못된 따옴표 교체)
    sanitized = sanitized.replace(/[""]/g, '"');
    
    // 3. 잘못된 이스케이프 문자 수정
    sanitized = sanitized.replace(/\\([^"\\/bfnrtu])/g, '$1');
    
    // 4. 중복된 쉼표 제거
    sanitized = sanitized.replace(/,\s*,/g, ',');
    
    // 5. 배열 끝의 쉼표 제거
    sanitized = sanitized.replace(/,\s*\]/g, ']');
    
    // 6. 객체 끝의 쉼표 제거
    sanitized = sanitized.replace(/,\s*\}/g, '}');
    
    // 안전 확인: 유효한 JSON인지 파싱 시도
    try {
      JSON.parse(sanitized);
      console.log('JSON 정제 성공');
    } catch (e) {
      console.error('정제 후에도 JSON 파싱 오류 발생:', e);
      // 추가 수정 시도는 하지 않음
    }
    
    return sanitized;
  } catch (e) {
    console.error('JSON 정제 중 오류:', e);
    return jsonString; // 원본 반환
  }
}

/**
 * 텍스트에서 JSON 객체 추출 시도
 */
function extractJsonFromText(text: string): any {
  // JSON 객체 추출을 시도
  try {
    // 가능한 JSON 시작점 찾기 (첫 번째 중괄호)
    const jsonStartIdx = text.indexOf('{');
    if (jsonStartIdx === -1) return null;
    
    // 중첩 중괄호를 처리하기 위한 카운터
    let openBraces = 0;
    let jsonEndIdx = -1;
    
    // 문자열 끝까지 순회하며 중괄호 균형 확인
    for (let i = jsonStartIdx; i < text.length; i++) {
      if (text[i] === '{') openBraces++;
      else if (text[i] === '}') {
        openBraces--;
        // 모든 중괄호가 닫혔을 때 종료 인덱스 설정
        if (openBraces === 0) {
          jsonEndIdx = i;
          break;
        }
      }
    }
    
    // 유효한 JSON 범위를 찾지 못한 경우
    if (jsonEndIdx === -1) return null;
    
    // 추출된 텍스트에서 JSON 파싱 시도
    const jsonString = text.substring(jsonStartIdx, jsonEndIdx + 1);
    const sanitized = sanitizeAndFixJson(jsonString);
    return JSON.parse(sanitized);
  } catch (e) {
    console.error('JSON 추출 실패:', e);
    return null;
  }
}

/**
 * 기획서 텍스트를 Gemini API를 통해 테스트케이스 JSON으로 변환
 */
export async function generateTestCases(documentText: string): Promise<TestDocument> {
  if (!API_KEY) {
    throw new Error('Gemini API 키가 설정되지 않았습니다.');
  }

  if (!model) {
    throw new Error('Gemini API 모델 초기화에 실패했습니다.');
  }

  try {
    const prompt = `
당신은 기획서를 테스트케이스로 변환하는 전문가입니다. 다음 기획서 내용을 철저히 분석하여 모든 테스트케이스를 JSON 형식으로 생성해주세요.

기획서 내용:
${documentText}

다음 JSON 형식으로 테스트케이스를 구성해주세요:
{
  "testItems": [
    {
      "number": "TC-01",
      "category": "아이템", 
      "subCategory": "장비아이템", 
      "smallCategory": "무기", 
      "content": "캐릭터가 무기 아이템을 인벤토리에서 장착 버튼으로 장착", 
      "result": "캐릭터 모델에 해당 무기가 적용되고 능력치가 증가됨", 
      "jiraResult": "Not Tested", 
      "adResult": "Not Tested", 
      "iosResult": "Not Tested", 
      "pcResult": "Not Tested" 
    },
    {
      "number": "TC-02",
      "category": "아이템", 
      "subCategory": "소비아이템", 
      "smallCategory": "포션", 
      "content": "HP가 감소된 상태에서 HP 포션 사용", 
      "result": "캐릭터 HP가 포션 효과만큼 증가하고 인벤토리에서 해당 포션 수량 감소", 
      "jiraResult": "Not Tested", 
      "adResult": "Not Tested", 
      "iosResult": "Not Tested", 
      "pcResult": "Not Tested" 
    }
  ]
}

기획서의 내용을 분석하여 다음 규칙에 따라 테스트케이스를 생성해주세요:

1. 번호(number)는 "TC-01", "TC-02"와 같은 형식으로 순차적으로 부여합니다.
2. 대분류(category)는 주요 시스템이나 기능 카테고리 (예: 아이템, 퀘스트, 상점, 인벤토리 등)
3. 중분류(subCategory)는 시스템 내 세부 카테고리 (예: 장비아이템, 소비아이템, 재료아이템 등)
4. 소분류(smallCategory)는 더 세부적인 분류 (예: 무기, 방어구, 포션, 스크롤 등)
5. 항목내용(content)은 구체적인 테스트 시나리오로, 사용자 행동 위주로 설명
6. 결과(result)는 해당 테스트의 기대 결과나 확인 방법을 명확하게 설명
7. 각 플랫폼별 결과(jiraResult, adResult, iosResult, pcResult)는 모두 "Not Tested"로 설정하세요.

중요한 가이드라인:
- 기획서의 모든 내용을 커버하는 완전한 테스트케이스 세트를 생성해야 합니다.
- 기획서에서 설명된 각 기능, 동작, 시나리오에 대해 최소 하나 이상의 테스트케이스를 작성하세요.
- 기획서에 명시적으로 서술되지 않은 일반적인 예외 케이스도 포함하세요 (오류 처리, 경계값 등).
- 테스트케이스는 최소 10개, 최대 50개까지 생성할 수 있으며, 기획서의 복잡도에 따라 조정하세요.
- 모든 필드를 반드시 작성하세요(번호 포함).
- 특수문자, 줄바꿈, 따옴표를 최소화하고 간결하게 작성하세요.
- 테스트 내용(content)은 '어떤 조건에서 무엇을 했을 때'와 같은 형식으로 작성하세요.
- 결과(result)는 '어떤 결과가 나타난다'와 같은 형식으로 작성하세요.
- 유효한 JSON 형식으로 반환하는 것이 가장 중요합니다.

기획서의 내용에 따라 관련 있는 테스트케이스를 빠짐없이 생성하세요. 모든 테스트케이스는 검증 가능하고 구체적이어야 합니다.
`;

    // API 호출 전 로깅 추가
    console.log('Gemini API 호출 시작...');
    
    // 최신 API 사용법으로 업데이트
    const result = await model.generateContent({
      contents: [{ text: prompt }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
      }
    });
    
    // 응답 텍스트 추출 방식 업데이트
    const responseText = result.response.text();
    
    // 디버깅을 위한 로깅 추가
    console.log('Gemini API 응답 텍스트 (일부):', responseText.substring(0, 200) + '...');
    
    // 다양한 방법으로 JSON 파싱 시도
    try {
      // 방법 1: 직접 JSON 파싱 시도
      try {
        const parsedJson = JSON.parse(responseText) as TestDocument;
        if (parsedJson.testItems && Array.isArray(parsedJson.testItems)) {
          console.log('직접 JSON 파싱 성공');
          return parsedJson;
        }
      } catch (e) {
        console.log('직접 JSON 파싱 실패, 다른 방법 시도');
      }
      
      // 방법 2: JSON 문자열 추출 후 파싱
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        console.log('추출된 JSON 문자열 (일부):', jsonString.substring(0, 200) + '...');
        
        try {
          const sanitizedJson = sanitizeAndFixJson(jsonString);
          const parsedJson = JSON.parse(sanitizedJson) as TestDocument;
          
          if (parsedJson.testItems && Array.isArray(parsedJson.testItems)) {
            console.log('JSON 정제 후 파싱 성공');
            return parsedJson;
          }
        } catch (e) {
          console.error('정제된 JSON 파싱 오류:', e);
        }
      }
      
      // 방법 3: 텍스트에서 JSON 추출 시도
      const extractedJson = extractJsonFromText(responseText);
      if (extractedJson && extractedJson.testItems && Array.isArray(extractedJson.testItems)) {
        console.log('JSON 추출 성공');
        return extractedJson as TestDocument;
      }
      
      // 모든 방법 실패 시 기본 테스트케이스 반환
      console.log('모든 JSON 파싱 방법 실패, 기본 테스트케이스 반환');
      return {
        testItems: [
          {
            number: "TC-01",
            category: "파싱 오류",
            subCategory: "기본 테스트케이스",
            smallCategory: "",
            content: "Gemini API 응답 파싱 실패",
            result: "파싱 오류로 인해 기본 테스트케이스가 생성되었습니다.",
            jiraResult: "Not Tested",
            adResult: "Not Tested",
            iosResult: "Not Tested",
            pcResult: "Not Tested"
          }
        ]
      };
    } catch (error) {
      console.error('Gemini API 응답 처리 중 오류:', error);
      throw new Error('Gemini API 응답을 처리하는 중 오류가 발생했습니다.');
    }
  } catch (error) {
    console.error('Gemini API 호출 중 오류:', error);
    throw new Error('Gemini API 호출 중 오류가 발생했습니다.');
  }
}