// 기존 인터페이스는 참조를 위해 유지하되 주석 처리
/*
export interface TestCase {
  id: string;
  name: string;
  preconditions: string;
  steps: string[];
  expectedResults: string;
}

export interface TestSuite {
  name: string;
  testCases: TestCase[];
}

export interface ParsedDocument {
  testSuites: TestSuite[];
}
*/

// 새로운 이미지 형식에 맞는 인터페이스
export interface TestItem {
  number: string;      // TC-01, TC-02 형식의 번호
  category: string;    // 대분류
  subCategory: string; // 중분류
  smallCategory: string; // 소분류 (비어있을 수 있음)
  content: string;     // 항목내용
  result: string;      // 결과
  jiraResult: string;  // JIRA 결과 (Pass, Not Tested 등)
  adResult: string;    // AD 결과
  iosResult: string;   // iOS 결과
  pcResult: string;    // PC 결과
}

export interface TestDocument {
  testItems: TestItem[];
}

export interface FileWithPreview extends File {
  preview?: string;
}