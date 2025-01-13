import type { WalletClient } from 'viem';

export interface BookMetadata {
  title: string;
  author: string;
  coverArtist: string;
  description?: string;
  bookHash: string;
  epubHash: string;
  coverHash: string;
  contentType: string;
  language: string;
  genre?: string;
  bookType: string;
  attributes?: Record<string, any>;
  version: string;
  uploadTimestamp: number;
}

export interface BookMetadataInput {
  title: string;
  author: string;
  coverArtist: string;
  bookType: string;
  description?: string;
  language?: string;
  genre?: string;
  attributes?: Record<string, any>;
}

export interface UploadResponse {
  coverHash: string;
  pdfHash: string;
  epubHash: string;
  metadataHash: string;
  driveId: string;
}

export const uploadBookContent = async (
  coverImage: File,
  pdfFile: File,
  epubFile: File,
  metadataInput: BookMetadataInput,
  walletClient: WalletClient,
  onProgress: (type: 'cover' | 'pdf' | 'epub' | 'metadata', progress: number) => void
): Promise<UploadResponse> => {
  try {
    if (!walletClient.account) {
      throw new Error('No wallet account found');
    }

    const formData = new FormData();
    formData.append('coverImage', coverImage);
    formData.append('pdfFile', pdfFile);
    formData.append('epubFile', epubFile);
    formData.append('metadata', JSON.stringify(metadataInput));

    const signature = await walletClient.signMessage({
      message: 'Upload Authorization',
      account: walletClient.account
    });

    formData.append('signature', signature);
    formData.append('walletAddress', walletClient.account.address);

    const response = await fetch('http://localhost:4000/.netlify/functions/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Server error response:', errorText);
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    // Simulate progress updates while the serverless function processes the upload
    const progressInterval = setInterval(() => {
      ['cover', 'pdf', 'epub', 'metadata'].forEach((type) => {
        onProgress(type as any, Math.random() * 100);
      });
    }, 2000);

    const result = await response.json();
    
    // Clear progress interval and set all to 100%
    clearInterval(progressInterval);
    ['cover', 'pdf', 'epub', 'metadata'].forEach((type) => {
      onProgress(type as any, 100);
    });

    return result;
  } catch (err: unknown) {
    const error = err as { message: string; name?: string; stack?: string };
    console.error('Upload error:', error);
    throw new Error(`Upload failed: ${error.message || 'Unknown error occurred'}`);
  }
};
