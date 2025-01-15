import { useState } from 'react';
import { publicMintService } from '../../services/mint/publicMintService';
import type { EnhancedBookMetadata } from '../../services/mint/types';

export const FileUploader: React.FC<{
  metadata: EnhancedBookMetadata;
  directoryId: string;
}> = ({ metadata, directoryId }) => {
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

  const handleUpload = async () => {
    if (!files.cover || !files.pdf || !files.epub) {
      return;
    }

    const result = await publicMintService.uploadFiles(directoryId, {
      cover: files.cover,
      pdf: files.pdf,
      epub: files.epub
    });
  
    // Monitor upload status
    const fileIds = Object.values(result.files).map(f => f.fileId);
    const status = await publicMintService.checkArweaveStatus(fileIds, 'file');
  };
  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-6">
      <h2 className="text-xl font-bold">Upload Files</h2>
      
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
