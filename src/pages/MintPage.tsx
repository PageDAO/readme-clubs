import React, { useState, useEffect } from 'react';
import { useAccount, useWalletClient, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '../config/contracts';
import { KEY_FACTORY_ABI } from '../config/abis';
import { MetadataCollector } from '../components/mint/metadata/MetadataCollector';
import { DirectoryStatus } from '../components/mint/DirectoryStatus';
import { FileUploader } from '../components/mint/FileUploader';
import { MintTypeSelector, MintType } from '../components/mint/MintTypeSelector';
import { publicMintService } from '../services/mint/publicMintService';
import type { EnhancedBookMetadata, PublicMintResponse } from '../services/mint/types';

const README_1155_ABI = [
  {
    inputs: [
      { internalType: 'string', name: 'title', type: 'string' },
      { internalType: 'string', name: 'author', type: 'string' },
      { internalType: 'string', name: 'arweaveHash', type: 'string' },
      { internalType: 'string', name: 'metadataURI', type: 'string' },
    ],
    name: 'mint',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  }
] as const;

const MintPage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { writeContract: mint, isPending: isMinting, data: mintHash } = useWriteContract();
  const { writeContract: createKeyToken } = useWriteContract();

  // Phase and type management
  const [phase, setPhase] = useState<'metadata' | 'directory' | 'upload'>('metadata');
  const [mintType, setMintType] = useState<MintType>(MintType.PUBLIC);
  
  // File states
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [epubFile, setEpubFile] = useState<File | null>(null);

  // Metadata states
  const [metadata, setMetadata] = useState<EnhancedBookMetadata | null>(null);
  const [mintTitle, setMintTitle] = useState<string>('');
  const [mintAuthor, setMintAuthor] = useState<string>('');
  const [coverArtist, setCoverArtist] = useState<string>('');
  const [tokenTicker, setTokenTicker] = useState<string>('');
  const [bookType, setBookType] = useState<string>('');

  // Progress and status states
  const [directoryId, setDirectoryId] = useState<string | null>(null);
  const [mintedTokenId, setMintedTokenId] = useState<bigint | null>(null);
  const [keyTokenSymbol, setKeyTokenSymbol] = useState<string>('');
  const [keyTokenAddress, setKeyTokenAddress] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  // Progress tracking states
  const [uploadProgress, setUploadProgress] = useState({
    cover: 0,
    pdf: 0,
    epub: 0,
    metadata: 0
  });

  const [fileInfo, setFileInfo] = useState<{
    coverSize: number;
    pdfSize: number;
    epubSize: number;
  }>({
    coverSize: 0,
    pdfSize: 0,
    epubSize: 0
  });

  // Transaction confirmation handling
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: mintHash,
  });

  // Progress update function
  const updateProgress = (type: keyof typeof uploadProgress, progress: number) => {
    setUploadProgress(prev => ({
      ...prev,
      [type]: progress
    }));
  };

  // File handlers with size tracking
  const handleCoverUpload = (file: File | null) => {
    setCoverImage(file);
    setFileInfo(prev => ({
      ...prev,
      coverSize: file?.size || 0
    }));
  };

  const handlePdfUpload = (file: File | null) => {
    setPdfFile(file);
    setFileInfo(prev => ({
      ...prev,
      pdfSize: file?.size || 0
    }));
  };

  const handleEpubUpload = (file: File | null) => {
    setEpubFile(file);
    setFileInfo(prev => ({
      ...prev,
      epubSize: file?.size || 0
    }));
  };
  // Derived key token name from title
  const keyTokenName = mintTitle ? `${mintTitle} Readme Club Key` : '';

  // Key token creation on successful mint
  useEffect(() => {
    if (isConfirmed && mintedTokenId) {
      createKeyToken({
        address: CONTRACTS.KEY_FACTORY as `0x${string}`,
        abi: KEY_FACTORY_ABI,
        functionName: 'createKeyToken',
        args: [
          CONTRACTS.README_1155,
          mintedTokenId,
          keyTokenName,
          keyTokenSymbol
        ],
      });
    }
  }, [isConfirmed, mintedTokenId]);

  const handleMetadataSubmit = async (metadata: EnhancedBookMetadata) => {
    if (!walletClient) return;
    
    try {
      const result = await publicMintService.initializeMint(metadata, walletClient);
      setMetadata(metadata);
      setDirectoryId(result.directoryId);
      setPhase('directory');
    } catch (error) {
      console.error('Failed to initialize mint:', error);
    }
  };

  const handleFileUploadComplete = async (uploadResult: PublicMintResponse) => {
    if (!walletClient || !metadata) return;

    setIsUploading(true);
    try {
      mint({
        address: CONTRACTS.README_1155 as `0x${string}`,
        abi: README_1155_ABI,
        functionName: 'mint',
        args: [
          metadata.title,
          metadata.author,
          uploadResult.metadataHash,
          uploadResult.contentHash
        ],
      });
    } catch (error) {
      console.error('Mint transaction failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-8">Mint a New NFT</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <MintTypeSelector selected={mintType} onSelect={setMintType} />

        {phase === 'metadata' && (
          <MetadataCollector 
            onMetadataComplete={handleMetadataSubmit}
            initialData={{
              title: mintTitle,
              author: mintAuthor,
              coverArtist,
              tokenTicker,
              bookType
            }}
          />
        )}

        {phase === 'directory' && directoryId && (
          <DirectoryStatus 
            directoryId={directoryId}
            onConfirmed={() => setPhase('upload')}
          />
        )}

        {phase === 'upload' && metadata && directoryId && (
          <FileUploader 
            metadata={metadata}
            directoryId={directoryId}
            onUploadComplete={handleFileUploadComplete}
            onFileSelect={{
              cover: handleCoverUpload,
              pdf: handlePdfUpload,
              epub: handleEpubUpload
            }}
            fileInfo={fileInfo}
            uploadProgress={uploadProgress}
            updateProgress={updateProgress}
          />
        )}

        {isConfirming && (
          <p className="mt-4 text-gray-600">Confirming transaction...</p>
        )}
        
        {isConfirmed && (
          <div className="mt-4 p-4 bg-green-50 rounded">
            <p className="text-green-600">NFT minted successfully!</p>
            <p className="text-sm break-all">Token ID: {mintedTokenId?.toString()}</p>
            {keyTokenAddress && (
              <p className="text-sm break-all">Key Token: {keyTokenAddress}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MintPage;


