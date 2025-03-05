import React from 'react';
import { useIBCPage } from '../../hooks/token/useIBCPage';

interface IBCTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IBCTradeModal: React.FC<IBCTradeModalProps> = ({ isOpen, onClose }) => {
  const { osmosis } = useIBCPage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Trade $PAGE on Osmosis</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {osmosis.loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        )}

        {osmosis.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error loading token data</p>
            <p>{osmosis.error}</p>
            <button 
              onClick={osmosis.refreshData}
              className="mt-2 bg-red-200 hover:bg-red-300 text-red-800 px-3 py-1 rounded"
            >
              Try Again
            </button>
          </div>
        )}

        {!osmosis.loading && !osmosis.error && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">$PAGE Token Info</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-600">Current Price</p>
                  <p className="font-medium">
                    {osmosis.price !== null 
                      ? `$${osmosis.price.toFixed(6)}` 
                      : 'Not available'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Market Cap</p>
                  <p className="font-medium">
                    {osmosis.marketCap !== null 
                      ? `$${osmosis.marketCap.toLocaleString()}` 
                      : 'Not available'}
                  </p>
                </div>
              </div>
            </div>

            {/* Pool Info Section */}
            {osmosis.poolData && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Pool Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">PAGE in Pool</p>
                    <p className="font-mono">
                      {(Number(osmosis.poolData.pageAmount) / 1e8).toLocaleString(undefined, { 
                        maximumFractionDigits: 2 
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">OSMO in Pool</p>
                    <p className="font-mono">
                      {(Number(osmosis.poolData.osmoAmount) / 1e6).toLocaleString(undefined, { 
                        maximumFractionDigits: 2 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2">How to Trade $PAGE on Osmosis</h3>
              <ol className="list-decimal ml-5 space-y-2">
                <li>Install the <a href="https://www.keplr.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Keplr wallet</a> browser extension</li>
                <li>Go to <a href={osmosis.tokenConfig.dexUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Osmosis DEX</a></li>
                <li>Connect your Keplr wallet</li>
                <li>Search for PAGE token or navigate to the PAGE/OSMO pool</li>
                <li>Enter the amount you want to swap and confirm the transaction</li>
              </ol>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Trading Fees</h3>
              <p className="text-sm text-yellow-700">
                Trading on Osmosis incurs a small fee (typically 0.2-0.3% per swap) that is paid to liquidity providers. 
                This fee helps maintain liquidity in the pools and reduces price impact for traders.
              </p>
            </div>

            <div className="flex justify-center mt-6">
              <a
                href={osmosis.tokenConfig.dexUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 mr-4"
              >
                Trade on Osmosis
              </a>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        )}
        
        {osmosis.lastUpdated && (
          <p className="text-xs text-gray-500 mt-4 text-center">
            Data last updated: {osmosis.lastUpdated.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
};
