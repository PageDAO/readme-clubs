import { useState } from 'react';
import { publicMintService } from '../../services/mint/publicMintService';
import type { EnhancedBookMetadata, PublicMintResponse } from '../../services/mint/types';


interface FileUploaderProps {
  metadata: EnhancedBookMetadata
  directoryId: string
  onUploadComplete: (result: PublicMintResponse) => void
  onFileSelect: {
    cover: (file: File | null) => void
    pdf: (file: File | null) => void
    epub: (file: File | null) => void
  }
  fileInfo: {
    coverSize: number
    pdfSize: number
    epubSize: number
  }
  uploadProgress: {
    cover: number
    pdf: number
    epub: number
    metadata: number
  }
  updateProgress: (type: "cover" | "pdf" | "epub" | "metadata", progress: number) => void
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  metadata,
  directoryId,
  onUploadComplete,
  onFileSelect,
  fileInfo,
  uploadProgress,
  updateProgress
}) => {  const [files, setFiles] = useState<{
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

  const handleUpload = async () => {
    if (!files.cover || !files.pdf || !files.epub) return;

    const result = await publicMintService.uploadFiles(directoryId, {
      cover: files.cover,
      pdf: files.pdf,
      epub: files.epub
    });
  
    // Monitor upload status
    const fileIds = Object.values(result.files).map(f => f.fileId);
    const status = await publicMintService.checkArweaveStatus(fileIds, 'file');
    
    if (Object.values(status).every(s => s)) {
      onUploadComplete(result);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-6">
      <h2 className="text-xl font-bold">Upload Files for {metadata.title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['cover', 'pdf', 'epub'].map((type) => (
          <div key={type} className="border-2 border-dashed p-4 rounded">
            <input
              type="file"
              onChange={(e) => setFiles(prev => ({
                ...prev,
                [type]: e.target.files?.[0] || null
              }))}
            />
            {uploadStatus[type]?.progress > 0 && (
              <div className="mt-2">
                Progress: {uploadStatus[type].progress}%
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleUpload}
        disabled={!files.cover || !files.pdf || !files.epub}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        Upload Files
      </button>
    </div>
  );
};