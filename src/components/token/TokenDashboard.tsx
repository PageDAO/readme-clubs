// src/components/token/TokenDashboard.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useMultichainToken, COSMOS_PAGE_TOKEN } from '../../hooks/useMultichainToken';
import { useTokenPrices } from '../../hooks/useTokenPrices';
import TokenDetailCard from './TokenDetailCard';
import TokenDataTable from './TokenDataTable';
import UniswapModal from '../../features/web3/UniswapModal';
import TokenSummaryCard from './TokenSummaryCard';
import ChainSelector from './ChainSelector';
import RefreshBar from './RefreshBar';

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
  const hasInitializedRef = useRef(false);

  // Find price for currently selected chain
  const currentPrice = selectedChainId 
    ? prices.find(p => p.chainId === selectedChainId)
    : prices.find(p => p.chainId === COSMOS_PAGE_TOKEN.chainId);

  // Always force data load when component mounts
  useEffect(() => {
    // Only run once
    if (!hasInitializedRef.current) {
      console.log("TokenDashboard mounted - forcing data refresh");
      hasInitializedRef.current = true;
      
      // Add a short delay to ensure everything is ready
      const timeoutId = setTimeout(() => {
        refreshAllPrices();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [refreshAllPrices]);

  // Refresh data when chain selection changes
  useEffect(() => {
    if (selectedChainId && chainType === 'evm') {
      console.log(`Chain selection changed to ${selectedChainId} - refreshing data`);
      refreshChainPrice(selectedChainId);
    } else if (chainType === 'cosmos') {
      console.log('Cosmos chain selected - refreshing Osmosis data');
      refreshOsmosisData();
    }
  }, [selectedChainId, chainType, refreshChainPrice, refreshOsmosisData]);

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

  // Manual refresh handler with logging
  const handleRefreshClick = () => {
    console.log("Manual refresh triggered");
    refreshAllPrices();
  };

  // Loading state
  if (prices.every(p => p.usdPrice === null) && isRefreshing) {
    return (
      <div className="text-center p-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        <p>Loading token data across chains...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Refresh Bar */}
      <RefreshBar 
        prices={prices} 
        isRefreshing={isRefreshing} 
        onRefresh={handleRefreshClick} 
        title="$PAGE Token Dashboard"
      />

      {/* Summary section */}
      <TokenSummaryCard 
        aggregatePrice={aggregatePrice} 
        totalTVL={totalTVL} 
        balance={balance} 
      />

      {/* Chain Selector */}
      <ChainSelector 
        availableChains={availableChains}
        selectedChainId={selectedChainId}
        chainType={chainType}
        onSelectChain={selectChain}
        onSelectCosmosChain={selectCosmosChain}
      />

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