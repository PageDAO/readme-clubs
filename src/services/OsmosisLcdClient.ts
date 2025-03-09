import { OSMOSIS_CONFIG } from '../config/osmosisConfig';

export interface PoolAsset {
  token: {
    denom: string;
    amount: string;
  };
}

export interface PoolData {
  pageAmount: string;
  osmoAmount: string;
  poolId: string;
}

export interface TokenPriceData {
  price: number | null;
  marketCap: number | null;
  tvl: number | null;
}

export interface TokenBalance {
  denom: string;
  amount: string;
}

class OsmosisLcdClient {
  private readonly baseUrl: string;
  
  constructor(baseUrl: string = OSMOSIS_CONFIG.LCD_ENDPOINT) {
    this.baseUrl = baseUrl;
  }
  
  /**
   * Fetch pool data for the specified pool ID
   */
  async getPoolData(poolId: string = OSMOSIS_CONFIG.POOLS.PAGE_OSMO.ID): Promise<PoolData> {
    try {
      const response = await fetch(`${this.baseUrl}/osmosis/gamm/v1beta1/pools/${poolId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch pool data: ${response.statusText}`);
      }
      
      const poolData = await response.json();
      const assets = poolData.pool?.pool_assets;
      
      if (!assets || assets.length !== 2) {
        throw new Error("Invalid pool data structure");
      }
      
      // Find PAGE token and OSMO token in pool assets
      const pageAsset = assets.find((asset: PoolAsset) => 
        asset.token.denom === OSMOSIS_CONFIG.PAGE_TOKEN.DENOM
      );
      
      const osmoAsset = assets.find((asset: PoolAsset) => 
        asset.token.denom === OSMOSIS_CONFIG.POOLS.PAGE_OSMO.BASE_DENOM
      );
      
      if (!pageAsset || !osmoAsset) {
        throw new Error("Could not identify tokens in pool");
      }
      
      return {
        pageAmount: pageAsset.token.amount,
        osmoAmount: osmoAsset.token.amount,
        poolId
      };
    } catch (error) {
      console.error("Error fetching pool data:", error);
      throw error;
    }
  }
  
  /**
   * Calculate token price data based on pool ratio and OSMO price
   */
  calculateTokenPriceData(poolData: PoolData, osmoPrice: number | null): TokenPriceData {
    if (osmoPrice === null) {
      return { price: null, marketCap: null, tvl: null };
    }
    
    try {
      // Calculate PAGE price based on pool ratio
      const pageAmount = Number(poolData.pageAmount) / Math.pow(10, OSMOSIS_CONFIG.PAGE_TOKEN.DECIMALS);
      const osmoAmount = Number(poolData.osmoAmount) / Math.pow(10, OSMOSIS_CONFIG.POOLS.PAGE_OSMO.BASE_DECIMALS);
      
      // PAGE price in USD = (OSMO amount * OSMO price in USD) / PAGE amount
      const price = (osmoAmount * osmoPrice) / pageAmount;
      
      // Calculate TVL (Total Value Locked)
      const tvl = pageAmount * price * 2; // Multiply by 2 since it's roughly half the pool
      
      // Calculate market cap (based on total supply)
      const marketCap = OSMOSIS_CONFIG.PAGE_TOKEN.TOTAL_SUPPLY * price;
      
      return { price, marketCap, tvl };
    } catch (error) {
      console.error("Error calculating token price data:", error);
      return { price: null, marketCap: null, tvl: null };
    }
  }
  
  /**
   * Fetch token balance for a specific address
   */
  async getUserBalance(address: string, denom: string = OSMOSIS_CONFIG.PAGE_TOKEN.DENOM): Promise<number> {
    try {
      const balanceUrl = `${this.baseUrl}/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=${denom}`;
      const response = await fetch(balanceUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.statusText}`);
      }
      
      const data = await response.json();
      const amount = data.balance?.amount || "0";
      return Number(amount) / Math.pow(10, OSMOSIS_CONFIG.PAGE_TOKEN.DECIMALS);
    } catch (error) {
      console.error("Error fetching user balance:", error);
      return 0;
    }
  }
  
  /**
   * Fetches all necessary data in a single method for convenience
   */
  async fetchAllTokenData(osmoPrice: number | null, userAddress?: string): Promise<{
    poolData: PoolData;
    priceData: TokenPriceData;
    userBalance?: number;
  }> {
    const poolData = await this.getPoolData();
    const priceData = this.calculateTokenPriceData(poolData, osmoPrice);
    
    let userBalance;
    if (userAddress) {
      userBalance = await this.getUserBalance(userAddress);
    }
    
    return {
      poolData,
      priceData,
      userBalance
    };
  }
}

// Export as singleton instance
export const osmosisClient = new OsmosisLcdClient();

// Also export the class for testing or custom instantiation
export default OsmosisLcdClient;
