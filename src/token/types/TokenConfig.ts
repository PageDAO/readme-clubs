export interface TokenContractConfig {
  address: string; 
  decimals: number;
  symbol: string;
  poolAddress?: string;
  poolFee?: number;
}

export interface EVMTokenConfig {
  [chainId: number]: TokenContractConfig;
}

export interface CosmosTokenConfig {
  denom: string;
  ibcDenom: string;
  decimals: number;
  symbol: string;
  poolId: string;
}

export interface TokenConfig {
  name: string;
  symbol: string;
  totalSupply: number;
  circulatingSupply: number;
  evm: EVMTokenConfig;
  cosmos: {
    [chainId: string]: CosmosTokenConfig;
  };
}
