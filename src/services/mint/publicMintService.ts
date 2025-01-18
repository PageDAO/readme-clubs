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
  },  checkArweaveStatus: async (
    ids: string[], 
    type: 'directory' | 'file'
  ): Promise<{ [id: string]: boolean }> => {
    const status = await checkArweaveStatus(ids[0], 'public');
    return { [ids[0]]: status };
  },
  uploadFiles: async (
    directoryId: string, 
    files: MintFiles
  ): Promise<PublicMintResponse> => {
    const formData = new FormData();
    formData.append('directoryId', directoryId);
    formData.append('coverFile', files.cover);
    formData.append('pdfFile', files.pdf);
    formData.append('epubFile', files.epub);

    const response = await fetch('/.netlify/functions/completePublicMint', {
      method: 'POST',
      body: formData
    });

    return response.json();
  }
};