// src/hooks/useAggregatedTokenData.ts
import { useState, useCallback } from 'react';
import { useBaseChainData } from '../components/token/chains/BaseChainData';
import { useEthereumChainData } from '../components/token/chains/EthereumChainData';
import { useOptimismChainData } from '../components/token/chains/OptimismChainData';
import { usePolygonChainData } from '../components/token/chains/PolygonChainData';

/**
 * Hook that aggregates token data from multiple chains
 * Currently supports Base, Ethereum, Optimism, and Polygon
 */
export function useAggregatedTokenData() {
  const baseData = useBaseChainData();
  const ethereumData = useEthereumChainData();
  const optimismData = useOptimismChainData();
  const polygonData = usePolygonChainData();
  const [isLoading, setIsLoading] = useState(false);
  
  // List of supported chains for UI filtering
  const chains = [
    { id: 'base', name: 'Base' },
    { id: 'ethereum', name: 'Ethereum' },
    { id: 'optimism', name: 'Optimism' },
    { id: 'polygon', name: 'Polygon' },
    // { id: 'osmosis', name: 'Osmosis' }, // Not yet implemented
  ];

  // Calculate total TVL
  const totalTVL = (baseData.tvl || 0) + 
                  (ethereumData.tvl || 0) + 
                  (optimismData.tvl || 0) + 
                  (polygonData.tvl || 0);
  
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
  
  if (optimismData.price && optimismData.tvl) {
    weightedPriceSum += optimismData.price * optimismData.tvl;
    weightSum += optimismData.tvl;
  }
  
  if (polygonData.price && polygonData.tvl) {
    weightedPriceSum += polygonData.price * polygonData.tvl;
    weightSum += polygonData.tvl;
  }
  
  const averagePrice = weightSum > 0 ? weightedPriceSum / weightSum : null;
  
  // Calculate total user balance
  const totalBalance = baseData.balance + 
                      ethereumData.balance + 
                      optimismData.balance + 
                      polygonData.balance;
  
  // Calculate total balance value in USD
  const totalBalanceValue = 
    (baseData.balance * (baseData.price || 0)) +
    (ethereumData.balance * (ethereumData.price || 0)) +
    (optimismData.balance * (optimismData.price || 0)) +
    (polygonData.balance * (polygonData.price || 0));
  
  // Get latest update timestamp
  const lastUpdated = [
    baseData.lastUpdated, 
    ethereumData.lastUpdated,
    optimismData.lastUpdated,
    polygonData.lastUpdated
  ]
    .filter(Boolean)
    .sort((a, b) => (b as Date).getTime() - (a as Date).getTime())[0] || null;
  
  // Function to refresh all chains
  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Refresh each chain
      const promises = [
        baseData.refresh(),
        ethereumData.refresh(),
        optimismData.refresh(),
        polygonData.refresh()
      ];
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Error refreshing all chains:', error);
    } finally {
      setIsLoading(false);
    }
  }, [baseData, ethereumData, optimismData, polygonData]);

  return {
    tvl: totalTVL,
    averagePrice,
    totalBalance,
    totalBalanceValue,
    isLoading: isLoading || 
              baseData.loading || 
              ethereumData.loading || 
              optimismData.loading || 
              polygonData.loading,
    lastUpdated,
    refreshAll,
    chains,
    // Include raw data for debugging
    baseData,
    ethereumData,
    optimismData,
    polygonData
  };
}