// src/components/token/TokenDataProvider.tsx - Revised version

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { formatUnits } from 'viem';
import type { Address } from 'viem';
import { PAGE_TOKENS } from '../../config/tokenConfig';

// ------------------- TYPES -------------------

interface ChainData {
  price: number | null;
  tvl: number | null;
  balance: number;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface TokenDataState {
  ethPrice: number | null;
  chains: {
    base: ChainData;
    ethereum: ChainData;
    optimism: ChainData;
  };
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface TokenDataContextType extends TokenDataState {
  refreshAllData: () => Promise<void>;
}

type TokenDataAction =
  | { type: 'SET_ETH_PRICE'; payload: number }
  | { type: 'SET_ETH_PRICE_LOADING'; payload: boolean }
  | { type: 'SET_ETH_PRICE_ERROR'; payload: string }
  | { type: 'UPDATE_CHAIN_DATA'; chain: 'base' | 'ethereum' | 'optimism'; payload: Partial<ChainData> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LAST_UPDATED'; payload: Date };


// ------------------- CONTRACT ABIS -------------------

const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
] as const;

const UNISWAP_V2_PAIR_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'getReserves',
    outputs: [
      { name: 'reserve0', type: 'uint112' },
      { name: 'reserve1', type: 'uint112' },
      { name: 'blockTimestampLast', type: 'uint32' },
    ],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'token0',
    outputs: [{ name: '', type: 'address' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'token1',
    outputs: [{ name: '', type: 'address' }],
    type: 'function',
  },
] as const;

// ------------------- CONTEXT SETUP -------------------

const TokenDataContext = createContext<TokenDataContextType | null>(null);

// Initial state with proper types
const initialState: TokenDataState = {
  ethPrice: null,
  chains: {
    base: { price: null, tvl: null, balance: 0, loading: true, error: null, lastUpdated: null },
    ethereum: { price: null, tvl: null, balance: 0, loading: true, error: null, lastUpdated: null },
    optimism: { price: null, tvl: null, balance: 0, loading: true, error: null, lastUpdated: null }
  },
  loading: true,
  error: null,
  lastUpdated: null
};

// Reducer for state management
function tokenDataReducer(state: TokenDataState, action: TokenDataAction): TokenDataState {
  switch (action.type) {
    case 'SET_ETH_PRICE':
      return { ...state, ethPrice: action.payload };
    case 'SET_ETH_PRICE_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ETH_PRICE_ERROR':
      return { ...state, error: action.payload };
    case 'UPDATE_CHAIN_DATA':
      return {
        ...state,
        chains: {
          ...state.chains,
          [action.chain]: { ...state.chains[action.chain], ...action.payload }
        }
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_LAST_UPDATED':
      return { ...state, lastUpdated: action.payload };
    default:
      return state;
  }
}

// ------------------- PROVIDER COMPONENT -------------------

export function TokenDataProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(tokenDataReducer, initialState);
  const { address } = useAccount();

  // Chain configs from centralized config
  const baseConfig = PAGE_TOKENS.find(token => token.chainId === 8453);
  const ethereumConfig = PAGE_TOKENS.find(token => token.chainId === 1);
  const optimismConfig = PAGE_TOKENS.find(token => token.chainId === 10);

  // ----- ETH PRICE FETCHING -----
  const fetchEthPrice = useCallback(async () => {
    dispatch({ type: 'SET_ETH_PRICE_LOADING', payload: true });
    
    try {
      console.log('Fetching ETH price from TokenDataProvider');
      const response = await fetch(
        'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD'
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      const ethPrice = data.USD;
      
      if (!ethPrice) {
        throw new Error('ETH price not found in response');
      }
      
      console.log('Successfully fetched ETH price:', ethPrice);
      dispatch({ type: 'SET_ETH_PRICE', payload: ethPrice });
      return ethPrice;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching ETH price';
      console.error('Failed to fetch ETH price:', error);
      dispatch({ type: 'SET_ETH_PRICE_ERROR', payload: errorMessage });
      return null;
    } finally {
      dispatch({ type: 'SET_ETH_PRICE_LOADING', payload: false });
    }
  }, []);

  // Use contract reads for each chain's token data
  const { data: baseTokenBalance } = useContractRead({
    address: baseConfig?.address as Address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: 8453,
  });

  const { data: ethTokenBalance } = useContractRead({
    address: ethereumConfig?.address as Address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: 1,
  });

  const { data: optimismTokenBalance } = useContractRead({
    address: optimismConfig?.address as Address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: 10,
  });

  // Use contract reads for LP data to calculate prices
  const { data: baseReserves } = useContractRead({
    address: baseConfig?.lpAddress as Address,
    abi: UNISWAP_V2_PAIR_ABI, // Defined elsewhere in the file
    functionName: 'getReserves',
    chainId: 8453,
  });

  const { data: ethReserves } = useContractRead({
    address: ethereumConfig?.lpAddress as Address,
    abi: UNISWAP_V2_PAIR_ABI,
    functionName: 'getReserves',
    chainId: 1,
  });

  const { data: optimismReserves } = useContractRead({
    address: optimismConfig?.lpAddress as Address,
    abi: UNISWAP_V2_PAIR_ABI,
    functionName: 'getReserves',
    chainId: 10,
  });

  // Update token balances when data becomes available
  useEffect(() => {
    if (baseTokenBalance && baseConfig) {
      const balance = Number(formatUnits(baseTokenBalance as bigint, baseConfig.decimals));
      dispatch({
        type: 'UPDATE_CHAIN_DATA',
        chain: 'base',
        payload: { balance, lastUpdated: new Date() }
      });
    }
  }, [baseTokenBalance, baseConfig]);

  useEffect(() => {
    if (ethTokenBalance && ethereumConfig) {
      const balance = Number(formatUnits(ethTokenBalance as bigint, ethereumConfig.decimals));
      dispatch({
        type: 'UPDATE_CHAIN_DATA',
        chain: 'ethereum',
        payload: { balance, lastUpdated: new Date() }
      });
    }
  }, [ethTokenBalance, ethereumConfig]);

  useEffect(() => {
    if (optimismTokenBalance && optimismConfig) {
      const balance = Number(formatUnits(optimismTokenBalance as bigint, optimismConfig.decimals));
      dispatch({
        type: 'UPDATE_CHAIN_DATA',
        chain: 'optimism',
        payload: { balance, lastUpdated: new Date() }
      });
    }
  }, [optimismTokenBalance, optimismConfig]);

  useEffect(() => {
    if (baseReserves && state.ethPrice && baseConfig) {
      try {
        // Log detailed calculation steps for Base
        console.log("Calculating Base price with:", {
          baseReserves,
          ethPrice: state.ethPrice,
          pageDecimals: baseConfig.decimals
        });
        
        const [reserve0, reserve1] = baseReserves as [bigint, bigint, number];
        const ethReserve = Number(formatUnits(reserve0, 18)); // ETH is token0 on Base
        const pageReserve = Number(formatUnits(reserve1, baseConfig.decimals)); // PAGE is token1
        
        console.log("Base calculation values:", {
          ethReserve,
          pageReserve,
          reserve0: reserve0.toString(),
          reserve1: reserve1.toString()
        });
        
        const pagePriceInUsd = (state.ethPrice * ethReserve) / pageReserve;
        const tvl = (ethReserve * state.ethPrice) * 2; // Simplified TVL calculation
        
        console.log("Base calculation results:", {
          pagePriceInUsd,
          tvl
        });
        
        dispatch({
          type: 'UPDATE_CHAIN_DATA',
          chain: 'base',
          payload: { price: pagePriceInUsd, tvl, loading: false, error: null }
        });
      } catch (error) {
        console.error('Error calculating Base price:', error);
        dispatch({
          type: 'UPDATE_CHAIN_DATA',
          chain: 'base',
          payload: { error: 'Failed to calculate price', loading: false }
        });
      }
    }
  }, [baseReserves, state.ethPrice, baseConfig]);

  useEffect(() => {
    console.log("Base token balance:", baseTokenBalance);
    console.log("Base reserves:", baseReserves);
    console.log("Base config:", baseConfig);
  }, [baseTokenBalance, baseReserves, baseConfig]);

// Calculate prices and TVL for Ethereum
useEffect(() => {
    if (ethReserves && state.ethPrice && ethereumConfig) {
      try {
        // Type check the reserves data
        const reserves = ethReserves as [bigint, bigint, number];
        if (!reserves) {
          console.log("No Ethereum reserve data available");
          return;
        }
        
        const [reserve0, reserve1] = reserves;
        const ethReserve = Number(formatUnits(reserve1, 18));
        const pageReserve = Number(formatUnits(reserve0, ethereumConfig.decimals));
        const pagePriceInUsd = (state.ethPrice * ethReserve) / pageReserve;
        const tvl = (ethReserve * state.ethPrice) * 2; // Simplified calculation
        
        dispatch({
          type: 'UPDATE_CHAIN_DATA',
          chain: 'ethereum',
          payload: { price: pagePriceInUsd, tvl, loading: false, error: null }
        });
      } catch (error) {
        console.error('Error calculating Ethereum price:', error);
        dispatch({
          type: 'UPDATE_CHAIN_DATA',
          chain: 'ethereum',
          payload: { error: 'Failed to calculate price', loading: false }
        });
      }
    }
  }, [ethReserves, state.ethPrice, ethereumConfig]);

  useEffect(() => {
    console.log("Ethereum token balance:", ethTokenBalance);
    console.log("Ethereum reserves:", ethReserves);
    console.log("Ethereum config:", ethereumConfig);
  }, [ethTokenBalance, ethReserves, ethereumConfig]);
  
  // Calculate prices and TVL for Optimism
  useEffect(() => {
    if (optimismReserves && state.ethPrice && optimismConfig) {
      try {
        // Log detailed calculation steps
        console.log("Calculating Optimism price with:", {
          optimismReserves,
          ethPrice: state.ethPrice,
          pageDecimals: optimismConfig.decimals
        });
        
        const reserves = optimismReserves as [bigint, bigint, number];
        if (!reserves) {
          console.log("No Optimism reserve data available");
          return;
        }
        
        const [reserve0, reserve1] = reserves;
        
        // Assuming same order as Ethereum (PAGE is token0, ETH is token1)
        const ethReserve = Number(formatUnits(reserve1, 18));
        const pageReserve = Number(formatUnits(reserve0, optimismConfig.decimals));
        
        console.log("Optimism calculation values:", {
          ethReserve,
          pageReserve,
          reserve0: reserve0.toString(),
          reserve1: reserve1.toString()
        });
        
        const pagePriceInUsd = (state.ethPrice * ethReserve) / pageReserve;
        const tvl = (ethReserve * state.ethPrice) * 2; // Simplified calculation
        
        console.log("Optimism calculation results:", {
          pagePriceInUsd,
          tvl
        });
        
        dispatch({
          type: 'UPDATE_CHAIN_DATA',
          chain: 'optimism',
          payload: { price: pagePriceInUsd, tvl, loading: false, error: null }
        });
      } catch (error) {
        console.error('Error calculating Optimism price:', error);
        dispatch({
          type: 'UPDATE_CHAIN_DATA',
          chain: 'optimism',
          payload: { error: 'Failed to calculate price', loading: false }
        });
      }
    }
  }, [optimismReserves, state.ethPrice, optimismConfig]);

  // Add this to check if Optimism config is correct
useEffect(() => {
    console.log("Optimism LP address:", optimismConfig?.lpAddress);
    
    // Also verify the RPC is working by checking chain ID
    try {
      console.log("Checking Optimism RPC connection...");
      // If using wagmi, there might be chain status info you can log
    } catch (error) {
      console.error("Error checking Optimism connection:", error);
    }
  }, [optimismConfig]);

  useEffect(() => {
    console.log("Optimism token balance:", optimismTokenBalance);
    console.log("Optimism reserves:", optimismReserves);
    console.log("Optimism config:", optimismConfig);
  }, [optimismTokenBalance, optimismReserves, optimismConfig]);
  
  // Function to refresh all data
  const refreshAllData = useCallback(async () => {
    console.log('Refreshing all token data...');
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await fetchEthPrice();
      // The contract data will be refreshed automatically via the hooks
      
      dispatch({ type: 'SET_LAST_UPDATED', payload: new Date() });
    } catch (error) {
      console.error('Error refreshing all data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh all data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [fetchEthPrice]);

  // Initial data fetch
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);
  
  // Calculate global loading state
  const isLoading = state.loading || Object.values(state.chains).some(chain => chain.loading);

  // Prepare the context value
  const contextValue: TokenDataContextType = {
    ...state,
    loading: isLoading,
    refreshAllData
  };

  return (
    <TokenDataContext.Provider value={contextValue}>
      {children}
    </TokenDataContext.Provider>
  );
}

export function useTokenData() {
  const context = useContext(TokenDataContext);
  if (!context) {
    throw new Error('useTokenData must be used within a TokenDataProvider');
  }
  return context;
}