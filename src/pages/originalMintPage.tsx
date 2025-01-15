
import React, { useState, useEffect } from 'react';
import { useAccount, useWalletClient, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { CONTRACTS } from '../config/contracts';
import { KEY_FACTORY_ABI } from '../config/abis';
import { uploadBookContent, type BookMetadataInput } from '../services/arweaveService';
import MintProgress from '../components/MintProgress';

// ABI for Readme1155v1 contract
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
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'getBookDetails',
    outputs: [
      {
        components: [
          { internalType: 'string', name: 'title', type: 'string' },
          { internalType: 'string', name: 'author', type: 'string' },
          { internalType: 'string', name: 'arweaveHash', type: 'string' },
          { internalType: 'string', name: 'metadataURI', type: 'string' },
          { internalType: 'uint256', name: 'mintTimestamp', type: 'uint256' },
          { internalType: 'address', name: 'publisher', type: 'address' },
        ],
        internalType: 'struct Readme1155v1.BookMetadata',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const MintPage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [mintTitle, setMintTitle] = useState<string>('');
  const [mintAuthor, setMintAuthor] = useState<string>('');
  const [mintArweaveHash, setMintArweaveHash] = useState<string>('');
  const [mintMetadataURI, setMintMetadataURI] = useState<string>('');
  const [mintedTokenId, setMintedTokenId] = useState<bigint | null>(null);
  const [keyTokenSymbol, setKeyTokenSymbol] = useState<string>('');
  const [keyTokenAddress, setKeyTokenAddress] = useState<string>('');

  // File states
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [epubFile, setEpubFile] = useState<File | null>(null);
  
  // Metadata states
  const [coverArtist, setCoverArtist] = useState<string>('');
  const [tokenTicker, setTokenTicker] = useState<string>('');
  const [bookType, setBookType] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Derived key token name from book title
  const keyTokenName = mintTitle ? `${mintTitle} Readme Club Key` : '';

  const readme1155Address = CONTRACTS.README_1155 as `0x${string}`;

  // Mint NFT functionality
  const { writeContract: mint, isPending: isMinting, data: mintHash } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: mintHash,
  });

  const { writeContract: createKeyToken } = useWriteContract();

  // Add progress states
  const [uploadProgress, setUploadProgress] = useState({
    cover: 0,
    pdf: 0,
    epub: 0,
    metadata: 0
  });

  // Progress update function
  const updateProgress = (type: keyof typeof uploadProgress, progress: number) => {
    setUploadProgress(prev => ({
      ...prev,
      [type]: progress
    }));
  };
  // Add file size tracking
  const [fileInfo, setFileInfo] = useState<{
    coverSize: number;
    pdfSize: number;
    epubSize: number;
  }>({
    coverSize: 0,
    pdfSize: 0,
    epubSize: 0
  });

  // Update file handlers to track sizes
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
  // Watch for successful mint to trigger key token creation
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

  const handleMint = async () => {
    if (!coverImage || !pdfFile || !epubFile || !mintTitle || !mintAuthor || !coverArtist || !bookType || !walletClient) {
      alert('Please fill out all fields and upload all required files.');
      return;
    }

    setIsUploading(true);
    try {
      const metadataInput: BookMetadataInput = {
        title: mintTitle,
        author: mintAuthor,
        coverArtist,
        bookType,
        description: '', // Optional field
        language: 'en', // Optional field
      };

      const uploadResult = await uploadBookContent(
        coverImage,
        pdfFile,
        epubFile,
        metadataInput,
        walletClient,
        updateProgress
      );

      // Use the metadata hash for NFT minting
      mint({
        address: readme1155Address,
        abi: README_1155_ABI,
        functionName: 'mint',
        args: [mintTitle, mintAuthor, uploadResult.metadataHash, uploadResult.metadataHash],
      });

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload content');
    } finally {
      setIsUploading(false);
    }
  };
  // Fetch book details after minting
  const { data: bookDetails } = useReadContract({
    address: readme1155Address,
    abi: README_1155_ABI,
    functionName: 'getBookDetails',
    args: [mintedTokenId!],
    query: {
      enabled: !!mintedTokenId,
    },
  });
return (
  <div className="p-4">
    <h1 className="text-2xl font-bold mb-8">Mint a New Book NFT</h1>

    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* File Uploads Section */}
      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cover Image
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed cursor-pointer hover:bg-gray-50">
              <div className="space-y-1 text-center">
                {coverImage ? (
                  <img 
                    src={URL.createObjectURL(coverImage)} 
                    alt="Cover preview" 
                    className="h-32 object-contain"
                  />
                ) : (
                  <svg className="h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <div className="text-sm text-gray-600">
                  <span>Upload cover image</span>
                </div>
              </div>
              <input 
                type="file" 
                className="hidden"
                accept="image/*"
                onChange={(e) => handleCoverUpload(e.target.files?.[0] || null)} 
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PDF File
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed cursor-pointer hover:bg-gray-50">
                <div className="space-y-1 text-center">
                  {pdfFile ? (
                    <p className="text-sm text-gray-600">{pdfFile.name}</p>
                  ) : (
                    <div className="text-sm text-gray-600">
                      <span>Upload PDF</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  className="hidden"
                  accept=".pdf"
                  onChange={(e) => handlePdfUpload(e.target.files?.[0] || null)} 
                  />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              EPUB File
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed cursor-pointer hover:bg-gray-50">
                <div className="space-y-1 text-center">
                  {epubFile ? (
                    <p className="text-sm text-gray-600">{epubFile.name}</p>
                  ) : (
                    <div className="text-sm text-gray-600">
                      <span>Upload EPUB</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  className="hidden"
                  accept=".epub"
                  onChange={(e) => handleEpubUpload(e.target.files?.[0] || null)} 
                  />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata Fields */}
      <div className="space-y-4">
        <input
          type="text"
          value={mintTitle}
          onChange={(e) => setMintTitle(e.target.value)}
          placeholder="Book Title"
          className="mt-4 p-2 border rounded w-full"
        />
        <input
          type="text"
          value={mintAuthor}
          onChange={(e) => setMintAuthor(e.target.value)}
          placeholder="Author"
          className="mt-4 p-2 border rounded w-full"
        />
        <input
          type="text"
          value={coverArtist}
          onChange={(e) => setCoverArtist(e.target.value)}
          placeholder="Cover Artist"
          className="mt-4 p-2 border rounded w-full"
        />
        <input
          type="text"
          value={tokenTicker}
          onChange={(e) => setTokenTicker(e.target.value.toUpperCase())}
          placeholder="Token Ticker (e.g. BOOK)"
          className="mt-4 p-2 border rounded w-full"
          maxLength={5}
        />
        <select
          value={bookType}
          onChange={(e) => setBookType(e.target.value)}
          className="mt-4 p-2 border rounded w-full"
        >
          <option value="">Select Book Type</option>
          <option value="Fiction">Fiction</option>
          <option value="Non-Fiction">Non-Fiction</option>
          <option value="Poetry">Poetry</option>
          <option value="Technical">Technical</option>
        </select>
      </div>

      {/* Submit Button */}      <button
        onClick={handleMint}
        disabled={isUploading || isMinting || isConfirming}
        className="mt-6 w-full bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {isUploading ? 'Uploading...' : isMinting ? 'Minting...' : 'Mint NFT'}
      </button>

      {/* Status Messages */}
      {isConfirming && <p className="mt-4 text-gray-600">Waiting for confirmation...</p>}
      {isConfirmed && (
        <div className="mt-4 p-4 bg-green-50 rounded">
          <p className="text-green-600">NFT minted successfully!</p>
          <p className="text-sm break-all">Token ID: {mintedTokenId?.toString()}</p>
          {keyTokenAddress && (
            <p className="text-sm break-all">Key Token: {keyTokenAddress}</p>
          )}
        </div>
      )}

      <MintProgress 
        uploadProgress={uploadProgress}
        isUploading={isUploading}
        isMinting={isMinting}
        isConfirming={isConfirming}
        fileInfo={fileInfo}
      />
    </div>
  </div>
);
}
export default MintPage;