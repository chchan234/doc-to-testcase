'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileWithPreview } from '../types';

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  isProcessing: boolean;
}

export default function FileUpload({ onFileSelected, isProcessing }: FileUploadProps) {
  const [file, setFile] = useState<FileWithPreview | null>(null);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      const fileWithPreview = Object.assign(selectedFile, {
        preview: URL.createObjectURL(selectedFile)
      }) as FileWithPreview;
      
      setFile(fileWithPreview);
      onFileSelected(selectedFile);
    }
  }, [onFileSelected]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxFiles: 1,
    disabled: isProcessing
  });
  
  return (
    <div className="w-full max-w-xl mx-auto">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {file ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              <span className="text-sm font-medium text-gray-900">{file.name}</span>
              <span className="ml-2 text-xs text-gray-500">
                ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </div>
            <p className="text-xs text-gray-500">파일을 변경하려면 클릭하거나 파일을 끌어다 놓으세요</p>
          </div>
        ) : (
          <div className="space-y-2">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              stroke="currentColor" 
              fill="none" 
              viewBox="0 0 48 48" 
              aria-hidden="true"
            >
              <path 
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                strokeWidth={2} 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
            <p className="text-sm text-gray-600">
              <span className="font-medium">클릭하여 파일 선택</span> 또는 파일을 여기로 끌어다 놓으세요
            </p>
            <p className="text-xs text-gray-500">PDF, DOCX, DOC 파일 (최대 10MB)</p>
          </div>
        )}
      </div>
    </div>
  );
}