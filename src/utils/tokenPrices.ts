import { fetchWithCors } from './fetchWithCORS';

// Cache configuration
interface PriceCache {
  price: number;
  timestamp: number;
}

// Only cache OSMO price since that's all we need from external APIs
let osmoCache: PriceCache | null = null;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Fetches OSMO price from CoinGecko with minimal complexity
 */
export const fetchOsmoPrice = async (): Promise<number | null> => {
  // Check cache first
  const now = Date.now();
  if (osmoCache && (now - osmoCache.timestamp) < CACHE_DURATION) {
    console.log(`Using cached OSMO price: $${osmoCache.price}`);
    return osmoCache.price;
  }
  
  try {
    console.log('Fetching OSMO price from CoinGecko');
    
    // Use our existing CORS proxy approach
    const url = 'https://api.coingecko.com/api/v3/simple/price?ids=osmosis&vs_currencies=usd';
    const data = await fetchWithCors(url);
    
    if (data && data.osmosis && typeof data.osmosis.usd === 'number') {
      const price = data.osmosis.usd;
      console.log(`Successfully fetched OSMO price: $${price}`);
      
      // Cache the price
      osmoCache = {
        price,
        timestamp: now
      };
      
      return price;
    }
    
    console.warn('Could not find OSMO price in CoinGecko response');
    return null;
  } catch (error) {
    console.error('Error fetching OSMO price:', error);
    
    // Use stale cache if available
    if (osmoCache) {
      console.log(`Using stale cached OSMO price: $${osmoCache.price}`);
      return osmoCache.price;
    }
    
    // Fallback OSMO price if all else fails
    return 0.38; // Last known OSMO price
  }
};

/**
 * Calculate PAGE price from pool data
 * This is the most reliable method since it uses on-chain data
 */
export const calculatePagePrice = (
  osmoAmount: string,
  pageAmount: string,
  osmoPrice: number | null
): number | null => {
  if (!osmoPrice) return null;
  
  try {
    // Convert to numbers and adjust for decimals
    const osmoInPool = Number(osmoAmount) / 1e6; // 6 decimals for OSMO
    const pageInPool = Number(pageAmount) / 1e8; // 8 decimals for PAGE
    
    // Only calculate if we have valid amounts
    if (osmoInPool <= 0 || pageInPool <= 0) {
      console.warn('Invalid pool amounts', { osmoInPool, pageInPool });
      return null;
    }
    
    // Calculate PAGE price from the pool ratio and OSMO price
    const pagePriceUsd = (osmoInPool * osmoPrice) / pageInPool;
    console.log(`Calculated PAGE price: $${pagePriceUsd.toFixed(6)}`);
    
    return pagePriceUsd;
  } catch (error) {
    console.error('Error calculating PAGE price:', error);
    return null;
  }
};

/**
 * Calculate TVL from pool data
 */
export const calculateTVL = (
  osmoAmount: string, 
  osmoPrice: number | null
): number | null => {
  if (!osmoPrice) return null;
  
  try {
    // Convert to number and adjust for decimals
    const osmoInPool = Number(osmoAmount) / 1e6;
    
    // Calculate USD value (OSMO accounts for half the pool)
    const tvl = osmoInPool * 2 * osmoPrice;
    console.log(`Calculated TVL: $${tvl.toFixed(2)}`);
    
    return tvl;
  } catch (error) {
    console.error('Error calculating TVL:', error);
    return null;
  }
};

/**
 * Calculate market cap
 */
export const calculateMarketCap = (
  totalSupply: number,
  pagePrice: number | null
): number | null => {
  if (!pagePrice) return null;
  
  try {
    const marketCap = totalSupply * pagePrice;
    console.log(`Calculated market cap: $${marketCap.toFixed(2)}`);
    
    return marketCap;
  } catch (error) {
    console.error('Error calculating market cap:', error);
    return null;
  }
};

/**
 * Clear the price cache (useful for testing)
 */
export const clearPriceCache = (): void => {
  osmoCache = null;
  console.log('Price cache cleared');
};
