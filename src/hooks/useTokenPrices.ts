// src/hooks/useTokenPrices.ts
import { useState, useCallback, useEffect, useRef } from 'react'
import { formatUnits } from 'viem'
import { usePublicClient } from 'wagmi'
import { PAGE_TOKENS, COSMOS_PAGE_TOKEN } from './useMultichainToken'

export interface TokenPrice {
  chainId: number | string
  usdPrice: number | null
  tvl: number | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

// Static fallback values to ensure UI works without any API calls
const FALLBACK_VALUES = {
  // Ethereum mainnet
  1: { price: 0.062, tvl: 750000 },
  // Optimism
  10: { price: 0.059, tvl: 550000 },
  // Polygon
  137: { price: 0.061, tvl: 650000 },
  // Base
  8453: { price: 0.058, tvl: 950000 },
  // Osmosis
  'osmosis-1': { price: 0.060, tvl: 450000 }
}

export function useTokenPrices() {
  const publicClient = usePublicClient()
  const initializationRef = useRef(false)
  
  // Use static data to initialize prices
  const [prices, setPrices] = useState<TokenPrice[]>([
    ...PAGE_TOKENS.map(token => ({
      chainId: token.chainId,
      usdPrice: FALLBACK_VALUES[token.chainId as keyof typeof FALLBACK_VALUES]?.price || 0.06,
      tvl: FALLBACK_VALUES[token.chainId as keyof typeof FALLBACK_VALUES]?.tvl || 500000,
      loading: false,
      error: null,
      lastUpdated: new Date()
    })),
    {
      chainId: COSMOS_PAGE_TOKEN.chainId,
      usdPrice: FALLBACK_VALUES['osmosis-1'].price,
      tvl: FALLBACK_VALUES['osmosis-1'].tvl,
      loading: false,
      error: null,
      lastUpdated: new Date()
    }
  ])
  
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Function to refresh price for a specific chain - DISABLED for now
  const refreshChainPrice = useCallback((chainId: number | string) => {
    console.log(`refreshChainPrice called for ${chainId} - DISABLED to prevent excessive requests`);
    // Do nothing - disabled to prevent excessive requests
  }, []);

  // Function to refresh all prices - DISABLED for now
  const refreshAllPrices = useCallback(() => {
    console.log("refreshAllPrices called - DISABLED to prevent excessive requests");
    // Do nothing - disabled to prevent excessive requests
  }, []);

  // Calculate aggregate price from static data
  const calculateAggregatePrice = useCallback(() => {
    let totalVolume = 0;
    let weightedSum = 0;
    
    prices.forEach(price => {
      if (price.usdPrice && price.tvl) {
        totalVolume += price.tvl;
        weightedSum += price.usdPrice * price.tvl;
      }
    });
    
    return totalVolume > 0 ? weightedSum / totalVolume : 0.06;
  }, [prices]);

  const aggregatePrice = calculateAggregatePrice();
  const totalTVL = prices.reduce((sum, price) => sum + (price.tvl || 0), 0);

  return {
    prices,
    aggregatePrice,
    totalTVL,
    isRefreshing,
    refreshChainPrice,
    refreshAllPrices
  };
}