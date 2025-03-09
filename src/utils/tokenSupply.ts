// Define estimated supply distribution across chains
// These should be updated with actual metrics as they change

export interface SupplyBreakdown {
  total: number;
  circulating: number;
  byChain: {
    ethereum: number;
    base: number;
    optimism: number;
    osmosis: number;
    other: number;
  };
}

export const getPageSupply = (): SupplyBreakdown => {
  return {
    total: 100000000, // 100M total
    circulating: 42500000, // Estimate of circulating supply
    byChain: {
      ethereum: 25000000, // Example distribution
      base: 8500000,
      optimism: 5000000,
      osmosis: 4000000,
      other: 0 // Reserve for future chains
    }
  };
};

// Calculate what percent of liquidity is on each chain
export const calculateSupplyWeights = (tvlByChain: Record<string, number | null>): Record<string, number> => {
  const totalTVL = Object.values(tvlByChain)
    .filter((val): val is number => val !== null)
    .reduce((sum, val) => sum + val, 0);
    
  if (totalTVL === 0) return {};
  
  const weights: Record<string, number> = {};
  Object.entries(tvlByChain).forEach(([chain, tvl]) => {
    if (tvl !== null) {
      weights[chain] = tvl / totalTVL;
    }
  });
  
  return weights;
};
