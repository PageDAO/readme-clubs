// Chain metadata for configuration
export interface ChainMetadata {
  id: string | number;
  name: string;
  type: 'evm' | 'cosmos';
  nativeToken: string;
  rpcUrl?: string;
  explorerUrl?: string;
  iconUrl?: string;
}
// EVM specific token config
export interface EVMTokenConfig {
  address: string;
  decimals: number;
  symbol: string;
  poolAddress: string;
}

// Cosmos specific token config
export interface CosmosTokenConfig {
  denom: string;
  ibcDenom: string;
  decimals: number;
  symbol: string;
  poolId: string;
}

// Main token configuration
export interface TokenConfig {
  name: string;
  symbol: string;
  totalSupply: number;
  circulatingSupply: number;
  evm: {
    [chainId: string | number]: EVMTokenConfig;
  };
  cosmos: {
    [chainId: string]: CosmosTokenConfig;
  };
}

// Data structures for pool information
export interface PoolData {
  poolId: string;
  tokenAAmount: number;
  tokenBAmount: number;
  tokenASymbol: string;
  tokenBSymbol: string;
}

// Data structures for price information
export interface PriceData {
  price: number | null;
  timestamp: number | null;
  error: string | null;
}

// Data structures for balance information
export interface BalanceData {
  balance: number;
  balanceUSD: number | null;
  timestamp: number;
  error: string | null;
  address?: string;
}

// Data structures for TVL information
export interface TVLData {
  tvl: number | null;
  timestamp: number;
  error: string | null;
}

// Chain data for UI representation
export interface ChainData {
  chainId: string | number;
  type: 'evm' | 'cosmos';
  name: string;
  price: number | null;
  priceData: PriceData;
  balance: number;
  balanceData: BalanceData;
  tvl: number | null;
  tvlData: TVLData;
  marketCap: number | null;
  volume24h: number | null;
  poolData?: PoolData;
  lastUpdated: Date | null;
  isLoading: boolean;
  error: string | null;
  refresh?: () => Promise<void>;
}

// Map of chain data by chain ID
export interface ChainDataMap {
  [chainId: string]: ChainData;
}
