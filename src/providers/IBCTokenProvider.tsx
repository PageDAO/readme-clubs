import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { COSMOS_PAGE_TOKEN } from '../config/tokenConfig';
import { OSMOSIS_CONFIG } from '../config/osmosisConfig';
import { useOsmoPrice } from '../hooks/token/useOsmoPrice';
import { osmosisClient, PoolData, TokenPriceData } from '../services/OsmosisLcdClient';

// Types
interface StakingInfo {
  poolId: string;
  isStaking: boolean;
  stakedAmount: number;
  rewards: number;
  apr: number | null;
}

interface TokenInfo {
  supply: number | null;
  holders: number | null;
}

interface ChainData {
  name: string;
  price: number | null;
  marketCap: number | null;
  volume24h: number | null;
  tvl: number | null;
  balance: number;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  staking: StakingInfo;
  tokenInfo: TokenInfo;
  poolData?: PoolData;
}

interface IBCTokenState {
  chains: {
    [chainId: string]: ChainData;
  };
  isKeplrAvailable: boolean;
  isKeplrConnected: boolean;
  keplrAddress: string | null;
}

interface IBCTokenContextType extends IBCTokenState {
  connectKeplr: () => Promise<string | null>;
  disconnectKeplr: () => void;
  refreshChainData: (chainId: string) => Promise<void>;
  refreshAllData: () => Promise<void>;
}

// Create context
const IBCTokenContext = createContext<IBCTokenContextType | null>(null);

