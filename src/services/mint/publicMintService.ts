import type { 
  EnhancedBookMetadata, 
  MintFiles, 
  PublicMintResponse, 
  DirectoryStatusResponse,
  InitializationResponse 
} from './types';
import type { WalletClient } from 'viem';
import { checkArweaveStatus } from '../arweave/statusCheck';

export const publicMintService = {
  initializeMint: async (
    metadata: EnhancedBookMetadata,
    walletClient: WalletClient
  ): Promise<InitializationResponse> => {
    if (!walletClient.account) {
      throw new Error('Wallet not connected');
    }

    const signature = await walletClient.signMessage({
      message: 'Initialize Public Mint',
      account: walletClient.account
    });

    const response = await fetch('/.netlify/functions/initializePublicMint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metadata, signature })
    });

    return response.json();
  },
  
  getMetadata: async (txId: string): Promise<EnhancedBookMetadata> => {
    const response = await fetch(`/.netlify/functions/get-metadata?txId=${txId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch metadata');
    }

    return response.json();
  },

  checkArweaveStatus: async (
    ids: string[],
    type: 'directory' | 'file'
  ): Promise<{ [id: string]: boolean }> => {
    const status = await checkArweaveStatus(ids[0], 'public');
    return { [ids[0]]: status.directoryStatus.ready };
  },

  uploadFiles: async (
    directoryId: string,
    files: MintFiles
  ): Promise<PublicMintResponse> => {
  const formData = new FormData();
  formData.append('coverImage', files.cover, files.cover.name);
  formData.append('pdfFile', files.pdf, files.pdf.name);
  formData.append('epubFile', files.epub, files.epub.name);
  formData.append('directoryId', directoryId);
    console.log('Uploading files:', {
      directoryId,
      fileNames: {
        cover: files.cover.name,
        pdf: files.pdf.name,
        epub: files.epub.name
      }
    });

    const response = await fetch('/.netlify/functions/completePublicMint', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Server error response:', errorText);
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    return response.json();
  }
};