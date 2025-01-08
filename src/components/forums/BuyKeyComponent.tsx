// src/components/forum/BuyKeyComponent.tsx
import React from 'react';
import { useAccount, useContractWrite } from 'wagmi';
import { BookForum } from '../../types/forum';

interface BuyKeyComponentProps {
  bookForum: BookForum;
}

const BuyKeyComponent: React.FC<BuyKeyComponentProps> = ({ bookForum }) => {
  const { address } = useAccount();
  
  // This will need to be configured with your actual contract details
  const { write: buyKey, isLoading } = useContractWrite({
    address: bookForum.contractAddress as `0x${string}`,
    // abi: YOUR_CONTRACT_ABI,
    functionName: 'mint',
  });

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-center mb-6">
        Access Required
      </h2>
      
      <p className="text-gray-600 mb-6">
        You need a Key to access this forum. Keys give you full access to all discussions
        and reading groups for this book.
      </p>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium mb-2">Key Benefits:</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Access to all book discussions</li>
          <li>• Join or create reading groups</li>
          <li>• Participate in community events</li>
          <li>• Direct interaction with other readers</li>
        </ul>
      </div>

      <button
        onClick={() => buyKey?.()}
        disabled={isLoading || !address}
        className={`w-full py-3 rounded-lg text-white font-medium
          ${isLoading 
            ? 'bg-blue-300' 
            : 'bg-blue-500 hover:bg-blue-600'}`}
      >
        {isLoading ? 'Processing...' : 'Buy Key'}
      </button>

      {!address && (
        <p className="text-sm text-gray-500 text-center mt-4">
          Please connect your wallet to purchase a Key
        </p>
      )}
    </div>
  );
};

export default BuyKeyComponent;