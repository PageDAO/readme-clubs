import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { COSMOS_PAGE_TOKEN } from '../config/tokenConfig';
import { fetchOsmoPrice, calculatePagePrice, calculateTVL, calculateMarketCap } from '../utils/tokenPrices';
import { useOsmoPrice } from '../hooks/token/useOsmoPrice';

// Constants
const OSMOSIS_PAGE_DENOM = "ibc/23A62409E4AD8133116C249B1FA38EED30E500A115D7B153109462CD82C1CD99";
const POOL_ID = "1344"; // The pool ID for PAGE/OSMO
const OSMOSIS_LCD = "https://lcd.osmosis.zone";
const PAGE_CIRCULATING_SUPPLY = 42500000; // Approximate circulating supply of PAGE

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

interface PoolData {
  pageAmount: string;
  osmoAmount: string;
  poolId: string;
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
  // Add the hook to your component
  const { osmoPrice, loading: osmoPriceLoading, error: osmoPriceError } = useOsmoPrice();

  // Use refs to track state and prevent infinite loops
  const initialLoadRef = useRef(false);
  const isRefreshingRef = useRef(false);
  const isConnectingRef = useRef(false);
  const requestsInProgressRef = useRef<Set<string>>(new Set());
  
  const [state, setState] = useState<IBCTokenState>({
    chains: {
      'osmosis-1': {
        name: 'Osmosis',
        price: null,
        marketCap: null,
        volume24h: null,
        tvl: null,
        balance: 0,
        loading: true, // Start with loading state
        error: null,
        lastUpdated: null,
        staking: {
          poolId: POOL_ID,
          isStaking: false,
          stakedAmount: 0,
          rewards: 0,
          apr: null
        },
        tokenInfo: {
          supply: PAGE_CIRCULATING_SUPPLY,
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

  // Fetch token data from Osmosis pool
  const fetchTokenData = useCallback(async () => {
    const requestId = "fetchTokenData";
    if (requestsInProgressRef.current.has(requestId)) {
      return null;
    }
    
    requestsInProgressRef.current.add(requestId);
    
    try {
      // Get pool data
      const poolResponse = await fetch(`${OSMOSIS_LCD}/osmosis/gamm/v1beta1/pools/${POOL_ID}`);
      
      if (!poolResponse.ok) {
        throw new Error(`Failed to fetch pool data: ${poolResponse.statusText}`);
      }
      
      const poolData = await poolResponse.json();
      const assets = poolData.pool?.pool_assets;
      
      if (!assets || assets.length !== 2) {
        throw new Error("Invalid pool data structure");
      }
      
      // Find PAGE token and OSMO token in pool assets
      const pageAsset = assets.find((asset: any) => 
        asset.token.denom === OSMOSIS_PAGE_DENOM
      );
      const osmoAsset = assets.find((asset: any) => 
        asset.token.denom === "uosmo"
      );
      
      if (!pageAsset || !osmoAsset) {
        throw new Error("Could not identify tokens in pool");
      }
      
      // Use the osmoPrice from the hook instead of fetching it
      console.log("OSMO price:", osmoPrice);
      
      let price: number | null = null;
      let tvl: number | null = null;
      let marketCap: number | null = null;

      // Only calculate if we have a valid OSMO price
      if (osmoPrice !== null) {
        // Calculate PAGE price based on pool ratio
        const pageAmount = Number(pageAsset.token.amount) / 1e8; // PAGE has 8 decimals
        const osmoAmount = Number(osmoAsset.token.amount) / 1e6; // OSMO has 6 decimals
        
        // PAGE price in USD = (OSMO amount * OSMO price in USD) / PAGE amount
        price = (osmoAmount * osmoPrice) / pageAmount;
        console.log("Calculated PAGE price:", price);
        
        // Calculate TVL
        tvl = pageAmount * price * 2; // Multiply by 2 since it's roughly half the pool
        console.log("Calculated TVL:", tvl);
        
        // Calculate market cap (estimate based on total supply)
        const totalSupply = 100000000; // 100M total supply
        marketCap = totalSupply * price;
        console.log("Calculated market cap:", marketCap);
      }
      
      // Return data with calculations
      const result = {
        poolData: {
          pageAmount: pageAsset.token.amount,
          osmoAmount: osmoAsset.token.amount,
          poolId: POOL_ID
        },
        price,
        marketCap,
        volume24h: null, // We don't have volume data
        tvl,
        tokenInfo: {
          supply: null,
          holders: null
        }
      };
      
      console.log("Returning processed pool data:", result);
      return result;
    } catch (error) {
      console.error("Error fetching token data:", error);
      throw error;
    } finally {
      requestsInProgressRef.current.delete(requestId);
      console.log("Completed fetchTokenData, removing from in-progress requests");
    }
  }, [osmoPrice]); // Add osmoPrice to dependencies

  // Fetch user balance
  const fetchUserBalance = useCallback(async (address: string): Promise<number> => {
    const requestId = `fetchUserBalance-${address}`;
    if (requestsInProgressRef.current.has(requestId)) {
      return 0;
    }
    
    requestsInProgressRef.current.add(requestId);
    
    try {
      const balanceUrl = `${OSMOSIS_LCD}/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=${OSMOSIS_PAGE_DENOM}`;
      const response = await fetch(balanceUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.statusText}`);
      }
      
      const data = await response.json();
      const amount = data.balance?.amount || "0";
      return Number(amount) / 1e8; // Adjust for decimals (PAGE uses 8 decimals)
    } catch (error) {
      console.error("Error fetching user balance:", error);
      throw error;
    } finally {
      requestsInProgressRef.current.delete(requestId);
    }
  }, []);

  // Fetch staking info
  const fetchStakingInfo = useCallback(async (): Promise<Partial<StakingInfo>> => {
    const requestId = "fetchStakingInfo";
    if (requestsInProgressRef.current.has(requestId)) {
      return {};
    }
    
    requestsInProgressRef.current.add(requestId);
    console.log("Calling fetchStakingInfo");
    
    try {
      // Return null for APR - no estimated values
      console.log("fetchStakingInfo returned:", { apr: null });
      return {
        apr: null
      };
    } catch (error) {
      console.error("Error fetching staking info:", error);
      throw error;
    } finally {
      requestsInProgressRef.current.delete(requestId);
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
      
      // Fetch token data
      const tokenData = await fetchTokenData();
      console.log("fetchTokenData returned:", tokenData);
      
      // Fetch staking info
      console.log("Calling fetchStakingInfo");
      const stakingInfo = await fetchStakingInfo();
      console.log("fetchStakingInfo returned:", stakingInfo);
      
      // Initialize balance
      let balance = 0;
      
      // Only fetch user data if connected to Keplr
      if (stateRef.current.isKeplrConnected && stateRef.current.keplrAddress) {
        // Fetch balance
        console.log("Fetching balance for", stateRef.current.keplrAddress);
        balance = await fetchUserBalance(stateRef.current.keplrAddress);
        console.log("User balance:", balance);
      }

      // Update state
      console.log("Updating state with fetched data");
      setState(prev => ({
        ...prev,
        chains: {
          ...prev.chains,
          [chainId]: {
            ...prev.chains[chainId],
            ...(tokenData || {}),
            balance,
            staking: {
              ...prev.chains[chainId].staking,
              ...(stakingInfo || {})
            },
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
  }, [fetchTokenData, fetchUserBalance, fetchStakingInfo]);

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


  // In IBCTokenProvider, add a useEffect that watches osmoPrice
useEffect(() => {
  // Only run this effect if osmoPrice has a value and isn't null
  if (osmoPrice !== null) {
    console.log("OSMO price updated, refreshing token data:", osmoPrice);
    refreshChainData('osmosis-1').catch(console.error);
  }
}, [osmoPrice, refreshChainData]); // Add osmoPrice as a dependency

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
      }, 60000); // Refresh every minute
      
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
