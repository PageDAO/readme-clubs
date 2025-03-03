import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import type { Address } from 'viem';
import { PAGE_TOKENS } from '../../config/tokenConfig';
import { useEthPrice } from '../../hooks/token/useEthPrice';
import { useTokenBalance } from '../../hooks/token/useTokenBalance';
import { useTokenReserves } from '../../hooks/token/useTokenReserves';

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

  // Use our ethPrice hook
  const { 
    ethPrice, 
    loading: ethPriceLoading, 
    error: ethPriceError, 
    refetch: fetchEthPrice 
  } = useEthPrice();

  // Fetch token balances for each chain
  const { 
    balance: baseBalance, 
    loading: baseBalanceLoading 
  } = useTokenBalance(address, baseConfig);

  const { 
    balance: ethereumBalance, 
    loading: ethereumBalanceLoading 
  } = useTokenBalance(address, ethereumConfig);
  
  const { 
    balance: optimismBalance, 
    loading: optimismBalanceLoading 
  } = useTokenBalance(address, optimismConfig);

  // Get token reserves and price data
  const { 
    tokenPriceUsd: basePrice, 
    tvl: baseTvl, 
    loading: baseReservesLoading,
    error: baseReservesError
  } = useTokenReserves(baseConfig, ethPrice);
  
  const { 
    tokenPriceUsd: ethereumPrice, 
    tvl: ethereumTvl, 
    loading: ethereumReservesLoading,
    error: ethereumReservesError
  } = useTokenReserves(ethereumConfig, ethPrice);
  
  const { 
    tokenPriceUsd: optimismPrice, 
    tvl: optimismTvl, 
    loading: optimismReservesLoading,
    error: optimismReservesError
  } = useTokenReserves(optimismConfig, ethPrice);

  // Update ETH price state
  useEffect(() => {
    if (ethPrice !== null && ethPrice !== state.ethPrice) {
      dispatch({ type: 'SET_ETH_PRICE', payload: ethPrice });
    }
    
    if (ethPriceError && ethPriceError !== state.error) {
      dispatch({ type: 'SET_ERROR', payload: ethPriceError });
    }
  }, [ethPrice, ethPriceError, state.ethPrice, state.error]);

  // Update Base chain data
  useEffect(() => {
    const baseLoading = baseBalanceLoading || baseReservesLoading;
    const baseError = baseReservesError;
    
    if (
      baseBalance !== state.chains.base.balance ||
      basePrice !== state.chains.base.price ||
      baseTvl !== state.chains.base.tvl ||
      baseLoading !== state.chains.base.loading ||
      baseError !== state.chains.base.error
    ) {
      dispatch({
        type: 'UPDATE_CHAIN_DATA',
        chain: 'base',
        payload: {
          balance: baseBalance,
          price: basePrice,
          tvl: baseTvl,
          loading: baseLoading,
          error: baseError,
          lastUpdated: baseLoading ? null : new Date()
        }
      });
    }
  }, [
    baseBalance, basePrice, baseTvl, baseBalanceLoading, baseReservesLoading, baseReservesError,
    state.chains.base.balance, state.chains.base.price, state.chains.base.tvl, 
    state.chains.base.loading, state.chains.base.error
  ]);

  // Update Ethereum chain data
  useEffect(() => {
    const ethereumLoading = ethereumBalanceLoading || ethereumReservesLoading;
    const ethereumError = ethereumReservesError;
    
    if (
      ethereumBalance !== state.chains.ethereum.balance ||
      ethereumPrice !== state.chains.ethereum.price ||
      ethereumTvl !== state.chains.ethereum.tvl ||
      ethereumLoading !== state.chains.ethereum.loading ||
      ethereumError !== state.chains.ethereum.error
    ) {
      dispatch({
        type: 'UPDATE_CHAIN_DATA',
        chain: 'ethereum',
        payload: {
          balance: ethereumBalance,
          price: ethereumPrice,
          tvl: ethereumTvl,
          loading: ethereumLoading,
          error: ethereumError,
          lastUpdated: ethereumLoading ? null : new Date()
        }
      });
    }
  }, [
    ethereumBalance, ethereumPrice, ethereumTvl, ethereumBalanceLoading, ethereumReservesLoading, ethereumReservesError,
    state.chains.ethereum.balance, state.chains.ethereum.price, state.chains.ethereum.tvl, 
    state.chains.ethereum.loading, state.chains.ethereum.error
  ]);

  // Update Optimism chain data
  useEffect(() => {
    const optimismLoading = optimismBalanceLoading || optimismReservesLoading;
    const optimismError = optimismReservesError;
    
    if (
      optimismBalance !== state.chains.optimism.balance ||
      optimismPrice !== state.chains.optimism.price ||
      optimismTvl !== state.chains.optimism.tvl ||
      optimismLoading !== state.chains.optimism.loading ||
      optimismError !== state.chains.optimism.error
    ) {
      dispatch({
        type: 'UPDATE_CHAIN_DATA',
        chain: 'optimism',
        payload: {
          balance: optimismBalance,
          price: optimismPrice,
          tvl: optimismTvl,
          loading: optimismLoading,
          error: optimismError,
          lastUpdated: optimismLoading ? null : new Date()
        }
      });
    }
  }, [
    optimismBalance, optimismPrice, optimismTvl, optimismBalanceLoading, optimismReservesLoading, optimismReservesError,
    state.chains.optimism.balance, state.chains.optimism.price, state.chains.optimism.tvl, 
    state.chains.optimism.loading, state.chains.optimism.error
  ]);

  // Update global loading state
  useEffect(() => {
    const isLoading = ethPriceLoading || 
                     baseBalanceLoading || baseReservesLoading || 
                     ethereumBalanceLoading || ethereumReservesLoading || 
                     optimismBalanceLoading || optimismReservesLoading;
    
    if (isLoading !== state.loading) {
      dispatch({ type: 'SET_LOADING', payload: isLoading });
    }
    
    // Only update last updated timestamp when we finish loading
    if (!isLoading && state.loading) {
      dispatch({ type: 'SET_LAST_UPDATED', payload: new Date() });
    }
  }, [
    ethPriceLoading, 
    baseBalanceLoading, baseReservesLoading,
    ethereumBalanceLoading, ethereumReservesLoading,
    optimismBalanceLoading, optimismReservesLoading,
    state.loading
  ]);

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
    }
  }, [fetchEthPrice]);

  // Prepare the context value
  const contextValue: TokenDataContextType = {
    ...state,
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
