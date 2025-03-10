export type ChainType = 'evm' | 'cosmos';

export interface PriceData {
  price: number | null;
  timestamp: number | null;
  error: string | null;
}

export interface BalanceData {
  balance: number;
  balanceUSD: number | null;
  timestamp: number | null;
  error: string | null;
}

export interface TVLData {
  tvl: number | null;
  timestamp: number | null;
  error: string | null;
}

export type LoadingStatus = 'idle' | 'loading' | 'success' | 'error';

export interface RefreshableData {
  lastUpdated: Date | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}
