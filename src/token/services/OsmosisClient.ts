import { CosmosTokenConfig, PriceData, BalanceData, PoolData } from '../types/tokenTypes';
import { PAGE_TOKEN, REFRESH_INTERVALS } from '../constants';

// Caching mechanism
interface PriceCache {
  timestamp: number;
  price: number;
}

const OSMO_USDC_POOL_ID = "678";

let osmoPrice: PriceCache | null = null;

export class OsmosisClient {
  private readonly osmosisLCD: string;
  private readonly pageTokenConfig: CosmosTokenConfig;
  
  constructor() {
    this.osmosisLCD = 'https://lcd.osmosis.zone';
    this.pageTokenConfig = PAGE_TOKEN.cosmos['osmosis-1'];
  }

  async fetchPoolData(): Promise<PoolData> {
    try {
      const poolId = this.pageTokenConfig.poolId;
      const response = await fetch(`${this.osmosisLCD}/osmosis/gamm/v1beta1/pools/${poolId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch pool data: ${response.statusText}`);
      }
      
      const data = await response.json();
      const assets = data.pool?.pool_assets;
      
      if (!assets || assets.length !== 2) {
        throw new Error('Invalid pool data structure');
      }
      
      // Find PAGE token and OSMO token in pool assets
      const pageAsset = assets.find((asset: any) => 
        asset.token.denom === this.pageTokenConfig.ibcDenom
      );
      
      const osmoAsset = assets.find((asset: any) => 
        asset.token.denom === 'uosmo'
      );
      
      if (!pageAsset || !osmoAsset) {
        throw new Error('Could not identify tokens in pool');
      }
      
      return {
        poolId,
        tokenAAmount: Number(pageAsset.token.amount) / Math.pow(10, this.pageTokenConfig.decimals),
        tokenBAmount: Number(osmoAsset.token.amount) / Math.pow(10, 6), // OSMO has 6 decimals
        tokenASymbol: 'PAGE',
        tokenBSymbol: 'OSMO'
      };
    } catch (error) {
      console.error('Error fetching pool data:', error);
      throw error;
    }
  }

  async fetchOsmoPrice(): Promise<number> {
    // Check cache first
    const now = Date.now();
    if (osmoPrice && now - osmoPrice.timestamp < REFRESH_INTERVALS.PRICE_DATA) {
      return osmoPrice.price;
    }
  
    try {
      console.log("Fetching OSMO price from Osmosis API");
    
      // Fetch the OSMO/USDC pool data
      const response = await fetch(`${this.osmosisLCD}/osmosis/gamm/v1beta1/pools/${OSMO_USDC_POOL_ID}`);
    
      if (!response.ok) {
        throw new Error(`Failed to fetch OSMO/USDC pool data: ${response.statusText}`);
      }
    
      const data = await response.json();
      const assets = data.pool?.pool_assets;
    
      if (!assets || assets.length !== 2) {
        throw new Error('Invalid pool data structure');
      }
    
      // Find OSMO and USDC in the pool assets
      const osmoAsset = assets.find((asset: any) => 
        asset.token.denom === 'uosmo'
      );
    
      const usdcAsset = assets.find((asset: any) => 
        // USDC on Osmosis has an IBC denom like this:
        asset.token.denom.includes('ibc/') && 
        // You may need to adjust this if you know the exact IBC denom
        !asset.token.denom.includes(this.pageTokenConfig.ibcDenom)
      );
    
      if (!osmoAsset || !usdcAsset) {
        throw new Error('Could not identify OSMO or USDC in pool');
      }
    
      // USDC has 6 decimals, OSMO has 6 decimals
      const osmoAmount = Number(osmoAsset.token.amount) / 1e6;
      const usdcAmount = Number(usdcAsset.token.amount) / 1e6;
    
      // Calculate OSMO price: USDC amount / OSMO amount
      const price = usdcAmount / osmoAmount;
    
      // Update cache
      osmoPrice = {
        timestamp: now,
        price
      };
    
      console.log(`Calculated OSMO price: ${price}`);
      return price;
    } catch (error) {
      console.error('Error fetching OSMO price:', error);
    
      // Only use cache as fallback if it exists
      if (osmoPrice) {
        console.log('Using cached OSMO price as fallback');
        return osmoPrice.price;
      }
    
      // Otherwise, propagate the error
      throw error;
    }
  }
  calculatePagePrice(poolData: PoolData, osmoPrice: number): number {
    // PAGE price = (OSMO amount * OSMO price) / PAGE amount
    return (poolData.tokenBAmount * osmoPrice) / poolData.tokenAAmount;
  }

  calculateTVL(poolData: PoolData, pagePrice: number): number {
    // TVL = PAGE amount * PAGE price * 2 (because it's roughly half the pool)
    return poolData.tokenAAmount * pagePrice * 2;
  }

  async fetchUserBalance(address: string): Promise<number> {
    try {
      const balanceUrl = `${this.osmosisLCD}/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=${this.pageTokenConfig.ibcDenom}`;
      const response = await fetch(balanceUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.statusText}`);
      }
      
      const data = await response.json();
      const amount = data.balance?.amount || '0';
      return Number(amount) / Math.pow(10, this.pageTokenConfig.decimals);
    } catch (error) {
      console.error('Error fetching user balance:', error);
      throw error;
    }
  }

  async fetchAllTokenData(address?: string): Promise<{
    priceData: PriceData;
    poolData: PoolData;
    balanceData: BalanceData | null;
  }> {
    try {
      // Fetch OSMO price and pool data in parallel
      const [osmoPrice, poolData] = await Promise.all([
        this.fetchOsmoPrice(),
        this.fetchPoolData()
      ]);
      
      // Calculate PAGE price and TVL
      const pagePrice = this.calculatePagePrice(poolData, osmoPrice);
      const tvl = this.calculateTVL(poolData, pagePrice);
      
      const priceData: PriceData = {
        price: pagePrice,
        timestamp: Date.now(),
        error: null
      };

      // Fetch user balance if address is provided
      let balanceData: BalanceData | null = null;
      if (address) {
        const balance = await this.fetchUserBalance(address);
        balanceData = {
          balance,
          balanceUSD: balance * pagePrice,
          timestamp: Date.now(),
          error: null
        };
      }
      
      return {
        priceData,
        poolData,
        balanceData
      };
    } catch (error) {
      console.error('Error fetching all token data:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        priceData: {
          price: null,
          timestamp: Date.now(),
          error: `Price fetch error: ${errorMessage}`
        },
        poolData: {
          poolId: this.pageTokenConfig.poolId,
          tokenAAmount: 0,
          tokenBAmount: 0,
          tokenASymbol: 'PAGE',
          tokenBSymbol: 'OSMO'
        },
        balanceData: address ? {
          balance: 0,
          balanceUSD: null,
          timestamp: Date.now(),
          error: `Balance fetch error: ${errorMessage}`
        } : null
      };
    }
  }
}

// Export a singleton instance
export const osmosisClient = new OsmosisClient();
