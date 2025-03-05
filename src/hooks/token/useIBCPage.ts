// src/hooks/token/useIBCPage.ts
import { useIBCToken } from '../../providers/IBCTokenProvider';

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
  
  // Return mock data for now
  // In a real implementation, we would derive this data from the IBCToken context
  return {
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
        price: ibcToken.chains['osmosis-1']?.price || 0.062,
        priceChange24h: 2.8,
        marketCap: 6200000,
        volume24h: 120000
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
    error: ibcToken.chains['osmosis-1']?.error || null
  };
}