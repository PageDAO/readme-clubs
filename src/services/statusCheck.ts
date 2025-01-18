export interface ArweaveStatusResponse {
  status: 'success' | 'error';
  directoryStatus: {
    exists: boolean;
    ready: boolean;
    transactionStatus: string;
    message: string;
    type: 'public' | 'private' | 'turbo';
  };
  message: string;
}

export const checkArweaveStatus = async (
  txId: string, 
  type: 'public' | 'private' | 'turbo'
): Promise<ArweaveStatusResponse> => {
  const response = await fetch(
    `/.netlify/functions/check-status?txId=${txId}&type=${type}`
  );

  if (!response.ok) {
    throw new Error('Status check failed');
  }

  const data: ArweaveStatusResponse = await response.json();
  return data;
};