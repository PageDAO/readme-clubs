import React, { useMemo } from 'react';
import { useIBCToken } from '../../providers/IBCTokenProvider';

interface IBCTokenDetailCardProps {
  chainId: string;
  showStakingDetails?: boolean;
}

export const IBCTokenDetailCard: React.FC<IBCTokenDetailCardProps> = ({
  chainId,
  showStakingDetails = true
}) => {
  const { 
    chains, 
    isKeplrConnected, 
    connectKeplr, 
    refreshChainData 
  } = useIBCToken();
  
  // Get chain data with proper error handling
  const chainData = chains[chainId];

  if (!chainData) {
    return <div className="p-4 bg-red-100 rounded-lg">Chain not supported: {chainId}</div>;
  }

  // Handle connect button click
  const handleConnect = () => {
    connectKeplr();
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    refreshChainData(chainId);
  };

  // Helper function to render data with error checking
  const renderData = (value: number | null | undefined, formatter: (val: number) => string, fallback = "Not available") => {
    if (chainData.loading) return <div className="animate-pulse bg-gray-200 h-6 w-20 rounded"></div>;
    if (value === null || value === undefined) return fallback;
    return formatter(value);
  };

  // Format pool data for display
  const poolInfo = useMemo(() => {
    if (!chainData.poolData) return null;
    
    const { pageAmount, osmoAmount } = chainData.poolData;
    const pageFormatted = Number(pageAmount) / 1e8; // 8 decimals for PAGE
    const osmoFormatted = Number(osmoAmount) / 1e6; // 6 decimals for OSMO
    
    return {
      pageAmount: pageFormatted.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      osmoAmount: osmoFormatted.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      poolId: chainData.poolData.poolId
    };
  }, [chainData.poolData]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <img
              src="/images/osmosis-logo.svg"
              alt={chainData.name}
              className="w-8 h-8 mr-2"
            />
            <h3 className="text-xl font-bold">{chainData.name}</h3>
          </div>
          
          <div className="flex items-center gap-2">
            {chainData.loading && (
              <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-purple-500 rounded-full"></div>
            )}
            
            <button 
              onClick={handleRefresh}
              className="p-1 text-gray-500 hover:text-purple-500"
              title="Refresh data"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {chainData.error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            <p className="font-bold">Error loading data:</p>
            <p>{chainData.error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-gray-600 mb-1">$PAGE Price</p>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold">
                {renderData(chainData.price, val => `$${val.toFixed(6)}`)}
              </p>
            </div>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Market Cap</p>
            <p className="text-2xl font-bold">
              {renderData(chainData.marketCap, val => `$${val.toLocaleString()}`)}
            </p>
          </div>
        </div>

        {/* More token stats */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-gray-600 mb-1">24h Volume</p>
            <p className="text-xl font-bold">
              {renderData(chainData.volume24h, val => `$${val.toLocaleString()}`, "Not tracked")}
            </p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">TVL</p>
            <p className="text-xl font-bold">
              {renderData(chainData.tvl, val => `$${val.toLocaleString()}`)}
            </p>
          </div>
        </div>

        {/* User's balance */}
        {isKeplrConnected ? (
          <div className="p-4 bg-blue-50 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-800 font-medium">Your $PAGE Balance</p>
                <p className="text-2xl font-bold text-blue-900">
                  {chainData.balance.toFixed(2)} $PAGE
                </p>
                <p className="text-sm text-blue-700">
                  ≈ ${chainData.price ? (chainData.balance * chainData.price).toFixed(2) : 'N/A'} USD
                </p>
              </div>
              <a
                href="https://app.osmosis.zone/assets"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Transfer
              </a>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg mb-6">
            <p className="text-gray-600 mb-2">
              Connect your Keplr wallet to see your $PAGE balance.
            </p>
            <button
              onClick={handleConnect}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Connect Keplr Wallet
            </button>
          </div>
        )}

        {/* Pool data section */}
        {poolInfo && (
          <div className="p-4 bg-gray-50 rounded-lg mb-6">
            <h4 className="font-medium text-gray-700 mb-2">Pool Data (Pool {poolInfo.poolId})</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">PAGE in Pool</p>
                <p className="font-mono">{poolInfo.pageAmount}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">OSMO in Pool</p>
                <p className="font-mono">{poolInfo.osmoAmount}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This data is used to calculate the PAGE price and TVL.
            </p>
          </div>
        )}

        {/* Staking info section */}
        {showStakingDetails && chainData.staking && (
          <div className="p-4 bg-gray-50 rounded-lg mb-6">
            <h4 className="font-medium text-gray-700 mb-2">Staking</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">APR</p>
                <p className="font-medium">
                  {chainData.staking.apr !== null 
                    ? `${chainData.staking.apr.toFixed(2)}%` 
                    : "Not available"}
                </p>
              </div>
              {isKeplrConnected && (
                <div>
                  <p className="text-gray-600 text-sm">Your Staked</p>
                  <p className="font-medium">
                    {chainData.staking.stakedAmount.toFixed(2)} $PAGE
                  </p>
                </div>
              )}
            </div>
            <div className="mt-2">
              <a
                href={`https://app.osmosis.zone/stake?poolId=${chainData.staking.poolId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 text-sm hover:text-purple-800"
              >
                Stake on Osmosis →
              </a>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-4">
          <a
            href="https://app.osmosis.zone/assets/PAGE"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-purple-600 text-white rounded text-center hover:bg-purple-700"
          >
            Trade on Osmosis
          </a>
          <a
            href="https://www.mintscan.io/osmosis/assets/PAGE"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded text-center hover:bg-gray-200"
          >
            View Explorer
          </a>
        </div>

        {chainData.lastUpdated && (
          <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
            <p>Data from Osmosis Pool #{chainData.staking?.poolId || '1344'}</p>
            <p>Last updated: {chainData.lastUpdated.toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Only use a named export for consistency
export default IBCTokenDetailCard;
