'use client';

import { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import FileUpload from '@/components/FileUpload';
import ProcessingStatus from '@/components/ProcessingStatus';
import DownloadButton from '@/components/DownloadButton';
import { TestDocument } from '@/types';

// 클라이언트 전용 컴포넌트로 동적 임포트
const MainContent = dynamic(() => import('@/components/MainContent'), { 
  ssr: false, // 클라이언트 사이드에서만 렌더링
  loading: () => <div className="flex justify-center mt-8">페이지를 불러오는 중...</div> 
});

export default function Home() {
  return (
    <Suspense fallback={<div className="flex justify-center mt-8">불러오는 중...</div>}>
      <MainContent />
    </Suspense>
  );
}