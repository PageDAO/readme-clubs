// src/hooks/useMultichainToken.ts
import { useAccount, useChainId, useSwitchChain, useContractRead } from 'wagmi'
import { formatUnits } from 'viem'
import type { Address } from 'viem'
import { useState, useEffect, useCallback } from 'react'

// TOKEN CONFIGURATION
// Define token addresses for each chain
const ETH_PAGE_ADDRESS = '0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e' as const
const OPTIMISM_PAGE_ADDRESS = '0xe67E77c47a37795c0ea40A038F7ab3d76492e803' as const
const POLYGON_PAGE_ADDRESS = '0x9ceE70895726B0ea14E6019C961dAf32222a7C2f' as const
const BASE_PAGE_ADDRESS = '0xc4730f86d1F86cE0712a7b17EE919Db7dEFad7FE' as const

// Osmosis IBC denom
const OSMOSIS_PAGE_DENOM = 'ibc/23A62409E4AD8133116C249B1FA38EED30E500A115D7B153109462CD82C1CD99'

// ERC20 ABI for balance checking
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
] as const

// Token configuration by chain
export interface TokenConfig {
  chainId: number
  address: Address
  decimals: number
  symbol: string
  name: string
  dexUrl: string
  lpAddress?: Address
  explorerUrl: string
}

export interface CosmosTokenConfig {
  chainType: 'cosmos'
  chainId: string
  denom: string
  decimals: number
  symbol: string
  name: string
  dexUrl: string
  explorerUrl: string
  daodaoEndpoint?: string
}

export type ChainConfig = TokenConfig | CosmosTokenConfig

export const PAGE_TOKENS: TokenConfig[] = [
  {
    chainId: 1, // mainnet
    address: ETH_PAGE_ADDRESS,
    decimals: 8,
    symbol: 'PAGE',
    name: 'Page',
    dexUrl: `https://app.uniswap.org/#/swap?outputCurrency=${ETH_PAGE_ADDRESS}`,
    explorerUrl: `https://etherscan.io/token/${ETH_PAGE_ADDRESS}`
  },
  {
    chainId: 10, // optimism
    address: OPTIMISM_PAGE_ADDRESS,
    decimals: 8,
    symbol: 'PAGE',
    name: 'Page',
    dexUrl: `https://app.uniswap.org/#/swap?outputCurrency=${OPTIMISM_PAGE_ADDRESS}&chain=optimism`,
    explorerUrl: `https://optimistic.etherscan.io/token/${OPTIMISM_PAGE_ADDRESS}`
  },
  {
    chainId: 137, // polygon
    address: POLYGON_PAGE_ADDRESS,
    decimals: 8,
    symbol: 'PAGE',
    name: 'Page',
    dexUrl: `https://quickswap.exchange/#/swap?outputCurrency=${POLYGON_PAGE_ADDRESS}`,
    explorerUrl: `https://polygonscan.com/token/${POLYGON_PAGE_ADDRESS}`
  },
  {
    chainId: 8453, // base
    address: BASE_PAGE_ADDRESS,
    decimals: 8,
    symbol: 'PAGE',
    name: 'Page',
    dexUrl: `https://app.uniswap.org/#/swap?outputCurrency=${BASE_PAGE_ADDRESS}&chain=base`,
    lpAddress: '0x7989DD74dF816A32EE0DaC0f3f8e24d740fc5cB2' as Address,
    explorerUrl: `https://basescan.org/token/${BASE_PAGE_ADDRESS}`
  }
]

export const COSMOS_PAGE_TOKEN: CosmosTokenConfig = {
  chainType: 'cosmos',
  chainId: 'osmosis-1',
  denom: OSMOSIS_PAGE_DENOM,
  decimals: 8,
  symbol: 'PAGE',
  name: 'Page',
  dexUrl: 'https://app.osmosis.zone/assets',
  explorerUrl: 'https://www.mintscan.io/osmosis/assets',
  daodaoEndpoint: 'https://daodao-api.junonetwork.io/osmosis/tokens' // Update this with the actual endpoint
}

// Combined array of all chains (for UI purposes)
export const ALL_CHAIN_CONFIGS = [...PAGE_TOKENS, COSMOS_PAGE_TOKEN]

