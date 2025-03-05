/**
 * Constants for IBC token functionality
 * Centralizes all hardcoded values previously scattered across multiple files
 */

// Chain identifiers
export const OSMOSIS_CHAIN_ID = 'osmosis-1';

// Token denominations
export const OSMOSIS_PAGE_DENOM = "ibc/23A62409E4AD8133116C249B1FA38EED30E500A115D7B153109462CD82C1CD99";

// Pool configurations
export const POOL_ID = "1344"; // The pool ID for PAGE/OSMO

// API endpoints
export const OSMOSIS_LCD = "https://lcd.osmosis.zone";
export const DAODAO_API = "https://daodao-api.junonetwork.io/osmosis/tokens";

// Token configuration
export const OSMOSIS_PAGE_CONFIG = {
  chainType: 'cosmos' as const,
  chainId: OSMOSIS_CHAIN_ID,
  denom: OSMOSIS_PAGE_DENOM,
  decimals: 8,
  symbol: 'PAGE',
  name: 'Page',
  dexUrl: 'https://app.osmosis.zone/assets',
  explorerUrl: 'https://www.mintscan.io/osmosis/assets',
};

// Decimal adjustments for various tokens
export const TOKEN_DECIMALS = {
  PAGE: 8,
  OSMO: 6,
};

// Timeouts
export const REFRESH_INTERVAL_MS = 60000; // 1 minute
export const KEPLR_CONNECTION_TIMEOUT_MS = 1000;

export const DEFAULT_APR = null;
export const DEFAULT_CIRCULATING_SUPPLY = 42500000;
export const TOTAL_SUPPLY = 100000000;

// Error messages
export const ERROR_MESSAGES = {
  KEPLR_NOT_AVAILABLE: 'Keplr wallet is not available in this browser',
  KEPLR_CONNECTION_FAILED: 'Failed to connect to Keplr wallet',
  POOL_DATA_FETCH_FAILED: 'Failed to fetch pool data',
  BALANCE_FETCH_FAILED: 'Failed to fetch token balance',
  INVALID_POOL_DATA: 'Invalid pool data structure',
};
