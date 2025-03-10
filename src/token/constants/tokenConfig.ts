import { TokenConfig } from '../types';

export const PAGE_TOKEN: TokenConfig = {
  name: 'PAGE',
  symbol: 'PAGE',
  totalSupply: 100000000,
  circulatingSupply: 42500000,
  evm: {
    1: {
      address: '0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e',
      decimals: 8,
      symbol: 'PAGE',
      poolAddress: '0x1234567890abcdef1234567890abcdef12345678' // Replace with actual pool address
    },
    8453: {
      address: '0xc4730f86d1F86cE0712a7b17EE919Db7dEFad7FE',
      decimals: 8,
      symbol: 'PAGE',
      poolAddress: '0x1234567890abcdef1234567890abcdef12345678' // Replace with actual pool address
    },
    10: {
      address: '0xe67E77c47a37795c0ea40A038F7ab3d76492e803',
      decimals: 8, 
      symbol: 'PAGE',
      poolAddress: '0x1234567890abcdef1234567890abcdef12345678' // Replace with actual pool address
    }
  },
  cosmos: {
    'osmosis-1': {
      denom: 'PAGE',
      ibcDenom: 'ibc/23A62409E4AD8133116C249B1FA38EED30E500A115D7B153109462CD82C1CD99',
      decimals: 8,
      symbol: 'PAGE',
      poolId: '1344'
    }
  }
};

export const TOKEN_DECIMALS = {
  PAGE: 8,
  ETH: 18,
  OSMO: 6
};

export const REFRESH_INTERVALS = {
  PRICE_DATA: 60 * 1000, // 1 minute
  BALANCE_DATA: 60 * 1000, // 1 minute
  POOL_DATA: 5 * 60 * 1000 // 5 minutes
};