// Function to fetch Osmosis token data from DAODAO API
const fetchOsmosisTokenData = async (denom: string): Promise<{ price: number, tvl?: number } | null> => {
  try {
    const response = await fetch(COSMOS_PAGE_TOKEN.daodaoEndpoint || '');
    const data = await response.json();
    
    // Find the token in the response
    const tokenData = data.tokens?.find((token: any) => token.denom === denom);
    
    if (tokenData) {
      return {
        price: tokenData.price || 0,
        tvl: tokenData.liquidity || undefined
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching Osmosis token data:', error);
    return null;
  }
};

// HOOK IMPLEMENTATION
export function useMultichainToken() {
  const chainId = useChainId()
  const { address } = useAccount()
  const { switchChain } = useSwitchChain()
  const [selectedChainId, setSelectedChainId] = useState<number | null>(chainId || 8453) // Default to Base if not connected
  const [selectedChainType, setSelectedChainType] = useState<'evm' | 'cosmos'>('evm')
  const [osmosisTokenData, setOsmosisTokenData] = useState<{ price: number, tvl?: number } | null>(null)
  const [isLoadingOsmosisData, setIsLoadingOsmosisData] = useState<boolean>(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
  // Get token config for current chain
  const currentToken = PAGE_TOKENS.find(token => token.chainId === selectedChainId) || PAGE_TOKENS[3] // Default to Base
  
  // Get balance on current chain (only works for EVM chains)
  const { data: pageBalanceData } = useContractRead({
    address: currentToken.address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: currentToken.chainId,
    query: {
      enabled: selectedChainType === 'evm' && !!address
    }
  }) as { data: bigint | undefined }

  // Format balance
  const balance = pageBalanceData && currentToken
    ? Number(formatUnits(pageBalanceData, currentToken.decimals))
    : 0

  // Function to manually refresh Osmosis token data
  const refreshOsmosisData = useCallback(async () => {
    setIsLoadingOsmosisData(true);
    try {
      const data = await fetchOsmosisTokenData(OSMOSIS_PAGE_DENOM);
      setOsmosisTokenData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing Osmosis data:', error);
    } finally {
      setIsLoadingOsmosisData(false);
    }
  }, []);

  // Fetch Osmosis token data initially
  useEffect(() => {
    // Only fetch if we don't have data yet
    if (!osmosisTokenData && !isLoadingOsmosisData) {
      refreshOsmosisData();
    }
  }, [osmosisTokenData, isLoadingOsmosisData, refreshOsmosisData]);

  // Switch to a different EVM chain
  const selectChain = (chainId: number) => {
    if (chainId === selectedChainId && selectedChainType === 'evm') return
    
    if (switchChain) {
      switchChain({ chainId })
      setSelectedChainId(chainId)
      setSelectedChainType('evm')
    }
  }

  // Switch to Cosmos/Osmosis
  const selectCosmosChain = () => {
    setSelectedChainType('cosmos')
    setSelectedChainId(null)
    
    // Refresh Osmosis data when switching to it
    refreshOsmosisData();
  }

  // Define available chains for the UI
  const availableChains = [
    ...PAGE_TOKENS.map(token => ({
      id: token.chainId,
      type: 'evm' as const,
      name: token.chainId === 1 ? 'Ethereum' : 
            token.chainId === 10 ? 'Optimism' :
            token.chainId === 137 ? 'Polygon' : 'Base'
    })),
    {
      id: 'osmosis-1',
      type: 'cosmos' as const,
      name: 'Osmosis'
    }
  ]

  // Check if user has PAGE tokens on any chain
  const [hasTokensOnAnyChain, setHasTokensOnAnyChain] = useState<boolean>(false)
  
  useEffect(() => {
    if (balance > 0) {
      setHasTokensOnAnyChain(true)
    }
  }, [balance])

  return {
    currentToken: selectedChainType === 'evm' ? currentToken : COSMOS_PAGE_TOKEN,
    chainType: selectedChainType,
    balance,
    hasTokensOnAnyChain,
    availableChains,
    selectedChainId,
    selectChain,
    selectCosmosChain,
    osmosisTokenData,
    refreshOsmosisData,
    isLoadingOsmosisData,
    lastUpdated
  }
}