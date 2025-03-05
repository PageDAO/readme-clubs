// src/providers/IBCTokenProvider.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { COSMOS_PAGE_TOKEN } from '../config/tokenConfig';

// Define the types for our IBC chains
export interface IBCTokenChain {
  name: string;
  price: number | null;
  tvl: number | null;
  balance: number;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  staking: {
    poolId: string | null;
    isStaking: boolean;
    stakedAmount: number;
    rewards: number;
  };
}

export interface IBCTokenState {
  chains: {
    [chainId: string]: IBCTokenChain;
  };
  isKeplrConnected: boolean;
}

interface IBCTokenContextType extends IBCTokenState {
  connectKeplr: () => Promise<string | null>;
  refreshChainData: (chainId: string) => Promise<void>;
  refreshAllData: () => Promise<void>;
}

const DEFAULT_CHAIN_STATE: IBCTokenChain = {
  name: 'Osmosis',
  price: null,
  tvl: null,
  balance: 0,
  loading: true,
  error: null,
  lastUpdated: null,
  staking: {
    poolId: null,
    isStaking: false,
    stakedAmount: 0,
    rewards: 0
  }
};

// Create the context
const IBCTokenContext = createContext<IBCTokenContextType | null>(null);

export function IBCTokenProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<IBCTokenState>({
    chains: {
      'osmosis-1': {
        ...DEFAULT_CHAIN_STATE,
        name: 'Osmosis',
        staking: {
          ...DEFAULT_CHAIN_STATE.staking,
          poolId: '1344' // Example pool ID for Osmosis
        }
      }
    },
    isKeplrConnected: false
  });

  // Function to fetch token data from Osmosis API
  const fetchTokenData = useCallback(async (chainId: string): Promise<{ price: number, tvl: number }> => {
    try {
      // For now, return mock data to avoid API issues
      console.log("Fetching token data for", chainId);
      return {
        price: 0.062,
        tvl: 850000
      };
    } catch (error) {
      console.error(`Error fetching ${chainId} token data:`, error);
      throw error;
    }
  }, []);

  // Function to fetch user's balance
  const fetchUserBalance = useCallback(async (chainId: string, address: string): Promise<number> => {
    try {
      console.log("Fetching balance for", chainId, address);
      // Return mock balance
      return 10.5;
    } catch (error) {
      console.error(`Error fetching ${chainId} balance:`, error);
      return 0;
    }
  }, []);

  // Function to fetch staking info
  const fetchStakingInfo = useCallback(async (chainId: string, address: string): Promise<IBCTokenChain['staking']> => {
    try {
      console.log("Fetching staking info for", chainId, address);
      // Return mock staking info
      return {
        poolId: state.chains[chainId]?.staking.poolId || null,
        isStaking: true,
        stakedAmount: 25,
        rewards: 1.25
      };
    } catch (error) {
      console.error(`Error fetching ${chainId} staking info:`, error);
      return {
        poolId: state.chains[chainId]?.staking.poolId || null,
        isStaking: false,
        stakedAmount: 0,
        rewards: 0
      };
    }
  }, [state.chains]);

  // Function to refresh data for a specific chain
  const refreshChainData = useCallback(async (chainId: string) => {
    console.log("Refreshing chain data for", chainId);
    if (!state.chains[chainId]) {
      console.error(`Chain ${chainId} not supported`);
      return;
    }

    setState(prev => ({
      ...prev,
      chains: {
        ...prev.chains,
        [chainId]: {
          ...prev.chains[chainId],
          loading: true
        }
      }
    }));

    try {
      const tokenData = await fetchTokenData(chainId);
      
      // Only fetch user data if connected to Keplr
      let balance = 0;
      let staking = state.chains[chainId].staking;
      
      if (state.isKeplrConnected && typeof window !== 'undefined' && window.keplr) {
        // Get the user's address
        await window.keplr.enable(chainId);
        const key = await window.keplr.getKey(chainId);
        const address = key.bech32Address;
        
        // Fetch balance and staking info
        balance = await fetchUserBalance(chainId, address);
        staking = await fetchStakingInfo(chainId, address);
      }

      setState(prev => ({
        ...prev,
        chains: {
          ...prev.chains,
          [chainId]: {
            ...prev.chains[chainId],
            price: tokenData.price,
            tvl: tokenData.tvl,
            balance,
            loading: false,
            error: null,
            lastUpdated: new Date(),
            staking
          }
        }
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        chains: {
          ...prev.chains,
          [chainId]: {
            ...prev.chains[chainId],
            loading: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }));
    }
  }, [fetchTokenData, fetchUserBalance, fetchStakingInfo, state.chains, state.isKeplrConnected]);

  // Function to refresh all chains
  const refreshAllData = useCallback(async () => {
    console.log("Refreshing all chains");
    const chainIds = Object.keys(state.chains);
    for (const chainId of chainIds) {
      await refreshChainData(chainId);
    }
  }, [refreshChainData, state.chains]);

  // Function to connect to Keplr wallet
  const connectKeplr = useCallback(async (): Promise<string | null> => {
    console.log("Connecting to Keplr");
    try {
      if (typeof window === 'undefined' || !window.keplr) {
        console.log("Keplr extension not found");
        alert("Please install Keplr extension");
        return null;
      }

      // Check if we support any of the chains
      const chainIds = Object.keys(state.chains);
      if (chainIds.length === 0) {
        throw new Error("No supported chains configured");
      }

      // Connect to the first supported chain
      const chainId = chainIds[0];
      await window.keplr.enable(chainId);
      const key = await window.keplr.getKey(chainId);
      const address = key.bech32Address;

      setState(prev => ({
        ...prev,
        isKeplrConnected: true
      }));

      // Refresh data after connecting
      await refreshAllData();

      return address;
    } catch (error) {
      console.error("Failed to connect to Keplr", error);
      return null;
    }
  }, [state.chains, refreshAllData]);

  // Load initial data
  useEffect(() => {
    console.log("IBCTokenProvider initialized");
    refreshAllData();
    
    // Check if Keplr is already connected
    if (typeof window !== 'undefined' && window.keplr) {
      connectKeplr().catch(console.error);
    }
  }, [refreshAllData, connectKeplr]);

  const contextValue = {
    ...state,
    connectKeplr,
    refreshChainData,
    refreshAllData
  };

  console.log("IBCTokenProvider rendering with value:", contextValue);
  
  return (
    <IBCTokenContext.Provider value={contextValue}>
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