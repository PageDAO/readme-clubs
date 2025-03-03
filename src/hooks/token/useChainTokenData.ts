import { useState, useEffect } from 'react';
import { useTokenBalance } from './useTokenBalance';
import { useTokenReserves } from './useTokenReserves';
import type { Address } from 'viem';

export interface ChainData {
  price: number | null;
  tvl: number | null;
  balance: number;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useChainTokenData(
  chain: 'base' | 'ethereum' | 'optimism',
  userAddress: Address | undefined,
  tokenConfig: any | undefined,
  ethPrice: number | null
): ChainData {
  const { balance, loading: balanceLoading, error: balanceError } = useTokenBalance(
    userAddress, 
    tokenConfig
  );
  
  const { 
    tokenPriceUsd, 
    tvl, 
    loading: reservesLoading, 
    error: reservesError 
  } = useTokenReserves(
    tokenConfig, 
    ethPrice
  );

  const [chainData, setChainData] = useState<ChainData>({
    price: null,
    tvl: null,
    balance: 0,
    loading: true,
    error: null,
    lastUpdated: null
  });

  useEffect(() => {
    const isLoading = balanceLoading || reservesLoading || !ethPrice;
    const error = balanceError || reservesError;
    
    setChainData({
      price: tokenPriceUsd,
      tvl,
      balance,
      loading: isLoading,
      error: error,
      lastUpdated: isLoading ? null : new Date()
    });
    
    if (!isLoading && (tokenPriceUsd || tvl || balance)) {
      console.log(`${chain} chain data updated:`, {
        price: tokenPriceUsd,
        tvl,
        balance,
        ethPrice
      });
    }
  }, [
    chain, balance, tokenPriceUsd, tvl, 
    balanceLoading, reservesLoading, 
    balanceError, reservesError, ethPrice
  ]);

  return chainData;
}
