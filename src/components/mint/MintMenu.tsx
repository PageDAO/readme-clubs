import React, { useState } from 'react';

interface MintMenuProps {
  onNewMint: () => void;
  onResumeMint: (txId: string) => void;
}

export const MintMenu: React.FC<MintMenuProps> = ({ onNewMint, onResumeMint }) => {
  const [txId, setTxId] = useState('');

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Start Minting</h2>
      
      <div className="space-y-6">
        <div>
          <button
            onClick={onNewMint}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Begin New Mint
          </button>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Resume Existing Mint</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              placeholder="Enter Arweave Transaction ID"
              className="w-full p-2 border rounded"
            />
            <button
              onClick={() => onResumeMint(txId)}
              className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Resume Mint
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
