'use client';

interface DownloadButtonProps {
  excelBlob: Blob | null;
  fileName: string;
}

export default function DownloadButton({ excelBlob, fileName }: DownloadButtonProps) {
  // Blob이 없으면 버튼을 표시하지 않음
  if (!excelBlob) {
    return null;
  }

  // 다운로드 핸들러
  const handleDownload = () => {
    // 다운로드 링크 생성
    const url = URL.createObjectURL(excelBlob);
    
    // 가상의 링크 요소 생성 및 클릭
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    
    // 메모리 정리
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center mt-6">
      <div className="mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-green-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
          <path d="M14 2v6h6" />
          <path d="M12 18v-6M9 15l3 3 3-3" />
        </svg>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">
        테스트케이스 Excel 파일이 생성되었습니다!
      </p>
      
      <button
        onClick={handleDownload}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
      >
        테스트케이스 다운로드
      </button>
      
      <p className="text-xs text-gray-500 mt-2">
        {fileName}
      </p>
    </div>
  );
}