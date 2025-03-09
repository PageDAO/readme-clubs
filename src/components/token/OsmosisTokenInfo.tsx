import React from 'react';
import { useIBCToken } from '../../providers/IBCTokenProvider';

export const OsmosisTokenInfo: React.FC = () => {
  const { 
    chains, 
    isKeplrAvailable, 
    isKeplrConnected, 
    connectKeplr, 
    disconnectKeplr,
    refreshAllData
  } = useIBCToken();
  
  const osmosisChain = chains['osmosis-1'];
  
  // Format currency with 2 decimal places
  const formatCurrency = (value: number | null) => {
    if (value === null) return 'Loading...';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // Format price with more decimal places
  const formatPrice = (value: number | null) => {
    if (value === null) return 'Loading...';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 6,
      maximumFractionDigits: 6
    }).format(value);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">PAGE on Osmosis</h2>
        <button 
          onClick={refreshAllData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
      
      {osmosisChain.loading ? (
        <div className="text-center py-4">Loading token data...</div>
      ) : osmosisChain.error ? (
        <div className="text-red-500 py-2">{osmosisChain.error}</div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-gray-500 text-sm">Price</div>
              <div className="text-xl font-bold">{formatPrice(osmosisChain.price)}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-gray-500 text-sm">TVL</div>
              <div className="text-xl font-bold">{formatCurrency(osmosisChain.tvl)}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-gray-500 text-sm">Market Cap</div>
              <div className="text-xl font-bold">{formatCurrency(osmosisChain.marketCap)}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-gray-500 text-sm">Last Updated</div>
              <div className="text-sm">
                {osmosisChain.lastUpdated?.toLocaleString() || 'Never'}
              </div>
            </div>
          </div>
          
          {/* Wallet connection */}
          <div className="mt-6">
            {isKeplrAvailable ? (
              isKeplrConnected ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Your PAGE Balance:</span>
                    <span className="font-bold">{osmosisChain.balance.toFixed(4)} PAGE</span>
                  </div>
                  <button
                    onClick={disconnectKeplr}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  >
                    Disconnect Keplr
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectKeplr}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Connect Keplr Wallet
                </button>
              )
            ) : (
              <div className="text-center text-gray-500">
                Keplr wallet not detected. Please install the Keplr extension.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
