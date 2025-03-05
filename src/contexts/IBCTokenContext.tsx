// src/contexts/IBCTokenContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { COSMOS_PAGE_TOKEN } from '../config/tokenConfig';

interface IBCTokenData {
  price: number | null;
  tvl: number | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface IBCTokenContextType {
  tokenData: IBCTokenData;
  refreshData: () => Promise<void>;
}

const IBCTokenContext = createContext<IBCTokenContextType | null>(null);

export function IBCTokenProvider({ children }: { children: React.ReactNode }) {
  const [tokenData, setTokenData] = useState<IBCTokenData>({
    price: null,
    tvl: null,
    loading: true,
    error: null,
    lastUpdated: null
  });

  // Function to fetch token data from Osmosis
  const fetchOsmosisTokenData = useCallback(async (): Promise<{ price: number, tvl: number }> => {
    try {
      // Check if endpoint is available
      const endpoint = 'https://api.osmosis.zone/tokens/v2/price/PAGE';
      
      // Make a real API call to the Osmosis API
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract price and liquidity data
      return {
        price: data.price || 0,
        tvl: data.liquidity || 0
      };
    } catch (error) {
      console.error('Error fetching Osmosis token data:', error);
      throw error;
    }
  }, []);

  // Function to refresh token data
  const refreshData = useCallback(async () => {
    if (tokenData.loading) {
      return;
    }
    
    setTokenData(prev => ({ ...prev, loading: true }));
    
    try {
      const data = await fetchOsmosisTokenData();
      setTokenData({
        price: data.price,
        tvl: data.tvl,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch token data';
      console.error('Error refreshing IBC token data:', error);
      setTokenData(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, [fetchOsmosisTokenData, tokenData.loading]);

  // Fetch data on initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <IBCTokenContext.Provider value={{ tokenData, refreshData }}>
      {children}
    </IBCTokenContext.Provider>
  );
}

// Hook to use the IBCToken context
export function useIBCToken() {
  const context = useContext(IBCTokenContext);
  if (!context) {
    throw new Error('useIBCToken must be used within an IBCTokenProvider');
  }
  return context;
}