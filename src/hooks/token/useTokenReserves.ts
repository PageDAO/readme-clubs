import { useContractRead } from 'wagmi';
import { formatUnits } from 'viem';
import type { Address } from 'viem';
import { useState, useEffect } from 'react';

// Define Uniswap V2 Pair ABI
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

export function useTokenReserves(
  tokenConfig: any | undefined,
  ethPrice: number | null
) {
  const [tokenPriceUsd, setTokenPriceUsd] = useState<number | null>(null);
  const [tvl, setTvl] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get LP reserves
  const { data: reserves, isLoading, isError } = useContractRead({
    address: tokenConfig?.lpAddress as Address,
    abi: UNISWAP_V2_PAIR_ABI,
    functionName: 'getReserves',
    chainId: tokenConfig?.chainId,
  });

  useEffect(() => {
    if (isLoading || !ethPrice) {
      setLoading(true);
      return;
    }

    if (isError) {
      console.error(`Error fetching reserves for ${tokenConfig?.symbol}`);
      setError(`Failed to fetch reserves for ${tokenConfig?.symbol}`);
      setLoading(false);
      return;
    }

    if (reserves && tokenConfig) {
      try {
        console.log("Calculating PAGE price with:", {
          reserves,
          ethPrice,
          tokenConfig
        });

        // Check if reserves is an array with at least 2 elements
        if (!Array.isArray(reserves) || reserves.length < 2) {
          throw new Error('Invalid reserves data format');
        }

        const [reserve0, reserve1] = reserves as [bigint, bigint, number];
        
        // Handle token order in the LP pair
        let ethReserve: number;
        let tokenReserve: number;

        if (tokenConfig.tokenIsToken0) {
          // Token is token0, ETH is token1
          tokenReserve = Number(formatUnits(reserve0, tokenConfig.decimals));
          ethReserve = Number(formatUnits(reserve1, 18)); // ETH has 18 decimals
        } else {
          // ETH is token0, token is token1
          ethReserve = Number(formatUnits(reserve0, 18));
          tokenReserve = Number(formatUnits(reserve1, tokenConfig.decimals));
        }
        
        console.log(`${tokenConfig.symbol} reserves calculation:`, {
          ethReserve,
          tokenReserve,
          chainId: tokenConfig.chainId
        });

        // Calculate token price in USD and TVL
        const calcTokenPriceUsd = (ethPrice * ethReserve) / tokenReserve;
        const calcTvl = (ethReserve * ethPrice) * 2; // Simplified TVL calculation
        
        console.log(`${tokenConfig.symbol} price and TVL:`, {
          price: calcTokenPriceUsd,
          tvl: calcTvl
        });
        
        setTokenPriceUsd(calcTokenPriceUsd);
        setTvl(calcTvl);
        setError(null);
      } catch (err) {
        console.error(`Error calculating ${tokenConfig?.symbol} price:`, err);
        setError(`Error calculating ${tokenConfig?.symbol} price`);
        setTokenPriceUsd(null);
        setTvl(null);
      }
    }

    setLoading(false);
  }, [reserves, ethPrice, isLoading, isError, tokenConfig]);

  return { tokenPriceUsd, tvl, loading, error };
}
