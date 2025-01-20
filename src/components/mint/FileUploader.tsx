import { useState } from 'react';
import { publicMintService } from '../../services/mint/publicMintService';
import type { EnhancedBookMetadata, PublicMintResponse } from '../../services/mint/types';
import { FileUploadSection } from './FileUploadSection';

interface FileUploaderProps {
  metadata: EnhancedBookMetadata;
  directoryId: string;
  onUploadComplete: (result: PublicMintResponse) => void;
  onFileSelect: {
    cover: (file: File | null) => void;
    pdf: (file: File | null) => void;
    epub: (file: File | null) => void;
  };
  fileInfo: {
    coverSize: number;
    pdfSize: number;
    epubSize: number;
  };
  uploadProgress: {
    cover: number;
    pdf: number;
    epub: number;
    metadata: number;
  };
  updateProgress: (type: "cover" | "pdf" | "epub" | "metadata", progress: number) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  metadata,
  directoryId,
  onUploadComplete,
  onFileSelect,
  fileInfo,
  uploadProgress,
  updateProgress
}) => {
  const [files, setFiles] = useState<{
    cover: File | null;
    pdf: File | null;
    epub: File | null;
  }>({
    cover: null,
    pdf: null,
    epub: null
  });

  const [uploadStatus, setUploadStatus] = useState<{
    [key: string]: { progress: number; fileId?: string }
  }>({});

  const validateFileType = {
    cover: (file: File) => ['image/jpeg', 'image/png'].includes(file.type),
    pdf: (file: File) => file.type === 'application/pdf',
    epub: (file: File) => file.type === 'application/epub+zip'
  };

  const handleUpload = async () => {
    console.log('Starting upload with fileInfo:', fileInfo);
    console.log('Current files state:', files);
    
    // First verify we have all files
    if (!allFilesSelected) return;

    // Get the actual files from FileUploadSection components
    const filesToUpload = {
      cover: files.cover!,
      pdf: files.pdf!,
      epub: files.epub!
    };

    console.log('Files to upload:', {
      cover: filesToUpload.cover?.name,
      pdf: filesToUpload.pdf?.name,
      epub: filesToUpload.epub?.name
    });

    try {
      const result = await publicMintService.uploadFiles(directoryId, filesToUpload);
      console.log('Upload result:', result);

      if (result?.files) {
        const fileIds = Object.values(result.files).map(f => f.fileId);
        const status = await publicMintService.checkArweaveStatus(fileIds, 'file');
        
        if (Object.values(status).every(s => s)) {
          onUploadComplete(result);
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };
  const allFilesSelected = fileInfo.coverSize > 0 && fileInfo.pdfSize > 0 && fileInfo.epubSize > 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-6">
      <h2 className="text-xl font-bold">Upload Files for {metadata.title}</h2>
      <div className="grid grid-cols-1 gap-6">
        <FileUploadSection 
          type="cover"
          accept="image/jpeg,image/png"
          validate={validateFileType.cover}
          onFileSelect={(file) => {
            console.log('Cover file selected:', file)
            onFileSelect.cover(file)
            setFiles(prev => {
              console.log('Previous files state:', prev)
              const newState = { ...prev, cover: file }
              console.log('New files state:', newState)
              return newState
            })
          }}
          progress={uploadProgress.cover}
        />
        
        <FileUploadSection 
          type="pdf"
          accept="application/pdf"
          validate={validateFileType.pdf}
          onFileSelect={(file) => {
            onFileSelect.pdf(file)
            setFiles(prev => ({ ...prev, pdf: file }))
          }}
          progress={uploadProgress.pdf}
        />
        
        <FileUploadSection 
          type="epub"
          accept="application/epub+zip"
          validate={validateFileType.epub}
          onFileSelect={(file) => {
            onFileSelect.epub(file)
            setFiles(prev => ({ ...prev, epub: file }))
          }}
          progress={uploadProgress.epub}
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={!allFilesSelected}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400 transition-colors"
      >
        {allFilesSelected ? 'Upload Files' : 'Select All Required Files'}
      </button>
    </div>
  );
};
