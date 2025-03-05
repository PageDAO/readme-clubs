// src/components/token/IBCTradeModal.tsx
import React from 'react';
import { useIBCPage } from '../../hooks/token/useIBCPage';

const IBCTradeModal: React.FC = () => {
  const { isTradeModalOpen, closeTradeModal, tokenConfig } = useIBCPage();

  if (!isTradeModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Trade $PAGE on Osmosis
          </h2>
          <button 
            onClick={closeTradeModal}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            &times;
          </button>
        </div>
        
        <div className="mb-6">
          <p className="mb-4">To trade PAGE on Osmosis:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Install Keplr wallet extension</li>
            <li>Visit Osmosis DEX</li>
            <li>Connect your Keplr wallet</li>
            <li>Find PAGE in the asset list</li>
            <li>Swap your tokens for PAGE</li>
          </ol>
        </div>
        
        <div className="flex justify-center">
          <a
            href={tokenConfig.dexUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go to Osmosis DEX
          </a>
        </div>
      </div>
    </div>
  );
};

export default IBCTradeModal;