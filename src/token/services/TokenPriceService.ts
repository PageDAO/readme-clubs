import { PriceData } from '../types';
import { REFRESH_INTERVALS } from '../constants';

interface PriceCache {
  [id: string]: {
    price: number;
    timestamp: number;
  };
}

export class TokenPriceService {
  private cache: PriceCache = {};
  
  constructor() {
    this.cache = {};
  }
  
  async fetchPrice(tokenId: string, fallbackPrice?: number): Promise<PriceData> {
    // Check cache first
    const now = Date.now();
    const cacheKey = `${tokenId.toLowerCase()}_usd`;
    
    if (this.cache[cacheKey] && now - this.cache[cacheKey].timestamp < REFRESH_INTERVALS.PRICE_DATA) {
      return {
        price: this.cache[cacheKey].price,
        timestamp: this.cache[cacheKey].timestamp,
        error: null
      };
    }
    
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`);
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data[tokenId]?.usd) {
        const price = data[tokenId].usd;
        
        // Update cache
        this.cache[cacheKey] = {
          price,
          timestamp: now
        };
        
        return {
          price,
          timestamp: now,
          error: null
        };
      } else {
        throw new Error(`No price data for ${tokenId}`);
      }
    } catch (error) {
      console.error(`Error fetching price for ${tokenId}:`, error);
      
      // Use fallback if available
      if (fallbackPrice !== undefined && fallbackPrice !== null) {
        return {
          price: fallbackPrice,
          timestamp: now,
          error: null
        };
      }
      
      // Use cached value as fallback if available
      if (this.cache[cacheKey]) {
        console.log(`Using cached price for ${tokenId} as fallback`);
        return {
          price: this.cache[cacheKey].price,
          timestamp: this.cache[cacheKey].timestamp,
          error: `Using cached data from ${new Date(this.cache[cacheKey].timestamp).toLocaleString()}`
        };
      }
      
      // Return error if no fallbacks available
      return {
        price: null,
        timestamp: now,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  async fetchEthPrice(): Promise<PriceData> {
    return this.fetchPrice('ethereum', 2000); // Fallback to $2000 if API fails
  }
}

// Export a singleton instance
export const tokenPriceService = new TokenPriceService();
