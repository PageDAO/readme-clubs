import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useIBCToken } from './IBCTokenProvider';
import { useTokenReserves } from '../hooks/token/useTokenReserves';
import { useTokenBalance } from '../hooks/token/useTokenBalance';
import { useEthPrice } from '../hooks/token/useEthPrice';
import { useAccount } from 'wagmi'; // Add this import


// Define supported chains
const EVM_CHAINS = [1, 8453, 10]; // Ethereum, Base, Optimism
const COSMOS_CHAINS = ['osmosis-1'];
const TOTAL_SUPPLY = 100000000; // 100M total PAGE tokens

interface ChainLiquidity {
  chainId: string | number;
  type: 'evm' | 'cosmos';
  liquidityUSD: number;
  price: number;
  tvl: number;
  balance: number;
}

interface InterChainTokenData {
  weightedPrice: number | null;
  totalTVL: number | null;
  totalBalance: number;
  marketCap: number | null;
  pricesByChain: Record<string, number | null>;
  tvlByChain: Record<string, number | null>;
  balancesByChain: Record<string, number>;
  supplyByChain: Record<string, number>;
  totalTrackedSupply: number;
  isLoading: boolean;
}

interface InterChainTokenContextType extends InterChainTokenData {
  refreshAllData: () => Promise<void>;
}

const InterChainTokenContext = createContext<InterChainTokenContextType | null>(null);