export function IBCTokenProvider({ children }: { children: React.ReactNode }) {
  // Get OSMO price from hook
  const { osmoPrice, loading: osmoPriceLoading, error: osmoPriceError } = useOsmoPrice();

  // Use refs to track state to prevent infinite loops
  const initialLoadRef = useRef(false);
  const isRefreshingRef = useRef(false);
  const isConnectingRef = useRef(false);
  
  const [state, setState] = useState<IBCTokenState>({
    chains: {
      'osmosis-1': {
        name: 'Osmosis',
        price: null,
        marketCap: null,
        volume24h: null,
        tvl: null,
        balance: 0,
        loading: true,
        error: null,
        lastUpdated: null,
        staking: {
          poolId: OSMOSIS_CONFIG.POOLS.PAGE_OSMO.ID,
          isStaking: false,
          stakedAmount: 0,
          rewards: 0,
          apr: null
        },
        tokenInfo: {
          supply: OSMOSIS_CONFIG.PAGE_TOKEN.CIRCULATING_SUPPLY,
          holders: null
        }
      }
    },
    isKeplrAvailable: false,
    isKeplrConnected: false,
    keplrAddress: null
  });
  
  // Use ref to track current state without triggering re-renders
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Check if Keplr is available
  useEffect(() => {
    const checkKeplrAvailability = () => {
      const isAvailable = typeof window !== 'undefined' && !!window.keplr;
      setState(prev => ({
        ...prev,
        isKeplrAvailable: isAvailable
      }));
    };
    
    checkKeplrAvailability();
    
    // Listen for Keplr keystorechange events
    if (typeof window !== 'undefined') {
      window.addEventListener('keplr_keystorechange', checkKeplrAvailability);
      return () => {
        window.removeEventListener('keplr_keystorechange', checkKeplrAvailability);
      };
    }
  }, []);

  // Refresh data for osmosis chain
  const refreshChainData = useCallback(async (chainId: string) => {
    // Skip if not supported or already refreshing
    if (!stateRef.current.chains[chainId] || isRefreshingRef.current) return;
    
    isRefreshingRef.current = true;
    
    // Update loading state
    setState(prev => ({
      ...prev,
      chains: {
        ...prev.chains,
        [chainId]: {
          ...prev.chains[chainId],
          loading: true,
          error: null
        }
      }
    }));

    try {
      console.log(`Refreshing chain data for ${chainId}`);
      
      // Fetch all token data in a single call using our new client
      const { poolData, priceData, userBalance } = await osmosisClient.fetchAllTokenData(
        osmoPrice, 
        stateRef.current.isKeplrConnected ? stateRef.current.keplrAddress || undefined : undefined
      );
      
      console.log("Fetched data:", { poolData, priceData, userBalance });

      // Update state with all fetched data
      setState(prev => ({
        ...prev,
        chains: {
          ...prev.chains,
          [chainId]: {
            ...prev.chains[chainId],
            price: priceData.price,
            marketCap: priceData.marketCap,
            tvl: priceData.tvl,
            balance: userBalance ?? 0,
            poolData,
            loading: false,
            error: null,
            lastUpdated: new Date()
          }
        }
      }));
      console.log("State updated successfully");
    } catch (error) {
      console.error(`Error refreshing chain data for ${chainId}:`, error);
      setState(prev => ({
        ...prev,
        chains: {
          ...prev.chains,
          [chainId]: {
            ...prev.chains[chainId],
            loading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            lastUpdated: new Date()
          }
        }
      }));
    } finally {
      isRefreshingRef.current = false;
    }
  }, [osmoPrice]);

  // Refresh all chains
  const refreshAllData = useCallback(async () => {
    console.log("Refreshing all chain data");
    await refreshChainData('osmosis-1');
  }, [refreshChainData]);

  // Connect to Keplr wallet
  const connectKeplr = useCallback(async (): Promise<string | null> => {
    // Skip if already connecting or Keplr not available
    if (isConnectingRef.current || !state.isKeplrAvailable) {
      console.log("Skipping Keplr connection attempt:", 
        isConnectingRef.current ? "already connecting" : "Keplr not available");
      return null;
    }
    
    isConnectingRef.current = true;
    console.log("Connecting to Keplr wallet");
    
    try {
      const chainId = 'osmosis-1';
      await window.keplr!.enable(chainId);
      const key = await window.keplr!.getKey(chainId);
      const address = key.bech32Address;
      console.log("Connected to Keplr address:", address);

      // Update connection state
      setState(prev => ({
        ...prev,
        isKeplrConnected: true,
        keplrAddress: address
      }));

      // After connecting, refresh to get balance
      refreshChainData(chainId).catch(console.error);
      
      return address;
    } catch (error) {
      console.error("Failed to connect to Keplr", error);
      setState(prev => ({
        ...prev,
        chains: {
          ...prev.chains,
          'osmosis-1': {
            ...prev.chains['osmosis-1'],
            error: 'Failed to connect to Keplr'
          }
        }
      }));
      return null;
    } finally {
      isConnectingRef.current = false;
    }
  }, [state.isKeplrAvailable, refreshChainData]);

  // Disconnect Keplr wallet
  const disconnectKeplr = useCallback(() => {
    console.log("Disconnecting Keplr wallet");
    setState(prev => ({
      ...prev,
      isKeplrConnected: false,
      keplrAddress: null
    }));
  }, []);

  // Effect to update data when OSMO price changes
  useEffect(() => {
    // Only run this effect if osmoPrice has a value and isn't null
    if (osmoPrice !== null) {
      console.log("OSMO price updated, refreshing token data:", osmoPrice);
      refreshChainData('osmosis-1').catch(console.error);
    }
  }, [osmoPrice, refreshChainData]); 

  // Load initial data only once
  useEffect(() => {
    if (!initialLoadRef.current) {
      console.log("Initial IBCToken data load");
      initialLoadRef.current = true;
      
      // Load token data even without Keplr
      refreshAllData().catch(console.error);
      
      // Try to connect to Keplr if available after a delay
      if (state.isKeplrAvailable) {
        setTimeout(() => {
          connectKeplr().catch(console.error);
        }, 1000);
      }
      
      // Set up periodic refresh
      const intervalId = setInterval(() => {
        refreshAllData().catch(console.error);
      }, OSMOSIS_CONFIG.REFRESH_INTERVALS.PRICE_DATA);
      
      return () => {
        clearInterval(intervalId);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isKeplrAvailable]); // Only re-run if Keplr availability changes

  // Create a stable context value using useMemo
  const contextValue = React.useMemo(() => ({
    ...state,
    connectKeplr,
    disconnectKeplr,
    refreshChainData,
    refreshAllData
  }), [state, connectKeplr, disconnectKeplr, refreshChainData, refreshAllData]);

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
