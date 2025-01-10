import Arweave from 'arweave';
import type { WalletClient } from 'viem';
import { JWKInterface } from 'arweave/node/lib/wallet';

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
  timeout: 60000,
  logging: true,
});

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

const signatureToArweaveKey = (signature: `0x${string}`): JWKInterface => {
  const signatureBytes = Buffer.from(signature.slice(2), 'hex');
  return {
    kty: 'RSA',
    e: 'AQAB',
    n: Buffer.from(signatureBytes).toString('base64'),
    d: Buffer.from(signatureBytes).toString('base64')
  };
};

export const uploadBookContent = async (
  coverImage: File,
  pdfFile: File,
  epubFile: File,
  metadataInput: BookMetadataInput,
  walletClient: WalletClient,
  onProgress: (type: 'cover' | 'pdf' | 'epub' | 'metadata', progress: number) => void
) => {
  try {
    if (!walletClient.account) {
      throw new Error('No wallet account found');
    }

    const address = walletClient.account.address;
    const signedMessage = await walletClient.signMessage({
      message: 'Authorize Arweave upload',
      account: walletClient.account
    });

    const arweaveKey = signatureToArweaveKey(signedMessage);

    const uploadWithProgress = async (
      file: File,
      type: 'cover' | 'pdf' | 'epub',
      tags: { name: string; value: string }[]
    ) => {
      console.log(`Starting ${type} upload...`);
      const data = await file.arrayBuffer();
      const transaction = await arweave.createTransaction({ data });

      tags.forEach(tag => transaction.addTag(tag.name, tag.value));
      transaction.addTag('App', 'ReadmeBooks');
      transaction.addTag('Publisher', address);

      await arweave.transactions.sign(transaction, arweaveKey);
      
      const uploader = await arweave.transactions.getUploader(transaction);
      while (!uploader.isComplete) {
        await uploader.uploadChunk();
        const progress = (uploader.uploadedChunks / uploader.totalChunks) * 100;
        onProgress(type, Math.round(progress));
        console.log(`${type} upload progress: ${progress}%`);
      }

      return transaction.id;
    };

    console.log('Starting file uploads...');
    const results = await Promise.all([
      uploadWithProgress(coverImage, 'cover', [
        { name: 'Content-Type', value: coverImage.type },
        { name: 'Type', value: 'Book-Cover' }
      ]),
      uploadWithProgress(pdfFile, 'pdf', [
        { name: 'Content-Type', value: 'application/pdf' },
        { name: 'Book-Type', value: metadataInput.bookType }
      ]),
      uploadWithProgress(epubFile, 'epub', [
        { name: 'Content-Type', value: 'application/epub+zip' }
      ])
    ]);

    const [coverHash, pdfHash, epubHash] = results;
    console.log('File uploads complete', { coverHash, pdfHash, epubHash });

    onProgress('metadata', 50);
    const metadata = {
      ...metadataInput,
      coverHash,
      pdfHash,
      epubHash,
      version: '1.0',
      uploadTimestamp: Date.now(),
      publisher: address
    };

    const metadataTransaction = await arweave.createTransaction({
      data: JSON.stringify(metadata)
    });

    metadataTransaction.addTag('Content-Type', 'application/json');
    metadataTransaction.addTag('App', 'ReadmeBooks');
    metadataTransaction.addTag('Type', 'Book-Metadata');
    
    await arweave.transactions.sign(metadataTransaction, arweaveKey);
    await arweave.transactions.post(metadataTransaction);
    onProgress('metadata', 100);

    return {
      coverHash,
      pdfHash,
      epubHash,
      metadataHash: metadataTransaction.id,
      metadata
    };

  } catch (err: unknown) {
    const error = err as ArweaveError;
    console.error('Arweave upload error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });

    if (error.message.includes('insufficient funds')) {
      throw new Error('Insufficient funds for Arweave upload');
    }
    if (error.message.includes('network')) {
      throw new Error('Network error during upload');
    }
    throw new Error(`Upload failed: ${error.message || 'Unknown error occurred'}`);
  }
};

interface ArweaveError {
  message: string;
  name?: string;
  stack?: string;
  code?: string;
  type?: string;
}
