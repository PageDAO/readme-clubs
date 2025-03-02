// src/hooks/useMultichainToken.ts
import { useAccount, useChainId, useSwitchChain, useContractRead } from 'wagmi'
import { formatUnits } from 'viem'
import type { Address } from 'viem'
import { useState, useEffect, useCallback, useRef } from 'react'

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

// Fallback Osmosis data to use instead of API calls
const OSMOSIS_FALLBACK = {
  price: 0.060,
  tvl: 450000
};

// HOOK IMPLEMENTATION
export function useMultichainToken() {
  const chainId = useChainId()
  const { address } = useAccount()
  const { switchChain } = useSwitchChain()
  const [selectedChainId, setSelectedChainId] = useState<number | null>(chainId || 8453) // Default to Base if not connected
  const [selectedChainType, setSelectedChainType] = useState<'evm' | 'cosmos'>('evm')
  const [osmosisTokenData, setOsmosisTokenData] = useState<{ price: number, tvl?: number }>(OSMOSIS_FALLBACK)
  const [isLoadingOsmosisData, setIsLoadingOsmosisData] = useState<boolean>(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date())
  
  // Use a ref to track initialization and prevent multiple API calls
  const osmosisDataFetchedRef = useRef(false)
  
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

  // Function to fetch Osmosis token data (using fallback for now)
  const fetchOsmosisTokenData = useCallback(async (): Promise<{ price: number, tvl?: number }> => {
    console.log("Using fallback Osmosis data instead of making API call");
    return OSMOSIS_FALLBACK;
    
    /* Commented out to prevent excessive API calls with DNS errors
    try {
      const response = await fetch(COSMOS_PAGE_TOKEN.daodaoEndpoint || '');
      const data = await response.json();
      
      // Find the token in the response
      const tokenData = data.tokens?.find((token: any) => token.denom === OSMOSIS_PAGE_DENOM);
      
      if (tokenData) {
        return {
          price: tokenData.price || 0,
          tvl: tokenData.liquidity || undefined
        };
      }
      
      return OSMOSIS_FALLBACK;
    } catch (error) {
      console.error('Error fetching Osmosis token data:', error);
      return OSMOSIS_FALLBACK;
    }
    */
  }, []);

  // Function to refresh Osmosis token data
  const refreshOsmosisData = useCallback(async () => {
    // Skip if already loading to prevent duplicate requests
    if (isLoadingOsmosisData) {
      console.log("Already loading Osmosis data, skipping refresh");
      return;
    }
    
    console.log("Refreshing Osmosis data");
    setIsLoadingOsmosisData(true);
    
    try {
      const data = await fetchOsmosisTokenData();
      setOsmosisTokenData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing Osmosis data:', error);
      // Use fallback data on error
      setOsmosisTokenData(OSMOSIS_FALLBACK);
    } finally {
      setIsLoadingOsmosisData(false);
      osmosisDataFetchedRef.current = true;
    }
  }, [fetchOsmosisTokenData, isLoadingOsmosisData]);

  // Fetch Osmosis token data only once on initial load
  useEffect(() => {
    // Only fetch if we haven't already fetched and we're not currently loading
    if (!osmosisDataFetchedRef.current && !isLoadingOsmosisData) {
      console.log("Initial Osmosis data fetch");
      refreshOsmosisData();
    }
  }, [refreshOsmosisData, isLoadingOsmosisData]);

  // Switch to a different EVM chain
  const selectChain = (chainId: number) => {
    if (chainId === selectedChainId && selectedChainType === 'evm') return
    
    console.log(`Switching to chain ${chainId}`);
    if (switchChain) {
      switchChain({ chainId })
      setSelectedChainId(chainId)
      setSelectedChainType('evm')
    }
  }

  // Switch to Cosmos/Osmosis
  const selectCosmosChain = () => {
    console.log("Switching to Cosmos/Osmosis chain");
    setSelectedChainType('cosmos')
    setSelectedChainId(null)
    
    // Don't automatically refresh data on chain switch to avoid excessive calls
    // Only refresh if it hasn't been fetched yet
    if (!osmosisDataFetchedRef.current) {
      refreshOsmosisData();
    }
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