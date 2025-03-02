// src/components/token/TokenDashboard.tsx
import React, { useEffect, useState } from 'react';
import { useMultichainToken, COSMOS_PAGE_TOKEN } from '../../hooks/useMultichainToken';
import { useTokenPrices } from '../../hooks/useTokenPrices';
import TokenDetailCard from './TokenDetailCard';
import TokenDataTable from './TokenDataTable';
import UniswapModal from '../../features/web3/UniswapModal';

const TokenDashboard: React.FC = () => {
  // Hooks
  const { 
    currentToken, 
    chainType,
    balance, 
    availableChains, 
    selectedChainId, 
    selectChain,
    selectCosmosChain,
    osmosisTokenData,
    refreshOsmosisData,
    isLoadingOsmosisData,
    lastUpdated
  } = useMultichainToken();
  
  const { 
    prices, 
    aggregatePrice, 
    totalTVL,
    refreshChainPrice,
    refreshAllPrices,
    isRefreshing
  } = useTokenPrices();
  
  const [isUniswapModalOpen, setUniswapModalOpen] = useState(false);

  // Find price for currently selected chain
  const currentPrice = selectedChainId 
    ? prices.find(p => p.chainId === selectedChainId)
    : prices.find(p => p.chainId === COSMOS_PAGE_TOKEN.chainId);

  // Initial data load
  useEffect(() => {
    if (prices.every(p => p.usdPrice === null)) {
      refreshAllPrices();
    }
  }, [refreshAllPrices, prices]);

  // Helper to find chain name safely
  const getChainName = (chainId: number | string | undefined): string => {
    if (chainId === undefined || chainId === null) return 'Unknown';
    
    if (chainId === 'osmosis-1') return 'Osmosis';
    
    const chain = availableChains.find(c => c.id === chainId);
    return chain ? chain.name : 'Unknown';
  };

  // Refresh handlers
  const handleRefreshCurrentChain = () => {
    if (chainType === 'cosmos') {
      refreshOsmosisData();
    } else if (selectedChainId !== null && typeof selectedChainId === 'number') {
      refreshChainPrice(selectedChainId);
    }
  };

  return (
    <div className="space-y-8">
      {/* Summary section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">$PAGE Token Dashboard</h2>
          <button
            onClick={refreshAllPrices}
            disabled={isRefreshing}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh All Data'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-gray-600">Average Price</p>
            <p className="text-3xl font-bold">
              ${aggregatePrice !== null ? aggregatePrice.toFixed(6) : 'Loading...'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Total Value Locked</p>
            <p className="text-3xl font-bold">
              ${totalTVL > 0 ? totalTVL.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 'Loading...'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Your Balance</p>
            <p className="text-3xl font-bold">
              {balance.toFixed(2)} $PAGE
            </p>
          </div>
        </div>
      </div>

      {/* Chain Selector */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Select Chain</h3>
        <div className="flex flex-wrap gap-2">
          {availableChains.map(chain => (
            <button
              key={typeof chain.id === 'string' ? chain.id : chain.id.toString()}
              onClick={() => {
                if (chain.type === 'evm' && typeof chain.id === 'number') {
                  selectChain(chain.id);
                } else {
                  selectCosmosChain();
                }
              }}
              className={`px-4 py-2 rounded-lg ${
                (selectedChainId === chain.id && chainType === 'evm') || 
                (chain.id === 'osmosis-1' && chainType === 'cosmos')
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {chain.name}
            </button>
          ))}
        </div>
      </div>

      {/* Current Chain Details */}
      <TokenDetailCard 
        chainType={chainType}
        chainName={getChainName(chainType === 'cosmos' ? 'osmosis-1' : selectedChainId || undefined)}
        currentPrice={currentPrice}
        osmosisTokenData={osmosisTokenData}
        isLoadingOsmosisData={isLoadingOsmosisData}
        lastUpdated={lastUpdated}
        onRefresh={handleRefreshCurrentChain}
        onTrade={() => setUniswapModalOpen(true)}
        currentToken={currentToken}
      />

      {/* All Chains Overview */}
      <TokenDataTable 
        prices={prices}
        selectedChainId={selectedChainId}
        chainType={chainType}
        onRefreshChain={refreshChainPrice}
      />

      {/* Uniswap Modal - Reuse the existing component from the project */}
      <UniswapModal
        isOpen={isUniswapModalOpen}
        onClose={() => setUniswapModalOpen(false)}
      />
    </div>
  );
};

export default TokenDashboard;