export enum MintType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  TURBO = 'turbo'
}

export interface EnhancedBookMetadata {
  title: string;
  author: string;
  coverArtist: string;
  language: {
    code: string;
    name: string;
  };
  bisacCodes: Array<{
    code: string;
    description: string;
  }>;
  description: string;
  bookType: string;
  keywords: string[];
  series?: {
    name: string;
    position: number;
  };
}

export interface MintFiles {
  cover: File;
  pdf: File;
  epub: File;
}

export interface FileUploadResponse {
  fileId: string;
  txId: string;
}

export interface PublicMintResponse {
  contentHash: string;
  metadataHash: string;
  files: {
    [key: string]: {
      fileId: string;
      status: string;
    }
  }
}
