'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import FileUpload from '@/components/FileUpload';
import ProcessingStatus from '@/components/ProcessingStatus';
import DownloadButton from '@/components/DownloadButton';
import { TestDocument } from '@/types';

export default function MainContent() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [excelBlob, setExcelBlob] = useState<Blob | null>(null);
  const [fileName, setFileName] = useState('testcases.xlsx');
  const [retryCount, setRetryCount] = useState(0);
  const [shouldRetry, setShouldRetry] = useState(false);
  
  // useRef를 사용하여 최신 상태를 참조할 수 있게 함
  const currentFileRef = useRef<File | null>(null);
  const retryCountRef = useRef(0);

  // 재시도 로직을 useEffect로 분리
  useEffect(() => {
    // 파일과 재시도 플래그가 있을 때만 실행
    if (shouldRetry && currentFileRef.current) {
      const timer = setTimeout(() => {
        if (currentFileRef.current) {
          processFile(currentFileRef.current);
        }
        setShouldRetry(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [shouldRetry]); // processFile은 의존성 배열에서 제거

  // 파일 처리 로직
  const processFile = useCallback(async (file: File) => {
    if (!file) return;
    
    // 현재 파일을 ref에 저장
    currentFileRef.current = file;
    
    // 상태 초기화
    setIsProcessing(true);
    setStatus('파일 업로드 중...');
    setError(undefined);
    setExcelBlob(null);
    
    try {
      setFileName(`${file.name.split('.')[0]}_testcases.xlsx`);
      
      // FormData 생성
      const formData = new FormData();
      formData.append('file', file);
      
      // 파일 크기 검증
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('파일 크기가 너무 큽니다. 최대 10MB까지 지원합니다.');
      }
      
      // 파일 확장자 검증
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!['.pdf', '.docx', '.doc'].includes(fileExtension)) {
        throw new Error('지원되지 않는 파일 형식입니다. PDF, DOCX, DOC 파일만 지원합니다.');
      }
      
      // 파일 업로드 및 처리 요청
      setStatus('기획서 내용을 분석 중입니다...');
      console.log('파일 업로드 시작:', file.name, file.type, file.size);
      
      try {
        // 1. 파일 업로드 및 테스트케이스 생성
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        // 응답이 OK가 아니면 텍스트로 읽어서 오류 메시지 추출
        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('API 오류 응답:', errorText);
          
          let errorMessage = '파일 처리 중 오류가 발생했습니다.';
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch (e) {
            // JSON 파싱 실패 시 텍스트 그대로 사용
            if (errorText && errorText.length < 100) {
              errorMessage = errorText;
            }
          }
          
          throw new Error(errorMessage);
        }
        
        // 응답 텍스트 먼저 읽기
        const responseText = await uploadResponse.text();
        console.log('API 응답 텍스트 (일부):', responseText.substring(0, 100));
        
        // 응답을 JSON으로 파싱
        let uploadData;
        try {
          uploadData = JSON.parse(responseText);
        } catch (e) {
          console.error('JSON 파싱 오류:', e);
          throw new Error('서버 응답을 파싱할 수 없습니다.');
        }
        
        // 테스트케이스 데이터 확인
        if (!uploadData.testItems) {
          console.error('서버에서 testItems가 반환되지 않음:', uploadData);
          throw new Error('서버에서 테스트케이스 데이터를 반환하지 않았습니다.');
        }
        
        const testItems = uploadData.testItems;
        const itemCount = testItems.length || 0;
        
        setStatus(`테스트케이스 ${itemCount}개를 Excel로 변환 중...`);
        console.log(`테스트케이스 ${itemCount}개 생성됨, Excel 변환 시작`);
        
        // 2. Excel 파일 생성 요청
        const generateResponse = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ testItems })
        });
        
        // 응답이 OK가 아닐 경우 오류 처리
        if (!generateResponse.ok) {
          const errorText = await generateResponse.text();
          console.error('Excel 생성 API 오류 응답:', errorText);
          
          let errorMessage = 'Excel 파일 생성 중 오류가 발생했습니다.';
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch (e) {
            // JSON 파싱 실패 시 텍스트 그대로 사용
            if (errorText && errorText.length < 100) {
              errorMessage = errorText;
            }
          }
          
          throw new Error(errorMessage);
        }
        
        // Blob 형태로 Excel 파일 받기
        const blob = await generateResponse.blob();
        console.log('Excel 파일 생성 완료, 크기:', blob.size);
        
        if (blob.size < 100) {
          throw new Error('생성된 Excel 파일이 너무 작습니다. 다시 시도해주세요.');
        }
        
        // 상태 업데이트
        setExcelBlob(blob);
        setStatus(`테스트케이스 ${itemCount}개가 포함된 Excel 파일이 생성되었습니다!`);
        // 재시도 카운트 초기화
        setRetryCount(0);
        retryCountRef.current = 0;
      } catch (fetchError) {
        console.error('API 호출 오류:', fetchError);
        
        // 현재 재시도 횟수를 ref에서 가져옴
        const currentRetryCount = retryCountRef.current;
        
        // 재시도 로직
        if (currentRetryCount < 2) {
          setStatus('오류가 발생했습니다. 자동으로 다시 시도합니다...');
          // 재시도 카운트 업데이트
          const newRetryCount = currentRetryCount + 1;
          setRetryCount(newRetryCount);
          retryCountRef.current = newRetryCount;
          
          // 재시도 플래그 설정
          setShouldRetry(true);
          return;
        }
        
        throw fetchError;
      }
    } catch (err) {
      console.error('처리 오류:', err);
      setError(err instanceof Error ? err.message : '처리 중 오류가 발생했습니다.');
      setStatus('오류가 발생했습니다');
    } finally {
      if (!shouldRetry) {
        setIsProcessing(false);
      }
    }
  }, []);

  // 파일 선택 핸들러
  const handleFileSelected = useCallback((file: File) => {
    processFile(file);
  }, [processFile]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 sm:p-24">
      <div className="w-full max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">기획서 테스트케이스 변환기</h1>
        <p className="text-gray-600 text-center mb-8">
          기획서 문서를 업로드하면 테스트케이스 Excel 파일로 변환해드립니다.
        </p>
        
        <FileUpload 
          onFileSelected={handleFileSelected}
          isProcessing={isProcessing}
        />
        
        <ProcessingStatus
          isProcessing={isProcessing}
          status={status}
          error={error}
        />
        
        <DownloadButton
          excelBlob={excelBlob}
          fileName={fileName}
        />
        
        {error && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-gray-700">
            <p className="font-medium mb-1">문제가 지속되면 다음을 확인해보세요:</p>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li>PDF나 DOCX 파일 형식이 올바른지 확인하세요.</li>
              <li>문서에 내용이 충분한지 확인하세요.</li>
              <li>특수문자가 많은 경우 일부 제거 후 시도해보세요.</li>
              <li>파일 크기가 10MB 이하인지 확인하세요.</li>
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}