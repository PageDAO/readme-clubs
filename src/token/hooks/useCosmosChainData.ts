import { useState, useEffect, useCallback } from 'react';
import { osmosisClient } from '../services/OsmosisClient';
import { keplrWalletService } from '../services/WalletConnectionService';
import { ChainData } from '../types/tokenTypes';
import { COSMOS_CHAINS } from '../constants/chainConfig';

export function useCosmosChainData(chainId: string) {
  const [chainData, setChainData] = useState<ChainData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const chain = COSMOS_CHAINS.find(c => c.id === chainId);
  
  const [isKeplrConnected, setIsKeplrConnected] = useState(false);
  const [keplrAddress, setKeplrAddress] = useState<string | null>(null);
  
  // Check if Keplr is available
  useEffect(() => {
    const isAvailable = keplrWalletService.isAvailable();
    if (isAvailable) {
      // Try to get the connected address
      window.keplr?.getKey(chainId as string).then(key => {
        setKeplrAddress(key.bech32Address);
        setIsKeplrConnected(true);
      }).catch(() => {
        // Not connected, just ignore the error
      });
    }
  }, [chainId]);
  // Connect to Keplr
  const connectKeplr = useCallback(async () => {
    if (!chain) return null; // Return null instead of undefined
    
    try {
      const address = await keplrWalletService.connect(chainId as string);
      if (address) {
        setKeplrAddress(address);
        setIsKeplrConnected(true);
        return address;
      }
      return null;
    } catch (error) {
      console.error('Error connecting to Keplr:', error);
      setError(error instanceof Error ? error.message : 'Unknown error connecting to Keplr');
      return null;
    }
  }, [chain, chainId]);
  // Disconnect from Keplr
  const disconnectKeplr = useCallback(async () => {
    await keplrWalletService.disconnect();
    setKeplrAddress(null);
    setIsKeplrConnected(false);
  }, []);
  
  // Fetch chain data
  const fetchChainData = useCallback(async () => {
    if (!chain) {
      setError(`Chain with ID ${chainId} not found`);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch token data from Osmosis
      const { priceData, poolData, balanceData } = await osmosisClient.fetchAllTokenData(keplrAddress || undefined);
      
      const newChainData: ChainData = {
        chainId: chain.id,
        type: 'cosmos',
        name: chain.name,
        price: priceData.price,
        priceData,
        balance: balanceData?.balance || 0,
        balanceData: balanceData || { 
          balance: 0, 
          balanceUSD: null, 
          timestamp: Date.now(), 
          error: null 
        },
        tvl: poolData ? osmosisClient.calculateTVL(poolData, priceData.price || 0) : null,
        tvlData: {
          tvl: poolData ? osmosisClient.calculateTVL(poolData, priceData.price || 0) : null,
          timestamp: Date.now(),
          error: null
        },
        marketCap: priceData.price ? priceData.price * 100000000 : null, // Total supply * price
        volume24h: null, // We don't have this data yet
        poolData,
        lastUpdated: new Date(),
        isLoading: false,
        error: null,
        refresh: fetchChainData
      };
      
      setChainData(newChainData);
    } catch (err) {
      console.error(`Error fetching data for ${chain.name}:`, err);
      setError(err instanceof Error ? err.message : `Unknown error fetching ${chain.name} data`);
    } finally {
      setIsLoading(false);
    }
  }, [chain, chainId, keplrAddress]);
  
  // Initial data fetch
  useEffect(() => {
    fetchChainData();
    
    // Set up periodic refresh
    const intervalId = setInterval(fetchChainData, 60000); // Refresh every minute
    
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchChainData]);
  
  return {
    chainData,
    isLoading,
    error,
    isKeplrConnected,
    keplrAddress,
    connectKeplr,
    disconnectKeplr,
    refresh: fetchChainData
  };
}
