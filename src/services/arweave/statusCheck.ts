import type { EnhancedBookMetadata } from '../mint/types'

export interface DirectoryStatusResponse {
  status: string
  directoryStatus: {
    ready: boolean
    // other status fields
  }
  metadata: EnhancedBookMetadata
  message: string
}
export const checkArweaveStatus = async (
    txId: string, 
    type: 'public' | 'private' | 'turbo'
): Promise<DirectoryStatusResponse> => {
    const response = await fetch(
      `/.netlify/functions/check-status?txId=${txId}&type=${type}`
    );

    if (!response.ok) {
      throw new Error('Status check failed');
    }

    const data = await response.json();
    console.log('API Response:', data); // Let's see what we're getting
    return data;
};
