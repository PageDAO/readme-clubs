// src/providers/IBCTokenProvider.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { COSMOS_PAGE_TOKEN } from '../config/tokenConfig';

// Define constants for API endpoints
const OSMOSIS_LCD = "https://lcd.osmosis.zone";
const POOL_ID = "1344"; // The pool ID for PAGE/OSMO
const PAGE_DENOM = "ibc/23A62409E4AD8133116C249B1FA38EED30E500A115D7B153109462CD82C1CD99";
const COINGECKO_API = "https://api.coingecko.com/api/v3";
const DAODAO_INDEXER_URL = "https://indexer.daodao.zone";
const PAGE_DAO_ADDRESS = "osmo1a40j922z0kwqhw2nn0nx66ycyk88vyzcs73fyjrd092cjgyvyjksrd8dp7";
const CHAIN_ID = "osmosis-1";
const PAGE_STAKING_REWARDS_PER_MINUTE = 19; // 19 $PAGE per minute

// Define the types for our IBC chains
export interface IBCTokenChain {
  name: string;
  price: number | null;
  tvl: number | null;
  balance: number;
  marketCap: number | null;
  volume24h: number | null;
  priceChange24h: number | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  staking: {
    poolId: string | null;
    isStaking: boolean;
    stakedAmount: number;
    rewards: number;
    apr: number;
  };
  tokenInfo: {
    supply: number;
    holders: number;
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

// Helper function to calculate APR
const calculateAPR = (totalStaked: number, rewardsPerMinute: number) => {
  if (!totalStaked || totalStaked === 0) return 0;
  
  const annualRewards = rewardsPerMinute * 60 * 24 * 365; // Rewards per year
  const apr = (annualRewards / totalStaked) * 100; // APR in percentage
  return apr;
};

const DEFAULT_CHAIN_STATE: IBCTokenChain = {
  name: 'Osmosis',
  price: null,
  tvl: null,
  balance: 0,
  marketCap: null,
  volume24h: null,
  priceChange24h: null,
  loading: true,
  error: null,
  lastUpdated: null,
  staking: {
    poolId: POOL_ID,
    isStaking: false,
    stakedAmount: 0,
    rewards: 0,
    apr: 0
  },
  tokenInfo: {
    supply: 0,
    holders: 0
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
          poolId: POOL_ID
        }
      }
    },
    isKeplrConnected: false
  });
  
  // Use refs to prevent infinite loops
  const initialDataLoadedRef = useRef(false);
  const isRefreshingDataRef = useRef(false);
  const isConnectingKeplrRef = useRef(false);

  // Function to fetch PageDAO staking data
  const fetchPageDAOStakingData = useCallback(async (): Promise<{
    totalStaked: number,
    holders: number
  }> => {
    try {
      // First, get the voting module contract address
      const votingModuleUrl = `${DAODAO_INDEXER_URL}/${CHAIN_ID}/contract/${PAGE_DAO_ADDRESS}/daoCore/votingModule`;
      const votingModuleRes = await fetch(votingModuleUrl);
      if (!votingModuleRes.ok) {
        throw new Error(`HTTP error: ${votingModuleRes.status}`);
      }
      const votingModuleAddress = await votingModuleRes.text();
      
      // Now get the total staked tokens
      const totalStakedUrl = `${DAODAO_INDEXER_URL}/${CHAIN_ID}/contract/${votingModuleAddress}/daoVotingTokenStaked/totalPower`;
      const totalStakedRes = await fetch(totalStakedUrl);
      if (!totalStakedRes.ok) {
        throw new Error(`HTTP error: ${totalStakedRes.status}`);
      }
      const totalStakedData = await totalStakedRes.text();
      const totalStaked = Number(totalStakedData) / 1e8;
      
      // Get stakers count
      const stakersUrl = `${DAODAO_INDEXER_URL}/${CHAIN_ID}/contract/${votingModuleAddress}/daoVotingTokenStaked/listStakers`;
      const stakersRes = await fetch(stakersUrl);
      if (!stakersRes.ok) {
        throw new Error(`HTTP error: ${stakersRes.status}`);
      }
      const stakersData = await stakersRes.json();
      const holders = stakersData.stakers?.length || 0;
      
      return { totalStaked, holders };
    } catch (error) {
      console.error("Error fetching PageDAO staking data:", error);
      throw error; // Re-throw to propagate the error
    }
  }, []);

  // Function to fetch token data from Osmosis API
  const fetchTokenData = useCallback(async (chainId: string): Promise<{
    price: number, 
    tvl: number, 
    totalStaked: number,
    marketCap: number,
    volume24h: number,
    priceChange24h: number,
    supply: number
  }> => {
    console.log("Fetching token data for", chainId);
    
    // Fetch Osmosis pool data
    const poolUrl = `${OSMOSIS_LCD}/osmosis/gamm/v1beta1/pools/${POOL_ID}`;
    const poolResponse = await fetch(poolUrl);
    if (!poolResponse.ok) {
      throw new Error(`Failed to fetch pool data: ${poolResponse.status}`);
    }
    const poolData = await poolResponse.json();
    
    // Fetch OSMO price
    const osmoPriceUrl = `${COINGECKO_API}/simple/price?ids=osmosis&vs_currencies=usd`;
    const osmoPriceRes = await fetch(osmoPriceUrl);
    if (!osmoPriceRes.ok) {
      throw new Error(`Failed to fetch OSMO price: ${osmoPriceRes.status}`);
    }
    const osmoPriceData = await osmoPriceRes.json();
    const osmoPrice = osmoPriceData.osmosis.usd;
    
    // Extract token amounts from pool data
    const assets = poolData.pool?.pool_assets?.map((asset: any) => ({
      token: asset.token?.denom,
      amount: asset.token?.amount,
    }));
    
    const osmoAmount = assets?.find((a: any) => a.token === "uosmo")?.amount || "0";
    const pageAmount = assets?.find((a: any) => a.token === PAGE_DENOM)?.amount || "0";
    
    const osmoInPool = Number(osmoAmount) / 1e6;
    const pageInPool = Number(pageAmount) / 1e8;
    
    // Calculate PAGE price in USD
    const pagePriceUsd = (osmoInPool * osmoPrice) / pageInPool;
    
    // Calculate TVL
    const tvl = osmoInPool * 2 * osmoPrice;
    
    // Fetch total staked amount
    const totalStakedUrl = `${OSMOSIS_LCD}/osmosis/lockup/v1beta1/tokens_in_poollock?pool_id=${POOL_ID}`;
    const totalStakedRes = await fetch(totalStakedUrl);
    if (!totalStakedRes.ok) {
      throw new Error(`Failed to fetch staking data: ${totalStakedRes.status}`);
    }
    const totalStakedData = await totalStakedRes.json();
    
    let totalStaked = 0;
    const stakedTokens = totalStakedData.tokens || [];
    const poolSharesStaked = stakedTokens.find((token: any) => token.denom?.includes('gamm/pool/' + POOL_ID))?.amount || "0";
    totalStaked = Number(poolSharesStaked) / 1e18;
    
    // Fetch PAGE token supply on Osmosis
    const supplyUrl = `${OSMOSIS_LCD}/cosmos/bank/v1beta1/supply/by_denom?denom=${PAGE_DENOM}`;
    const supplyRes = await fetch(supplyUrl);
    if (!supplyRes.ok) {
      throw new Error(`Failed to fetch token supply: ${supplyRes.status}`);
    }
    const supplyData = await supplyRes.json();
    const pageSupply = Number(supplyData.amount?.amount || "0") / 1e8;
    
    // Calculate market cap based on supply and price
    const marketCap = pageSupply * pagePriceUsd;
    
    // Initialize volume and price change
    let volume24h = 0;
    let priceChange24h = 0;
    
    // Try to get volume from CoinGecko
    const cgDataUrl = `${COINGECKO_API}/coins/osmosis`;
    const cgRes = await fetch(cgDataUrl);
    if (cgRes.ok) {
      const cgData = await cgRes.json();
      
      // Find PAGE token in the list of tokens on Osmosis
      const pageToken = cgData.tokens?.find((t: any) => 
        t.denom === PAGE_DENOM || t.symbol?.toLowerCase() === 'page'
      );
      
      if (pageToken) {
        volume24h = pageToken.volume_24h || 0;
        priceChange24h = pageToken.price_change_percentage_24h || 0;
      }
    }
    
    // If CoinGecko doesn't have volume data, try Osmosis API
    if (volume24h === 0) {
      const volumeUrl = `${OSMOSIS_LCD}/osmosis/gamm/v1beta1/pool/${POOL_ID}/volume`;
      const volumeRes = await fetch(volumeUrl);
      if (volumeRes.ok) {
        const volumeData = await volumeRes.json();
        volume24h = Number(volumeData.volume?.amount || 0) / 1e6 * osmoPrice;
      }
    }
    
    // If we still don't have volume data, throw an error
    if (volume24h === 0) {
      throw new Error("Could not fetch volume data");
    }
    
    return {
      price: pagePriceUsd,
      tvl: tvl,
      totalStaked: totalStaked,
      marketCap: marketCap,
      volume24h: volume24h,
      priceChange24h: priceChange24h,
      supply: pageSupply
    };
  }, []);

  // Function to fetch user's balance
  const fetchUserBalance = useCallback(async (chainId: string, address: string): Promise<number> => {
    console.log("Fetching balance for", chainId, address);
    
    // Fetch user's PAGE balance
    const balanceUrl = `${OSMOSIS_LCD}/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=${PAGE_DENOM}`;
    const balanceRes = await fetch(balanceUrl);
    
    if (!balanceRes.ok) {
      throw new Error(`HTTP error! Status: ${balanceRes.status}`);
    }
    
    const balanceData = await balanceRes.json();
    const amount = balanceData.amount?.amount || "0";
    
    // Convert to number and adjust for decimals
    return Number(amount) / 1e8;
  }, []);

  // Function to fetch staking info
  const fetchStakingInfo = useCallback(async (chainId: string, address: string): Promise<IBCTokenChain['staking']> => {
    console.log("Fetching staking info for", chainId, address);
    
    // Fetch user's staked amount in Pool 1344
    const userStakingUrl = `${OSMOSIS_LCD}/osmosis/lockup/v1beta1/account_locked_coins/${address}`;
    const userStakingRes = await fetch(userStakingUrl);
    
    if (!userStakingRes.ok) {
      throw new Error(`HTTP error! Status: ${userStakingRes.status}`);
    }
    
    const userStakingData = await userStakingRes.json();
    const lockedCoins = userStakingData.coins || [];
    
    let stakedAmount = 0;
    
    // Extract pool shares (GAMM tokens)
    for (const coin of lockedCoins) {
      if (coin.denom?.includes('gamm/pool/' + POOL_ID)) {
        stakedAmount += Number(coin.amount) / 1e18;
      }
    }
    
    const isStaking = stakedAmount > 0;
    
    // Calculate rewards based on stake (simplified)
    const rewards = isStaking ? PAGE_STAKING_REWARDS_PER_MINUTE * (stakedAmount / 10000) : 0;
    
    // Calculate APR
    const apr = calculateAPR(stakedAmount, rewards);
    
    return {
      poolId: POOL_ID,
      isStaking,
      stakedAmount,
      rewards,
      apr
    };
  }, []);

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
          loading: true,
          error: null // Reset error when starting refresh
        }
      }
    }));

    try {
      // Fetch token data - if this fails, it will throw
      const tokenData = await fetchTokenData(chainId);
      
      // Fetch PageDAO staking data - if this fails, it will throw
      let pageDAOData = { totalStaked: 0, holders: 0 };
      if (chainId === 'osmosis-1') {
        pageDAOData = await fetchPageDAOStakingData();
      }
      
      // Initialize user data
      let balance = 0;
      let staking = state.chains[chainId].staking;
      
      // Only fetch user data if connected to Keplr
      if (state.isKeplrConnected && typeof window !== 'undefined' && window.keplr) {
        try {
          // Get the user's address
          await window.keplr.enable(chainId);
          const key = await window.keplr.getKey(chainId);
          const address = key.bech32Address;
          
          // Fetch balance and staking info
          balance = await fetchUserBalance(chainId, address);
          staking = await fetchStakingInfo(chainId, address);
        } catch (userError) {
          console.error("Error fetching user data:", userError);
          // Don't throw here - we still have token data
        }
      }

      // Update state with all fetched data
      setState(prev => ({
        ...prev,
        chains: {
          ...prev.chains,
          [chainId]: {
            ...prev.chains[chainId],
            price: tokenData.price,
            tvl: tokenData.tvl,
            marketCap: tokenData.marketCap,
            volume24h: tokenData.volume24h,
            priceChange24h: tokenData.priceChange24h,
            balance,
            loading: false,
            error: null,
            lastUpdated: new Date(),
            staking,
            tokenInfo: {
              supply: tokenData.supply,
              holders: pageDAOData.holders
            }
          }
        }
      }));
    } catch (error) {
      console.error(`Error refreshing ${chainId} data:`, error);
      // Update state with error
      setState(prev => ({
        ...prev,
        chains: {
          ...prev.chains,
          [chainId]: {
            ...prev.chains[chainId],
            loading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            // Don't update other values so we maintain "ERROR" state
            lastUpdated: new Date()
          }
        }
      }));
    }
  }, [fetchTokenData, fetchUserBalance, fetchStakingInfo, fetchPageDAOStakingData, state.chains, state.isKeplrConnected]);

  // Function to refresh all chains
  const refreshAllData = useCallback(async () => {
    // Prevent multiple concurrent refreshes
    if (isRefreshingDataRef.current) {
      console.log("Already refreshing data, skipping duplicate request");
      return;
    }
    
    isRefreshingDataRef.current = true;
    console.log("Refreshing all chains");
    
    try {
      const chainIds = Object.keys(state.chains);
      for (const chainId of chainIds) {
        await refreshChainData(chainId);
      }
    } finally {
      isRefreshingDataRef.current = false;
    }
  }, [refreshChainData, state.chains]);

  // Function to connect to Keplr wallet
  const connectKeplr = useCallback(async (): Promise<string | null> => {
    // Prevent multiple concurrent connection attempts
    if (isConnectingKeplrRef.current) {
      console.log("Already connecting to Keplr, skipping duplicate request");
      return null;
    }
    
    isConnectingKeplrRef.current = true;
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

      // Update connection state
      setState(prev => ({
        ...prev,
        isKeplrConnected: true
      }));

      // Just refresh balance data for the connected wallet
      if (initialDataLoadedRef.current) {
        // Refresh only the necessary data after connecting
        for (const chainId of chainIds) {
          try {
            if (window.keplr) {
              await window.keplr.enable(chainId);
              const key = await window.keplr.getKey(chainId);
              const address = key.bech32Address;
              
              const balance = await fetchUserBalance(chainId, address);
              const staking = await fetchStakingInfo(chainId, address);
              
              setState(prev => ({
                ...prev,
                chains: {
                  ...prev.chains,
                  [chainId]: {
                    ...prev.chains[chainId],
                    balance,
                    staking,
                    lastUpdated: new Date()
                  }
                }
              }));
            }
          } catch (err) {
            console.error(`Error updating balance for ${chainId}:`, err);
          }
        }
      }

      return address;
    } catch (error) {
      console.error("Failed to connect to Keplr", error);
      return null;
    } finally {
      isConnectingKeplrRef.current = false;
    }
  }, [state.chains, fetchUserBalance, fetchStakingInfo]);

  // Load initial data only once
  useEffect(() => {
    if (!initialDataLoadedRef.current) {
      console.log("IBCTokenProvider initialized");
      
      // First, fetch the data
      refreshAllData().catch(console.error);
      
      // Mark as initialized to prevent repeated refreshes
      initialDataLoadedRef.current = true;
      
      // Then try to connect to Keplr if available
      if (typeof window !== 'undefined' && window.keplr) {
        // We delay this slightly to ensure the initial data fetch has started
        setTimeout(() => {
          connectKeplr().catch(console.error);
        }, 100);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty to run only once

  const contextValue = {
    ...state,
    connectKeplr,
    refreshChainData,
    refreshAllData
  };
  
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