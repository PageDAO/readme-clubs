// src/config/tokenConfig.ts
import { mainnet, optimism, polygon, base } from 'wagmi/chains'

export interface TokenConfig {
  chainId: number
  address: `0x${string}`
  decimals: number
  symbol: string
  name: string
  logoURI: string
  lpAddress?: `0x${string}` // LP token address if applicable
  dexUrl?: string // URL for trading
}

export interface CosmosTokenConfig {
  chainId: string
  denom: string
  decimals: number
  symbol: string
  name: string
  logoURI: string
  osmosisPoolId?: string
}

export const PAGE_TOKENS: TokenConfig[] = [
  {
    chainId: mainnet.id,
    address: '0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e',
    decimals: 8,
    symbol: 'PAGE',
    name: 'Page',
    logoURI: '/images/page-token-logo.png',
    dexUrl: 'https://app.uniswap.org/#/swap?outputCurrency=0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e'
  },
  {
    chainId: optimism.id,
    address: '0xe67E77c47a37795c0ea40A038F7ab3d76492e803',
    decimals: 8,
    symbol: 'PAGE',
    name: 'Page',
    logoURI: '/images/page-token-logo.png',
    dexUrl: 'https://app.uniswap.org/#/swap?outputCurrency=0xe67E77c47a37795c0ea40A038F7ab3d76492e803&chain=optimism'
  },
  {
    chainId: polygon.id,
    address: '0x9ceE70895726B0ea14E6019C961dAf32222a7C2f',
    decimals: 8,
    symbol: 'PAGE',
    name: 'Page',
    logoURI: '/images/page-token-logo.png',
    dexUrl: 'https://quickswap.exchange/#/swap?outputCurrency=0x9ceE70895726B0ea14E6019C961dAf32222a7C2f'
  },
  {
    chainId: base.id,
    address: '0xc4730f86d1F86cE0712a7b17EE919Db7dEFad7FE',
    decimals: 8,
    symbol: 'PAGE',
    name: 'Page',
    logoURI: '/images/page-token-logo.png',
    lpAddress: '0x7989DD74dF816A32EE0DaC0f3f8e24d740fc5cB2',
    dexUrl: 'https://app.uniswap.org/#/swap?outputCurrency=0xc4730f86d1F86cE0712a7b17EE919Db7dEFad7FE&chain=base'
  }
]

export const COSMOS_PAGE_TOKEN: CosmosTokenConfig = {
  chainId: 'osmosis-1',
  denom: 'ibc/23A62409E4AD8133116C249B1FA38EED30E500A115D7B153109462CD82C1CD99',
  decimals: 8,
  symbol: 'PAGE',
  name: 'Page',
  logoURI: '/images/page-token-logo.png',
  osmosisPoolId: '1344' 
}