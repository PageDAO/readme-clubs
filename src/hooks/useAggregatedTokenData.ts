// src/hooks/useAggregatedTokenData.ts
import { useState, useCallback } from 'react';
import { useBaseChainData } from '../components/token/chains/BaseChainData';
import { useEthereumChainData } from '../components/token/chains/EthereumChainData';

/**
 * Hook that aggregates token data from multiple chains
 * Currently supports Base and Ethereum, will be expanded to include more chains
 */
export function useAggregatedTokenData() {
  const baseData = useBaseChainData();
  const ethereumData = useEthereumChainData();
  const [isLoading, setIsLoading] = useState(false);
  
  // List of supported chains for UI filtering
  const chains = [
    { id: 'base', name: 'Base' },
    { id: 'ethereum', name: 'Ethereum' },
    // These will be enabled as they are implemented
    // { id: 'optimism', name: 'Optimism' },
    // { id: 'polygon', name: 'Polygon' },
    // { id: 'osmosis', name: 'Osmosis' },
  ];

  // Calculate total TVL
  const totalTVL = (baseData.tvl || 0) + (ethereumData.tvl || 0);
  
  // Calculate weighted average price
  let weightedPriceSum = 0;
  let weightSum = 0;
  
  if (baseData.price && baseData.tvl) {
    weightedPriceSum += baseData.price * baseData.tvl;
    weightSum += baseData.tvl;
  }
  
  if (ethereumData.price && ethereumData.tvl) {
    weightedPriceSum += ethereumData.price * ethereumData.tvl;
    weightSum += ethereumData.tvl;
  }
  
  const averagePrice = weightSum > 0 ? weightedPriceSum / weightSum : null;
  
  // Calculate total user balance
  const totalBalance = baseData.balance + ethereumData.balance;
  
  // Calculate total balance value in USD
  const totalBalanceValue = 
    (baseData.balance * (baseData.price || 0)) +
    (ethereumData.balance * (ethereumData.price || 0));
  
  // Get latest update timestamp
  const lastUpdated = [baseData.lastUpdated, ethereumData.lastUpdated]
    .filter(Boolean)
    .sort((a, b) => (b as Date).getTime() - (a as Date).getTime())[0] || null;
  
  // Function to refresh all chains
  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Refresh each chain
      const promises = [
        baseData.refresh(),
        ethereumData.refresh()
      ];
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Error refreshing all chains:', error);
    } finally {
      setIsLoading(false);
    }
  }, [baseData, ethereumData]);

  return {
    tvl: totalTVL,
    averagePrice,
    totalBalance,
    totalBalanceValue,
    isLoading: isLoading || baseData.loading || ethereumData.loading,
    lastUpdated,
    refreshAll,
    chains,
    // Include raw data for debugging
    baseData,
    ethereumData
  };
}