export function InterChainTokenProvider({ children }: { children: React.ReactNode }) {
  // Get data from existing providers
  const ibcToken = useIBCToken();
  const { ethPrice } = useEthPrice();
  const { address } = useAccount(); // Get the user's address
  
  // Get EVM chain data with proper arguments
  const ethereumReserves = useTokenReserves(1, ethPrice);
  const baseReserves = useTokenReserves(8453, ethPrice);
  const optimismReserves = useTokenReserves(10, ethPrice);
  
  // Get token configurations for each chain
  const ethereumTokenConfig = { chainId: 1, /* other config properties */ };
  const baseTokenConfig = { chainId: 8453, /* other config properties */ };
  const optimismTokenConfig = { chainId: 10, /* other config properties */ };
  
  // Get balances with correct arguments and null handling
  const { balance: ethereumBalance = 0 } = useTokenBalance(address, ethereumTokenConfig);
  const { balance: baseBalance = 0 } = useTokenBalance(address, baseTokenConfig);
  const { balance: optimismBalance = 0 } = useTokenBalance(address, optimismTokenConfig);
  
  // State for aggregated data
  const [data, setData] = useState<InterChainTokenData>({
    weightedPrice: null,
    totalTVL: null,
    totalBalance: 0,
    marketCap: null,
    pricesByChain: {},
    tvlByChain: {},
    balancesByChain: {},
    supplyByChain: {
      'ethereum': 50000000, // Placeholder - adjust with actual distributions
      'base': 20000000,
      'optimism': 10000000,
      'osmosis': 20000000,
    },
    totalTrackedSupply: 0,
    isLoading: true
  });
  
  // Calculate weighted average price across all chains
  const calculateWeightedPrice = useCallback(() => {
    const liquidities: ChainLiquidity[] = [];
    
    // Add EVM chains - using tokenPriceUsd from the hooks
    if (ethereumReserves.tokenPriceUsd !== null && ethereumReserves.tvl !== null) {
      liquidities.push({
        chainId: 1,
        type: 'evm',
        liquidityUSD: ethereumReserves.tvl,
        price: ethereumReserves.tokenPriceUsd,
        tvl: ethereumReserves.tvl,
        balance: ethereumBalance
      });
    }
    
    if (baseReserves.tokenPriceUsd !== null && baseReserves.tvl !== null) {
      liquidities.push({
        chainId: 8453,
        type: 'evm',
        liquidityUSD: baseReserves.tvl,
        price: baseReserves.tokenPriceUsd,
        tvl: baseReserves.tvl,
        balance: baseBalance
      });
    }
    
    if (optimismReserves.tokenPriceUsd !== null && optimismReserves.tvl !== null) {
      liquidities.push({
        chainId: 10,
        type: 'evm',
        liquidityUSD: optimismReserves.tvl,
        price: optimismReserves.tokenPriceUsd,
        tvl: optimismReserves.tvl,
        balance: optimismBalance
      });
    }
    
    // Add Osmosis
    const osmosisChain = ibcToken.chains['osmosis-1'];
    if (osmosisChain?.price !== null && osmosisChain?.tvl !== null) {
      liquidities.push({
        chainId: 'osmosis-1',
        type: 'cosmos',
        liquidityUSD: osmosisChain.tvl,
        price: osmosisChain.price,
        tvl: osmosisChain.tvl,
        balance: osmosisChain.balance || 0
      });
    }
    
    // Calculate total liquidity and weighted price
    const totalLiquidity = liquidities.reduce((sum, item) => sum + item.liquidityUSD, 0);
    
    if (totalLiquidity === 0) return null;
    
    const weightedPrice = liquidities.reduce((sum, item) => {
      // Weight by liquidity proportion
      const weight = item.liquidityUSD / totalLiquidity;
      return sum + (item.price * weight);
    }, 0);
    
    // Create price and TVL maps
    const pricesByChain: Record<string, number | null> = {};
    const tvlByChain: Record<string, number | null> = {};
    const balancesByChain: Record<string, number> = {};
    
    liquidities.forEach(item => {
      const chainKey = item.type === 'evm' ? `evm-${item.chainId}` : String(item.chainId);
      pricesByChain[chainKey] = item.price;
      tvlByChain[chainKey] = item.tvl;
      balancesByChain[chainKey] = item.balance;
    });
    
    // Calculate totals
    const totalTVL = liquidities.reduce((sum, item) => sum + item.tvl, 0);
    const totalBalance = liquidities.reduce((sum, item) => sum + item.balance, 0);
    
    // Calculate market cap based on weighted price
    const marketCap = TOTAL_SUPPLY * weightedPrice;
    
    return {
      weightedPrice,
      totalTVL,
      totalBalance,
      marketCap,
      pricesByChain,
      tvlByChain,
      balancesByChain
    };
  }, [
    ethereumReserves, baseReserves, optimismReserves,
    ethereumBalance, baseBalance, optimismBalance,
    ibcToken.chains
  ]);
  
  // Refresh all data
  const refreshAllData = useCallback(async () => {
    // This should trigger refreshes in the underlying providers
    await ibcToken.refreshAllData();
    // Ethereum data will refresh via its own hooks
  }, [ibcToken]);
  
  // Update aggregated data when sources change
  useEffect(() => {
    const isLoading = 
      !ibcToken.chains['osmosis-1'] || 
      ibcToken.chains['osmosis-1'].loading ||
      !ethereumReserves.tokenPriceUsd ||   // Changed from price to tokenPriceUsd
      !baseReserves.tokenPriceUsd ||       // Changed from price to tokenPriceUsd
      !optimismReserves.tokenPriceUsd;     // Changed from price to tokenPriceUsd
      
    if (isLoading) {
      setData(prev => ({ ...prev, isLoading: true }));
      return;
    }
    
    const calculatedData = calculateWeightedPrice();
    if (calculatedData) {
      setData(prev => ({
        ...prev,
        ...calculatedData,
        isLoading: false
      }));
    } else {
      setData(prev => ({ ...prev, isLoading: false }));
    }
  }, [
    ibcToken.chains,
    ethereumReserves,
    baseReserves,
    optimismReserves,
    calculateWeightedPrice
  ]);
  
  const contextValue = React.useMemo(() => ({
    ...data,
    refreshAllData
  }), [data, refreshAllData]);
  
  return (
    <InterChainTokenContext.Provider value={contextValue}>
      {children}
    </InterChainTokenContext.Provider>
  );
}

export function useInterChainToken() {
  const context = useContext(InterChainTokenContext);
  if (!context) {
    throw new Error('useInterChainToken must be used within an InterChainTokenProvider');
  }
  return context;
}
