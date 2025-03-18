'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileWithPreview } from '@/types';

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  isProcessing: boolean;
}

export default function FileUpload({ onFileSelected, isProcessing }: FileUploadProps) {
  const [filePreview, setFilePreview] = useState<FileWithPreview | null>(null);
  
  // Dropzone 설정 및 파일 처리
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    // 첫 번째 파일만 처리
    const file = acceptedFiles[0];
    
    // 파일 확장자 검증
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.docx', '.doc'].includes(fileExtension)) {
      alert('지원되지 않는 파일 형식입니다. PDF, DOCX, DOC 파일만 지원합니다.');
      return;
    }
    
    // 파일 크기 검증 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기가 너무 큽니다. 최대 10MB까지 지원합니다.');
      return;
    }
    
    // 파일 미리보기 생성 (PDF 아이콘과 같은 미리보기 표시용)
    const fileWithPreview = file as FileWithPreview;
    fileWithPreview.preview = URL.createObjectURL(file);
    
    setFilePreview(fileWithPreview);
    
    // 상위 컴포넌트로 파일 전달
    onFileSelected(file);
  }, [onFileSelected]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    disabled: isProcessing,
    maxFiles: 1
  });
  
  return (
    <div className="mb-8">
      <div
        {...getRootProps()}
        className={`
          p-6 border-2 border-dashed rounded-lg text-center cursor-pointer
          transition-colors duration-200 ease-in-out
          ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {filePreview ? (
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-2">
              {filePreview.name.endsWith('.pdf') && (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                  <path d="M14 2v6h6M16 13H8v-1h8v1zm0 2H8v1h8v-1zm-4 3H8v1h4v-1z" />
                </svg>
              )}
              {(filePreview.name.endsWith('.docx') || filePreview.name.endsWith('.doc')) && (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                  <path d="M14 2v6h6M16 13H8v-1h8v1zm0 2H8v1h8v-1zm-4 3H8v1h4v-1z" />
                </svg>
              )}
            </div>
            <p className="text-sm font-medium text-gray-700">{filePreview.name}</p>
            <p className="text-xs text-gray-500 mt-1">
              {(filePreview.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-lg font-medium text-gray-700">
              {isDragActive ? '여기에 파일을 놓으세요' : '파일을 드래그하거나 클릭하여 업로드'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              지원 형식: PDF, DOCX, DOC (최대 10MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}