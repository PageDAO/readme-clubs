import { useState, useEffect } from 'react';

interface MintProgressProps {
  uploadProgress: {
    cover: number;
    pdf: number;
    epub: number;
    metadata: number;
  };
  isUploading: boolean;
  isMinting: boolean;
  isConfirming: boolean;
  fileInfo?: {
    coverSize: number;
    pdfSize: number;
    epubSize: number;
  };
}

const MintProgress: React.FC<MintProgressProps> = ({
  uploadProgress,
  isUploading,
  isMinting,
  isConfirming,
  fileInfo
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (fileInfo && isUploading) {
      const totalSize = fileInfo.coverSize + fileInfo.pdfSize + fileInfo.epubSize;
      const avgProgress = (uploadProgress.cover + uploadProgress.pdf + uploadProgress.epub) / 3;
      const estimatedSeconds = (totalSize / 1000000) * (100 - avgProgress) / 10;
      setTimeRemaining(Math.ceil(estimatedSeconds));
    }
  }, [uploadProgress, fileInfo]);

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
      <div className="space-y-6">
        {/* Step Indicators */}
        <div className="flex justify-between">
          {['Upload Files', 'Arweave Confirmation', 'NFT Minting', 'Key Creation'].map((step, index) => (
            <div key={step} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                (isUploading && index === 0) ||
                (isConfirming && index === 1) ||
                (isMinting && index === 2)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
              }`}>
                {index + 1}
              </div>
              <span className="text-sm mt-2">{step}</span>
            </div>
          ))}
        </div>

        {/* Progress Bars */}
        {isUploading && (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Cover Image</span>
                <span>{uploadProgress.cover}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.cover}%` }}
                />
              </div>
            </div>
            
            {/* Similar blocks for PDF and EPUB */}
            
            {timeRemaining && (
              <div className="text-sm text-gray-600">
                Estimated time remaining: {timeRemaining} seconds
              </div>
            )}
          </div>
        )}

        {/* Status Messages */}
        <div className="text-sm">
          {isUploading && <p>Uploading to Arweave...</p>}
          {isConfirming && <p>Confirming transaction...</p>}
          {isMinting && <p>Minting NFT...</p>}
        </div>
      </div>
    </div>
  );
};

export default MintProgress;
