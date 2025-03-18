'use client';

interface ProcessingStatusProps {
  isProcessing: boolean;
  status: string;
  error?: string;
}

export default function ProcessingStatus({ isProcessing, status, error }: ProcessingStatusProps) {
  // 에러가 있으면 에러 메시지 표시
  if (error) {
    return (
      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h3 className="text-sm font-medium text-red-800">오류가 발생했습니다</h3>
        </div>
        <p className="mt-2 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  // 처리 중이면 상태 메시지와 로딩 표시
  if (isProcessing) {
    return (
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center">
          <div className="relative">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
          </div>
          <h3 className="text-sm font-medium text-blue-800">처리 중...</h3>
        </div>
        <p className="mt-2 text-sm text-blue-700">{status}</p>
      </div>
    );
  }

  // 처리 중이 아니고 상태 메시지가 있으면 상태 메시지 표시
  if (status) {
    return (
      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <h3 className="text-sm font-medium text-green-800">완료</h3>
        </div>
        <p className="mt-2 text-sm text-green-700">{status}</p>
      </div>
    );
  }

  // 아무것도 표시하지 않음
  return null;
}