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

  // Log chain configurations for debugging
  useEffect(() => {
    console.log('Chain configurations:', {
      base: baseConfig ? { 
        address: baseConfig.address, 
        lpAddress: baseConfig.lpAddress,
        decimals: baseConfig.decimals
      } : 'Not found',
      ethereum: ethereumConfig ? { 
        address: ethereumConfig.address, 
        lpAddress: ethereumConfig.lpAddress,
        decimals: ethereumConfig.decimals
      } : 'Not found',
      optimism: optimismConfig ? { 
        address: optimismConfig.address, 
        lpAddress: optimismConfig.lpAddress,
        decimals: optimismConfig.decimals
      } : 'Not found',
    });
  }, [baseConfig, ethereumConfig, optimismConfig]);

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

  // ----- CHAIN-SPECIFIC DATA FETCHING -----
  
  // Base Chain Data Fetching
  const fetchBaseChainData = useCallback(async () => {
    console.log('Fetching Base chain data...');

    // Check if we have required configuration
    console.log('Base chain fetch prerequisites:', { 
      baseConfig: !!baseConfig,
      tokenAddress: baseConfig?.address,
      lpAddress: baseConfig?.lpAddress,
      decimals: baseConfig?.decimals,
      ethPrice: state.ethPrice,
      walletAddress: address
    });

    if (!baseConfig || !state.ethPrice) {
      console.warn('Skipping Base chain fetch: Missing config or ETH price');
      return;
    }
    
    dispatch({ 
      type: 'UPDATE_CHAIN_DATA', 
      chain: 'base', 
      payload: { loading: true, error: null } 
    });
    
    try {
      // Get user balance
      console.log('Fetching Base PAGE balance for address:', address);
      const pageBalance = address ? await fetchTokenBalance(
        baseConfig.address,
        address as Address,
        baseConfig.decimals,
        8453
      ) : 0;
      console.log('Base PAGE balance result:', pageBalance);
      
      // Get price and TVL
      console.log('Calculating Base price and TVL with ETH price:', state.ethPrice);
      if (!baseConfig.lpAddress) {
        console.warn('Base chain missing LP address, cannot calculate price/TVL accurately');
      }
      
      const { price, tvl } = await calculatePriceAndTVL(
        baseConfig.address,
        baseConfig.lpAddress as `0x${string}`,
        baseConfig.decimals,
        state.ethPrice,
        8453
      );
      console.log('Base price and TVL calculation result:', { price, tvl });
      
      // Update state with fresh data
      console.log('Updating Base chain data in state');
      dispatch({
        type: 'UPDATE_CHAIN_DATA',
        chain: 'base',
        payload: {
          price,
          tvl,
          balance: pageBalance,
          loading: false,
          error: null,
          lastUpdated: new Date()
        }
      });
      console.log('Base chain data update complete');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching Base data';
      console.error('Error fetching Base chain data:', error);
      dispatch({
        type: 'UPDATE_CHAIN_DATA',
        chain: 'base',
        payload: { error: errorMessage, loading: false }
      });
    }
  }, [baseConfig, state.ethPrice, address]);

  // Ethereum Chain Data Fetching
  const fetchEthereumChainData = useCallback(async () => {
    console.log('Fetching Ethereum chain data...');

    // Check if we have required configuration
    console.log('Ethereum chain fetch prerequisites:', { 
      ethereumConfig: !!ethereumConfig,
      tokenAddress: ethereumConfig?.address,
      lpAddress: ethereumConfig?.lpAddress,
      decimals: ethereumConfig?.decimals,
      ethPrice: state.ethPrice,
      walletAddress: address
    });

    if (!ethereumConfig || !state.ethPrice) {
      console.warn('Skipping Ethereum chain fetch: Missing config or ETH price');
      return;
    }
    
    dispatch({ 
      type: 'UPDATE_CHAIN_DATA', 
      chain: 'ethereum', 
      payload: { loading: true, error: null } 
    });
    
    try {
      // Get user balance
      console.log('Fetching Ethereum PAGE balance for address:', address);
      const pageBalance = address ? await fetchTokenBalance(
        ethereumConfig.address,
        address as Address,
        ethereumConfig.decimals,
        1
      ) : 0;
      console.log('Ethereum PAGE balance result:', pageBalance);
      
      // Get price and TVL
      console.log('Calculating Ethereum price and TVL with ETH price:', state.ethPrice);
      if (!ethereumConfig.lpAddress) {
        console.warn('Ethereum chain missing LP address, cannot calculate price/TVL accurately');
      }
      
      const { price, tvl } = await calculatePriceAndTVL(
        ethereumConfig.address,
        ethereumConfig.lpAddress as `0x${string}`,
        ethereumConfig.decimals,
        state.ethPrice,
        1
      );
      console.log('Ethereum price and TVL calculation result:', { price, tvl });
      
      // Update state with fresh data
      console.log('Updating Ethereum chain data in state');
      dispatch({
        type: 'UPDATE_CHAIN_DATA',
        chain: 'ethereum',
        payload: {
          price,
          tvl,
          balance: pageBalance,
          loading: false,
          error: null,
          lastUpdated: new Date()
        }
      });
      console.log('Ethereum chain data update complete');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching Ethereum data';
      console.error('Error fetching Ethereum chain data:', error);
      dispatch({
        type: 'UPDATE_CHAIN_DATA',
        chain: 'ethereum',
        payload: { error: errorMessage, loading: false }
      });
    }
  }, [ethereumConfig, state.ethPrice, address]);

  // Optimism Chain Data Fetching
  const fetchOptimismChainData = useCallback(async () => {
    console.log('Fetching Optimism chain data...');

    // Check if we have required configuration
    console.log('Optimism chain fetch prerequisites:', { 
      optimismConfig: !!optimismConfig,
      tokenAddress: optimismConfig?.address,
      lpAddress: optimismConfig?.lpAddress,
      decimals: optimismConfig?.decimals,
      ethPrice: state.ethPrice,
      walletAddress: address
    });

    if (!optimismConfig || !state.ethPrice) {
      console.warn('Skipping Optimism chain fetch: Missing config or ETH price');
      return;
    }
    
    dispatch({ 
      type: 'UPDATE_CHAIN_DATA', 
      chain: 'optimism', 
      payload: { loading: true, error: null } 
    });
    
    try {
      // Get user balance
      console.log('Fetching Optimism PAGE balance for address:', address);
      const pageBalance = address ? await fetchTokenBalance(
        optimismConfig.address,
        address as Address,
        optimismConfig.decimals,
        10
      ) : 0;
      console.log('Optimism PAGE balance result:', pageBalance);
      
      // Get price and TVL
      console.log('Calculating Optimism price and TVL with ETH price:', state.ethPrice);
      if (!optimismConfig.lpAddress) {
        console.warn('Optimism chain missing LP address, cannot calculate price/TVL accurately');
      }
      
      const { price, tvl } = await calculatePriceAndTVL(
        optimismConfig.address,
        optimismConfig.lpAddress as `0x${string}`,
        optimismConfig.decimals,
        state.ethPrice,
        10
      );
      console.log('Optimism price and TVL calculation result:', { price, tvl });
      
      // Update state with fresh data
      console.log('Updating Optimism chain data in state');
      dispatch({
        type: 'UPDATE_CHAIN_DATA',
        chain: 'optimism',
        payload: {
          price,
          tvl,
          balance: pageBalance,
          loading: false,
          error: null,
          lastUpdated: new Date()
        }
      });
      console.log('Optimism chain data update complete');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching Optimism data';
      console.error('Error fetching Optimism chain data:', error);
      dispatch({
        type: 'UPDATE_CHAIN_DATA',
        chain: 'optimism',
        payload: { error: errorMessage, loading: false }
      });
    }
  }, [optimismConfig, state.ethPrice, address]);

  // ------------------- UTILITY FUNCTIONS -------------------

  // Helper for fetching token balances
  async function fetchTokenBalance(
    tokenAddress: `0x${string}`, 
    walletAddress: Address, 
    decimals: number,
    chainId: number
  ): Promise<number> {
    try {
      console.log(`Fetching token balance for ${walletAddress} on chain ${chainId}`);
      
      // Use wagmi hooks for contract reads
      const { data: balanceData } = await useContractRead({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [walletAddress],
        chainId,
      }) as { data: bigint | undefined };
      
      if (!balanceData) {
        console.warn(`No balance data returned for ${walletAddress} on chain ${chainId}`);
        return 0;
      }
      
      const formattedBalance = Number(formatUnits(balanceData, decimals));
      console.log(`Token balance for ${walletAddress} on chain ${chainId}:`, formattedBalance);
      return formattedBalance;
    } catch (error) {
      console.error(`Error fetching token balance on chain ${chainId}:`, error);
      return 0;
    }
  }

  // Helper for calculating price and TVL from LP reserves
  async function calculatePriceAndTVL(
    tokenAddress: `0x${string}`,
    lpAddress: `0x${string}`,
    tokenDecimals: number,
    ethPriceUsd: number,
    chainId: number
  ): Promise<{ price: number | null; tvl: number | null }> {
    try {
      console.log(`Calculating price and TVL for token ${tokenAddress} on chain ${chainId}`);
      
      if (!lpAddress) {
        console.warn(`Missing LP address for chain ${chainId}`);
        return { price: null, tvl: null };
      }
      
      // Get LP reserves
      console.log(`Fetching LP reserves from ${lpAddress} on chain ${chainId}`);
      const { data: reserves } = await useContractRead({
        address: lpAddress,
        abi: UNISWAP_V2_PAIR_ABI,
        functionName: 'getReserves',
        chainId,
      }) as { data: [bigint, bigint, number] | undefined };
      
      if (!reserves) {
        console.warn(`No reserves data returned from LP ${lpAddress} on chain ${chainId}`);
        return { price: null, tvl: null };
      }
      
      // Determine which token in the pair is PAGE
      const { data: token0 } = await useContractRead({
        address: lpAddress,
        abi: UNISWAP_V2_PAIR_ABI,
        functionName: 'token0',
        chainId,
      }) as { data: `0x${string}` | undefined };
      
      if (!token0) {
        console.warn(`Could not determine token0 for LP ${lpAddress} on chain ${chainId}`);
        return { price: null, tvl: null };
      }
      
      // Format reserves based on token position
      const isPageToken0 = token0.toLowerCase() === tokenAddress.toLowerCase();
      console.log(`Token is ${isPageToken0 ? 'token0' : 'token1'} in the LP pair on chain ${chainId}`);
      
      const [reserve0, reserve1] = reserves;
      
      const ethReserve = isPageToken0
        ? Number(formatUnits(reserve1, 18))  // ETH has 18 decimals
        : Number(formatUnits(reserve0, 18));
      
      const pageReserve = isPageToken0
        ? Number(formatUnits(reserve0, tokenDecimals))
        : Number(formatUnits(reserve1, tokenDecimals));
      
      // Calculate price based on reserves
      const pagePriceInUsd = (ethPriceUsd * ethReserve) / pageReserve;
      
      // Calculate TVL (both sides of the LP)
      const ethSideUsd = ethReserve * ethPriceUsd;
      const pageSideUsd = pageReserve * pagePriceInUsd;
      const totalTvlUsd = ethSideUsd + pageSideUsd;
      
      console.log(`Price and TVL calculation for chain ${chainId}:`, {
        ethReserve,
        pageReserve,
        pagePriceInUsd,
        ethSideUsd,
        pageSideUsd,
        totalTvlUsd
      });
      
      return { price: pagePriceInUsd, tvl: totalTvlUsd };
    } catch (error) {
      console.error(`Error calculating price and TVL on chain ${chainId}:`, error);
      return { price: null, tvl: null };
    }
  }

  // Function to refresh all data
  const refreshAllData = useCallback(async () => {
    console.log('Refreshing all token data...');
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // First get ETH price
      const ethPrice = await fetchEthPrice();
      
      if (ethPrice) {
        // Then fetch chain data in parallel
        await Promise.all([
          fetchBaseChainData(),
          fetchEthereumChainData(),
          fetchOptimismChainData()
        ]);
      }
      
      dispatch({ type: 'SET_LAST_UPDATED', payload: new Date() });
    } catch (error) {
      console.error('Error refreshing all data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh all data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [fetchEthPrice, fetchBaseChainData, fetchEthereumChainData, fetchOptimismChainData]);

  // Initial data fetch on component mount
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Fetch chain data when ETH price changes
  useEffect(() => {
    if (state.ethPrice) {
      console.log('ETH price updated, fetching chain data...');
      fetchBaseChainData();
      fetchEthereumChainData();
      fetchOptimismChainData();
    }
  }, [state.ethPrice, fetchBaseChainData, fetchEthereumChainData, fetchOptimismChainData]);

  // Calculate global loading state
  const isLoading = Object.values(state.chains).some(chain => chain.loading);

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

// Hook for consuming the context
export function useTokenData() {
  const context = useContext(TokenDataContext);
  if (!context) {
    throw new Error('useTokenData must be used within a TokenDataProvider');
  }
  return context;
}
