import React, { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { CONTRACTS } from '../config/contracts';

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
  const [mintTitle, setMintTitle] = useState<string>('');
  const [mintAuthor, setMintAuthor] = useState<string>('');
  const [mintArweaveHash, setMintArweaveHash] = useState<string>('');
  const [mintMetadataURI, setMintMetadataURI] = useState<string>('');
  const [mintedTokenId, setMintedTokenId] = useState<bigint | null>(null);

  const readme1155Address = CONTRACTS.README_1155 as `0x${string}`;

  // Mint NFT functionality
  const { writeContract: mint, isPending: isMinting, data: mintHash } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: mintHash,
  });

  const handleMint = async () => {
    if (!mintTitle || !mintAuthor || !mintArweaveHash || !mintMetadataURI) {
      alert('Please fill out all fields.');
      return;
    }

    mint({
      address: readme1155Address,
      abi: README_1155_ABI,
      functionName: 'mint',
      args: [mintTitle, mintAuthor, mintArweaveHash, mintMetadataURI],
    });
  };

  // Fetch book details after minting
  const { data: bookDetails } = useReadContract({
    address: readme1155Address,
    abi: README_1155_ABI,
    functionName: 'getBookDetails',
    args: [mintedTokenId!], // Now correctly typed as bigint
    query: {
      enabled: !!mintedTokenId, // Moved `enabled` inside `query`
    },
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-8">Mint a New Book NFT</h1>

      {/* Mint Form */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <input
          type="text"
          value={mintTitle}
          onChange={(e) => setMintTitle(e.target.value)}
          placeholder="Title"
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
          value={mintArweaveHash}
          onChange={(e) => setMintArweaveHash(e.target.value)}
          placeholder="Arweave Hash"
          className="mt-4 p-2 border rounded w-full"
        />
        <input
          type="text"
          value={mintMetadataURI}
          onChange={(e) => setMintMetadataURI(e.target.value)}
          placeholder="Metadata URI"
          className="mt-4 p-2 border rounded w-full"
        />
        <button
          onClick={handleMint}
          disabled={isMinting || isConfirming}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          {isMinting ? 'Minting...' : 'Mint NFT'}
        </button>

        {/* Transaction Status */}
        {isConfirming && <p className="mt-4 text-gray-600">Waiting for confirmation...</p>}
        {isConfirmed && (
          <p className="mt-4 text-green-600">NFT minted successfully! Token ID: {mintedTokenId?.toString()}</p>
        )}

        {/* Display Book Details */}
        {bookDetails && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Book Details</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Title:</strong> {bookDetails.title}</p>
              <p><strong>Author:</strong> {bookDetails.author}</p>
              <p><strong>Arweave Hash:</strong> {bookDetails.arweaveHash}</p>
              <p><strong>Metadata URI:</strong> {bookDetails.metadataURI}</p>
              <p><strong>Publisher:</strong> {bookDetails.publisher}</p>
              <p><strong>Mint Timestamp:</strong> {new Date(Number(bookDetails.mintTimestamp) * 1000).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MintPage;