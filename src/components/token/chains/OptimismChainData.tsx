// src/components/token/chains/OptimismChainData.tsx
import { useState, useEffect, useCallback } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { formatUnits } from 'viem';
import type { Address } from 'viem';

// Contract addresses for Optimism blockchain
const PAGE_TOKEN_ADDRESS = '0xe67E77c47a37795c0ea40A038F7ab3d76492e803' as const;
// Placeholder - To be replaced with actual LP contract address once available
const LP_CONTRACT_ADDRESS = '0x5421DA31D54640b58355d8D16D78af84D34D2405' as const;

// ABIs
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

// Return types
export interface OptimismChainData {
  price: number | null;
  tvl: number | null;
  balance: number;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  ethUsdPrice: number | null;
}

type GetReservesResult = [bigint, bigint, number];

// For initial testing, use static fallback values
// This allows development to proceed even without actual contract interaction
const FALLBACK_VALUES = {
  price: 0.059,
  tvl: 550000,
  ethPrice: 1800
};

export function useOptimismChainData(): OptimismChainData {
  const { address, isConnected } = useAccount();
  const [ethUsdPrice, setEthUsdPrice] = useState<number | null>(null);
  const [pagePrice, setPagePrice] = useState<number | null>(null);
  const [tvl, setTvl] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Get user balance of PAGE token on Optimism
  const { data: pageBalanceData } = useContractRead({
    address: PAGE_TOKEN_ADDRESS as Address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: 10, // Optimism chain ID
  }) as { data: bigint | undefined };

  // Get PAGE token decimals
  const { data: pageDecimals } = useContractRead({
    address: PAGE_TOKEN_ADDRESS as Address,
    abi: ERC20_ABI,
    functionName: 'decimals',
    chainId: 10,
  }) as { data: number | undefined };

  // Get LP reserves to calculate price and TVL
  // Note: Disabled until we have the actual LP address
  const { data: lpReserves } = useContractRead({
    address: LP_CONTRACT_ADDRESS as Address,
    abi: UNISWAP_V2_PAIR_ABI,
    functionName: 'getReserves',
    chainId: 10,
    query: {
      enabled: false // Disabled until we have the actual LP address
    }
  }) as { data: GetReservesResult | undefined };

  // Determine which token in the pair is PAGE
  const { data: token0 } = useContractRead({
    address: LP_CONTRACT_ADDRESS as Address,
    abi: UNISWAP_V2_PAIR_ABI,
    functionName: 'token0',
    chainId: 10,
    query: {
      enabled: false // Disabled until we have the actual LP address
    }
  }) as { data: Address | undefined };

  const { data: token1 } = useContractRead({
    address: LP_CONTRACT_ADDRESS as Address,
    abi: UNISWAP_V2_PAIR_ABI,
    functionName: 'token1',
    chainId: 10,
    query: {
      enabled: false // Disabled until we have the actual LP address
    }
  }) as { data: Address | undefined };

  // Format user's PAGE balance
  const balance = pageBalanceData && pageDecimals
    ? Number(formatUnits(pageBalanceData, pageDecimals))
    : 0;

  // Fetch ETH USD price
  const fetchEthUsdPrice = useCallback(async () => {
    try {
      // Use a CORS proxy to avoid issues
      const response = await fetch(
        `https://api.allorigins.win/get?url=${encodeURIComponent('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')}`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      const ethPrice = data.ethereum.usd;
      setEthUsdPrice(ethPrice);
      return ethPrice;
    } catch (error) {
      console.error('Failed to fetch ETH/USD price:', error);
      setError('Failed to fetch ETH price data');
      // Use fallback price to allow calculations to continue
      return FALLBACK_VALUES.ethPrice;
    }
  }, []);

  // Calculate token price and TVL from LP reserves
  const calculatePriceAndTVL = useCallback((ethPrice: number) => {
    // For initial development, we'll use fallback values 
    // until the actual LP contract is available
    if (!lpReserves || !token0 || !token1 || !pageDecimals) {
      // Use fallback values with slight random variation to simulate real data
      const variation = (Math.random() * 0.01) - 0.005; // -0.5% to +0.5%
      setPagePrice(FALLBACK_VALUES.price * (1 + variation));
      setTvl(FALLBACK_VALUES.tvl * (1 + variation));
      return;
    }

    try {
      const isPageToken0 = token0.toLowerCase() === PAGE_TOKEN_ADDRESS.toLowerCase();
      
      const [reserve0, reserve1] = lpReserves;
      
      const ethReserve = isPageToken0
        ? Number(formatUnits(reserve1, 18))
        : Number(formatUnits(reserve0, 18));
      
      const pageReserve = isPageToken0
        ? Number(formatUnits(reserve0, pageDecimals))
        : Number(formatUnits(reserve1, pageDecimals));

      const pagePriceInUsd = (ethPrice * ethReserve) / pageReserve;
      setPagePrice(pagePriceInUsd);

      const ethSideUsd = ethReserve * ethPrice;
      const pageSideUsd = pageReserve * pagePriceInUsd;
      const totalTvlUsd = ethSideUsd + pageSideUsd;
      setTvl(totalTvlUsd);

      console.log('Optimism chain data calculated:', {
        isPageToken0,
        ethReserve,
        pageReserve,
        ethPrice,
        pagePriceInUsd,
        ethSideUsd,
        pageSideUsd,
        totalTvlUsd
      });
    } catch (error) {
      console.error('Error calculating price and TVL:', error);
      setError('Error calculating price data');
    }
  }, [lpReserves, token0, token1, pageDecimals]);

  // Refresh function - can be called externally
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const ethPrice = await fetchEthUsdPrice();
      calculatePriceAndTVL(ethPrice);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing Optimism chain data:', error);
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  }, [fetchEthUsdPrice, calculatePriceAndTVL]);

  // Initial load
  useEffect(() => {
    // Since we're using fallbacks for now, we can call refresh directly
    refresh();
  }, [refresh]);

  // Return the current state and refresh function
  return {
    price: pagePrice,
    tvl,
    balance,
    loading,
    error,
    lastUpdated,
    refresh,
    ethUsdPrice
  };
}

export default useOptimismChainData;