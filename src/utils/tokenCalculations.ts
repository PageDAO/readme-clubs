import { 
  TOKEN_DECIMALS,
  TOTAL_SUPPLY,
  DEFAULT_CIRCULATING_SUPPLY
} from '../constants/ibc';

/**
 * Calculates token price based on pool data
 * @param pageAmount Amount of PAGE in the pool
 * @param osmoAmount Amount of OSMO in the pool
 * @param osmoPrice OSMO price in USD
 * @returns Calculated PAGE price or null if inputs are invalid
 */
export function calculateTokenPrice(
  pageAmount: string | undefined,
  osmoAmount: string | undefined,
  osmoPrice: number | null
): number | null {
  if (!pageAmount || !osmoAmount || !osmoPrice) return null;
  
  // Convert strings to numbers, adjusting for decimals
  const pageAmountNum = Number(pageAmount) / Math.pow(10, TOKEN_DECIMALS.PAGE);
  const osmoAmountNum = Number(osmoAmount) / Math.pow(10, TOKEN_DECIMALS.OSMO);
  
  if (pageAmountNum <= 0) return null;
  
  // Calculate price based on pool ratio
  const priceInOsmo = osmoAmountNum / pageAmountNum;
  const priceInUsd = priceInOsmo * osmoPrice;
  
  return priceInUsd;
}

/**
 * Calculates Total Value Locked in the pool
 * @param pageAmount Amount of PAGE in the pool
 * @param osmoAmount Amount of OSMO in the pool
 * @param pagePrice PAGE price in USD
 * @param osmoPrice OSMO price in USD
 * @returns TVL in USD or null if inputs are invalid
 */
export function calculateTVL(
  pageAmount: string | undefined,
  osmoAmount: string | undefined,
  pagePrice: number | null,
  osmoPrice: number | null
): number | null {
  if (!pageAmount || !osmoAmount || !pagePrice || !osmoPrice) return null;
  
  // Convert strings to numbers, adjusting for decimals
  const pageAmountNum = Number(pageAmount) / Math.pow(10, TOKEN_DECIMALS.PAGE);
  const osmoAmountNum = Number(osmoAmount) / Math.pow(10, TOKEN_DECIMALS.OSMO);
  
  // Calculate TVL as sum of both sides of the pool
  const pageValueUsd = pageAmountNum * pagePrice;
  const osmoValueUsd = osmoAmountNum * osmoPrice;
  
  return pageValueUsd + osmoValueUsd;
}

/**
 * Calculates market capitalization
 * @param price Token price in USD
 * @param circulatingSupply Circulating supply (defaults to DEFAULT_CIRCULATING_SUPPLY)
 * @returns Market cap in USD or null if price is invalid
 */
export function calculateMarketCap(
  price: number | null,
  circulatingSupply: number = DEFAULT_CIRCULATING_SUPPLY
): number | null {
  if (!price || price <= 0 || !circulatingSupply) return null;
  
  return price * circulatingSupply;
}

/**
 * Returns the current circulating supply
 * @returns Estimated circulating supply
 */
export function getCirculatingSupply(): number {
  return DEFAULT_CIRCULATING_SUPPLY;
}

/**
 * Calculates the 24-hour change percentage
 * @param currentPrice Current token price
 * @param previousPrice Token price 24 hours ago
 * @returns Percentage change or null if inputs are invalid
 */
export function calculatePriceChange(
  currentPrice: number | null,
  previousPrice: number | null
): number | null {
  if (!currentPrice || !previousPrice || previousPrice <= 0) return null;
  
  const change = ((currentPrice - previousPrice) / previousPrice) * 100;
  return parseFloat(change.toFixed(2));
}
