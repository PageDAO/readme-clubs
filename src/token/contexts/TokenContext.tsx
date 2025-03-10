import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ChainData, ChainDataMap } from '../types';
import { useCosmosChainData } from '../hooks/useCosmosChainData';
import { useEthPrice } from '../hooks/useEthPrice';
import { EVM_CHAINS, COSMOS_CHAINS } from '../constants';

interface TokenContextData {
  chains: ChainDataMap;
  ethPrice: number | null;
  weightedPrice: number | null;
  totalTVL: number | null;
  totalBalance: number;
  marketCap: number | null;
  lastUpdated: Date | null;
  isLoading: boolean;
  error: string | null;
  refreshAll: () => Promise<void>;
  connectKeplr: () => Promise<string | null>;
  isKeplrConnected: boolean;
}

const TokenContext = createContext<TokenContextData | null>(null);

export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { ethPrice } = useEthPrice();
  const { 
    chainData: osmosisData,
    isLoading: osmosisLoading,
    error: osmosisError,
    isKeplrConnected,
    connectKeplr,
    refresh: refreshOsmosis
  } = useCosmosChainData('osmosis-1');
  
  const [chains, setChains] = useState<ChainDataMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Calculate weighted price and totals
  const [weightedPrice, setWeightedPrice] = useState<number | null>(null);
  const [totalTVL, setTotalTVL] = useState<number | null>(null);
  const [totalBalance, setTotalBalance] = useState(0);
  const [marketCap, setMarketCap] = useState<number | null>(null);
  
  // Update chain data when Osmosis data changes
  useEffect(() => {
    if (osmosisData) {
      setChains(prevChains => ({
        ...prevChains,
        ['osmosis-1']: osmosisData
      }));
      
      setLastUpdated(new Date());
    }
  }, [osmosisData]);
  
  // Update loading and error states
  useEffect(() => {
    setIsLoading(osmosisLoading);
    
    if (osmosisError) {
      setError(osmosisError);
    } else {
      setError(null);
    }
  }, [osmosisLoading, osmosisError]);
  
  // Calculate aggregate metrics
  useEffect(() => {
    // Skip calculations if we don't have Osmosis data yet
    if (!osmosisData) return;
    
    // For now, we're only using Osmosis data for calculations
    setWeightedPrice(osmosisData.price);
    setTotalTVL(osmosisData.tvl);
    setTotalBalance(osmosisData.balance);
    setMarketCap(osmosisData.marketCap);
    
  }, [osmosisData]);
  
  // Refresh all data
  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    try {
      await refreshOsmosis();
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error refreshing data');
    } finally {
      setIsLoading(false);
    }
  }, [refreshOsmosis]);
  
  const contextValue = {
    chains,
    ethPrice,
    weightedPrice,
    totalTVL,
    totalBalance,
    marketCap,
    lastUpdated,
    isLoading,
    error,
    refreshAll,
    connectKeplr,
    isKeplrConnected
  };
  
  return (
    <TokenContext.Provider value={contextValue}>
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error('useToken must be used within a TokenProvider');
  }
  return context;
};
