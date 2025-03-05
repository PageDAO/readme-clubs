// src/hooks/token/useIBCPage.ts
import { useIBCToken } from '../../providers/IBCTokenProvider';
import { useMemo } from 'react';

// Define types for Osmosis data
interface OsmosisPool {
  id: string;
  name: string;
  apr: number;
  tvl: number;
}

interface OsmosisTokenInfo {
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
}

interface UserLPPosition {
  poolId: string;
  shares: number;
  valueUsd: number;
}

interface UserPositions {
  osmosis: {
    lpPositions: UserLPPosition[];
  };
  governance: {
    votingPower: number;
    votingPowerPercentage: number;
    proposals: {
      created: number;
      voted: number;
    };
  };
}

interface DAOInfo {
  tokenHolders: number;
  proposalCount: number;
}

// Define the hook's return type
export interface IBCPageData {
  osmosis: {
    pools: OsmosisPool[];
    tokenInfo: OsmosisTokenInfo;
  };
  userPositions: UserPositions | null;
  dao: DAOInfo;
  loading: boolean;
  error: string | null;
}

export function useIBCPage(): IBCPageData {
  // Use the IBCToken context
  const ibcToken = useIBCToken();
  
  console.log("useIBCPage called, IBCToken state:", ibcToken);
  
  // Use useMemo to avoid recalculating on every render
  return useMemo(() => {
    // Return data based on the current state
    const hasError = !!ibcToken.chains['osmosis-1'].error;
    
    // Default values
    const defaultData: IBCPageData = {
      osmosis: {
        pools: [
          {
            id: '1344',
            name: 'PAGE/OSMO',
            apr: 12.5,
            tvl: 850000
          }
        ],
        tokenInfo: {
          price: ibcToken.chains['osmosis-1']?.price || 0,
          priceChange24h: 0,
          marketCap: 0,
          volume24h: 0
        }
      },
      userPositions: ibcToken.isKeplrConnected ? {
        osmosis: {
          lpPositions: [
            {
              poolId: '1344',
              shares: 0,
              valueUsd: 0
            }
          ]
        },
        governance: {
          votingPower: 0,
          votingPowerPercentage: 0,
          proposals: {
            created: 0,
            voted: 0
          }
        }
      } : null,
      dao: {
        tokenHolders: 0,
        proposalCount: 0
      },
      loading: ibcToken.chains['osmosis-1']?.loading || false,
      error: ibcToken.chains['osmosis-1']?.error || null
    };
    
    // If there's an error, return default values with the error
    if (hasError) {
      return {
        ...defaultData,
        error: ibcToken.chains['osmosis-1'].error
      };
    }
    
    // Otherwise return mock data (in a real app, this would be actual data)
    return {
      osmosis: {
        pools: [
          {
            id: '1344',
            name: 'PAGE/OSMO',
            apr: 12.5,
            tvl: ibcToken.chains['osmosis-1'].tvl || 850000
          }
        ],
        tokenInfo: {
          price: ibcToken.chains['osmosis-1'].price || 0.062,
          priceChange24h: 2.8,
          marketCap: ibcToken.chains['osmosis-1'].marketCap || 6200000,
          volume24h: ibcToken.chains['osmosis-1'].volume24h || 120000
        }
      },
      userPositions: ibcToken.isKeplrConnected ? {
        osmosis: {
          lpPositions: [
            {
              poolId: '1344',
              shares: 0.05,
              valueUsd: 750
            }
          ]
        },
        governance: {
          votingPower: 125,
          votingPowerPercentage: 0.08,
          proposals: {
            created: 0,
            voted: 3
          }
        }
      } : null,
      dao: {
        tokenHolders: 2850,
        proposalCount: 18
      },
      loading: ibcToken.chains['osmosis-1']?.loading || false,
      error: null
    };
  }, [
    ibcToken.chains['osmosis-1'].error,
    ibcToken.chains['osmosis-1'].loading,
    ibcToken.chains['osmosis-1'].price,
    ibcToken.chains['osmosis-1'].tvl,
    ibcToken.chains['osmosis-1'].marketCap,
    ibcToken.chains['osmosis-1'].volume24h,
    ibcToken.isKeplrConnected
  ]);
}