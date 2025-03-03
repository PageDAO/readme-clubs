import { useContractRead } from 'wagmi';
import { formatUnits } from 'viem';
import type { Address } from 'viem';
import { useState, useEffect } from 'react';

// Define ERC20 ABI
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

export function useTokenBalance(
  userAddress: Address | undefined,
  tokenConfig: any | undefined
) {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { data: tokenBalance, isLoading, isError } = useContractRead({
    address: tokenConfig?.address as Address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    chainId: tokenConfig?.chainId,
  });
  // Inside useTokenBalance hook
useEffect(() => {
  if (!isLoading) {
    // Log ALL possible states, not just success
    console.log(`Complete balance data for ${tokenConfig?.symbol} on chain ${tokenConfig?.chainId}:`, {
      isLoading,
      isError,
      tokenBalance,
      tokenBalanceType: tokenBalance ? typeof tokenBalance : 'undefined',
      tokenBalanceValue: tokenBalance ? tokenBalance.toString() : 'null'
    });

    if (isError) {
      console.error(`Error fetching balance for ${tokenConfig?.symbol} on chain ${tokenConfig?.chainId}`);
      setError('Failed to fetch token balance');
    } else if (tokenBalance && tokenConfig) {
      try {
        console.log(`Raw ${tokenConfig.symbol} balance on chain ${tokenConfig.chainId}:`, tokenBalance.toString());
        const formattedBalance = Number(formatUnits(tokenBalance as bigint, tokenConfig.decimals));
        console.log(`Formatted ${tokenConfig.symbol} balance on chain ${tokenConfig.chainId}:`, formattedBalance);
        setBalance(formattedBalance);
        setError(null);
      } catch (err) {
        console.error(`Error formatting ${tokenConfig.symbol} balance:`, err);
        setError('Error formatting token balance');
      }
    } else {
      // IMPORTANT: Always log when we reach this case
      console.log(`No balance data for ${tokenConfig?.symbol} on chain ${tokenConfig?.chainId}. Setting to zero.`);
      setBalance(0);
    }
    
    setLoading(false);
  }
}, [tokenBalance, isLoading, isError, tokenConfig]);


 

  return { balance, loading, error };
}
