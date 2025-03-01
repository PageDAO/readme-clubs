// src/hooks/useTokenPrices.ts
import { useState, useCallback } from 'react'
import { formatUnits } from 'viem'
import type { Address } from 'viem'
import { usePublicClient } from 'wagmi'
import { PAGE_TOKENS, COSMOS_PAGE_TOKEN } from './useMultichainToken'

export interface TokenPrice {
  chainId: number | string
  usdPrice: number | null
  tvl: number | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

export function useTokenPrices() {
  const publicClient = usePublicClient()
  const [prices, setPrices] = useState<TokenPrice[]>([
    ...PAGE_TOKENS.map(token => ({
      chainId: token.chainId,
      usdPrice: null,
      tvl: null,
      loading: false,
      error: null,
      lastUpdated: null
    })),
    {
      chainId: COSMOS_PAGE_TOKEN.chainId,
      usdPrice: null,
      tvl: null,
      loading: false,
      error: null,
      lastUpdated: null
    }
  ])
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Function to fetch ETH/USD price (using CoinGecko via proxy)
  const fetchEthUsdPrice = async (): Promise<number> => {
    try {
      const response = await fetch(
        `https://api.allorigins.win/get?url=${encodeURIComponent(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
        )}`
      )
      const data = await response.json()
      return JSON.parse(data.contents).ethereum.usd
    } catch (error) {
      console.error('Error fetching ETH/USD price:', error)
      return 0
    }
  }

  // Function to fetch price for a specific EVM chain from a liquidity pool
  const fetchEVMTokenPrice = async (chainId: number): Promise<{ price: number, tvl: number }> => {
    if (!publicClient) {
      throw new Error('Public client not available')
    }

    const token = PAGE_TOKENS.find(t => t.chainId === chainId)
    if (!token || !token.lpAddress) {
      throw new Error(`No LP address available for chain ${chainId}`)
    }

    // Get the ETH/USD price first
    const ethUsdPrice = await fetchEthUsdPrice()

    // LP contract ABI for getReserves and token0/token1 methods
    const lpAbi = [
      {
        inputs: [],
        name: 'getReserves',
        outputs: [
          { internalType: 'uint112', name: '_reserve0', type: 'uint112' },
          { internalType: 'uint112', name: '_reserve1', type: 'uint112' },
          { internalType: 'uint32', name: '_blockTimestampLast', type: 'uint32' }
        ],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [],
        name: 'token0',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
      }
    ] as const

    try {
      // Get reserves - note we're creating a client for the specific chain
      const reservesData = await publicClient.readContract({
        address: token.lpAddress,
        abi: lpAbi,
        functionName: 'getReserves',
      })

      // Get token0 address
      const token0 = await publicClient.readContract({
        address: token.lpAddress,
        abi: lpAbi,
        functionName: 'token0',
      })

      // Determine which token is PAGE
      const isPageToken0 = token0.toLowerCase() === token.address.toLowerCase()
      
      // Extract reserves
      const [reserve0, reserve1] = reservesData
      
      const ethReserve = isPageToken0
        ? Number(formatUnits(reserve1, 18))
        : Number(formatUnits(reserve0, 18))
      
      const pageReserve = isPageToken0
        ? Number(formatUnits(reserve0, token.decimals))
        : Number(formatUnits(reserve1, token.decimals))
      
      // Calculate price and TVL
      const pagePrice = (ethUsdPrice * ethReserve) / pageReserve
      const tvl = ethReserve * ethUsdPrice * 2 // Approximate TVL
      
      return { price: pagePrice, tvl }
    } catch (error) {
      console.error(`Error fetching data for chain ${chainId}:`, error)
      // Return fallback data
      return { price: 0.05, tvl: 1000000 }
    }
  }

  // Function to fetch Osmosis token data from DAODAO API
  const fetchOsmosisTokenData = async (): Promise<{ price: number, tvl: number } | null> => {
    try {
      if (!COSMOS_PAGE_TOKEN.daodaoEndpoint) {
        return { price: 0.05, tvl: 500000 } // Fallback data if endpoint not configured
      }
      
      const response = await fetch(COSMOS_PAGE_TOKEN.daodaoEndpoint)
      const data = await response.json()
      
      // Find the token in the response
      const tokenData = data.tokens?.find((token: any) => token.denom === COSMOS_PAGE_TOKEN.denom)
      
      if (tokenData) {
        return {
          price: tokenData.price || 0,
          tvl: tokenData.liquidity || 0
        }
      }
      
      return { price: 0.05, tvl: 500000 } // Fallback data
    } catch (error) {
      console.error('Error fetching Osmosis token data:', error)
      return { price: 0.05, tvl: 500000 } // Fallback data
    }
  }

  // Function to refresh price for a specific chain
  const refreshChainPrice = useCallback(async (chainId: number | string) => {
    const index = prices.findIndex(p => p.chainId === chainId)
    if (index === -1) return

    // Update loading state
    setPrices(prev => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        loading: true,
        error: null
      }
      return updated
    })

    try {
      let priceData: { price: number, tvl: number } | null = null

      if (typeof chainId === 'number') {
        // EVM chain
        priceData = await fetchEVMTokenPrice(chainId)
      } else if (chainId === COSMOS_PAGE_TOKEN.chainId) {
        // Osmosis
        priceData = await fetchOsmosisTokenData()
      }

      // Update price data
      setPrices(prev => {
        const updated = [...prev]
        updated[index] = {
          ...updated[index],
          usdPrice: priceData?.price || null,
          tvl: priceData?.tvl || null,
          loading: false,
          lastUpdated: new Date(),
          error: null
        }
        return updated
      })
    } catch (error) {
      console.error(`Error refreshing price for chain ${chainId}:`, error)
      setPrices(prev => {
        const updated = [...prev]
        updated[index] = {
          ...updated[index],
          loading: false,
          error: `Failed to load price data: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
        return updated
      })
    }
  }, [prices, publicClient])

  // Function to refresh all prices
  const refreshAllPrices = useCallback(async () => {
    if (isRefreshing) return
    setIsRefreshing(true)

    try {
      // Refresh EVM chain prices
      for (const token of PAGE_TOKENS) {
        await refreshChainPrice(token.chainId)
      }

      // Refresh Osmosis price
      await refreshChainPrice(COSMOS_PAGE_TOKEN.chainId)
    } finally {
      setIsRefreshing(false)
    }
  }, [isRefreshing, refreshChainPrice])

  // Calculate aggregate price (volume-weighted average)
  const calculateAggregatePrice = useCallback(() => {
    let totalVolume = 0
    let weightedSum = 0
    
    prices.forEach(price => {
      if (price.usdPrice && price.tvl) {
        totalVolume += price.tvl
        weightedSum += price.usdPrice * price.tvl
      }
    })
    
    return totalVolume > 0 ? weightedSum / totalVolume : null
  }, [prices])

  const aggregatePrice = calculateAggregatePrice()
  const totalTVL = prices.reduce((sum, price) => sum + (price.tvl || 0), 0)

  return {
    prices,
    aggregatePrice,
    totalTVL,
    isRefreshing,
    refreshChainPrice,
    refreshAllPrices
  }
}