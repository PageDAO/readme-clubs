import React, { useState, useEffect } from 'react';
import { useAccount, useWalletClient, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '../config/contracts';
import { KEY_FACTORY_ABI } from '../config/abis';
import { MetadataCollector } from '../components/mint/metadata/MetadataCollector';
import { DirectoryStatus } from '../components/mint/DirectoryStatus';
import { FileUploader } from '../components/mint/FileUploader';
import { publicMintService } from '../services/mint/publicMintService';
import type { EnhancedBookMetadata, MintType } from '../services/mint/types';

// Keeping the original ABI and contract integration
const README_1155_ABI = [/* ... */] as const;

const MintPage: React.FC = () => {
  // Original wallet and contract states
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { writeContract: mint, isPending: isMinting, data: mintHash } = useWriteContract();
  const { writeContract: createKeyToken } = useWriteContract();

  // New phased minting states
  const [phase, setPhase] = useState<'metadata' | 'directory' | 'upload'>('metadata');
  const [mintType, setMintType] = useState<MintType>(MintType.PUBLIC);
  
  // Preserved states from original
  const [mintedTokenId, setMintedTokenId] = useState<bigint | null>(null);
  const [keyTokenSymbol, setKeyTokenSymbol] = useState<string>('');
  const [keyTokenAddress, setKeyTokenAddress] = useState<string>('');

  const [directoryId, setDirectoryId] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<EnhancedBookMetadata | null>(null);

  // Transaction confirmation handling
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: mintHash,
  });

  // Preserved from original: Key token creation on successful mint
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
      setDirectoryId(result.directoryId);
      setPhase('directory');
    } catch (error) {
      console.error('Failed to initialize mint:', error);
    }
  };

  const handleFileUploadComplete = async (uploadResult: UploadResponse) => {
    if (!walletClient) return;

    try {
      mint({
        address: CONTRACTS.README_1155 as `0x${string}`,
        abi: README_1155_ABI,
        functionName: 'mint',
        args: [
          metadata.title,
          metadata.author,
          uploadResult.metadataHash,
          uploadResult.metadataHash
        ],
      });
    } catch (error) {
      console.error('Mint transaction failed:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-8">Mint a New Book NFT</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Phase-specific UI */}
        {phase === 'metadata' && (
          <MetadataCollector 
            onMetadataComplete={handleMetadataSubmit}
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
          />
        )}

        {/* Status Messages */}
        {isConfirming && (
          <p className="mt-4 text-gray-600">Waiting for confirmation...</p>
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