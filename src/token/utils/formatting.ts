/**
 * Format a number as currency
 */
export function formatCurrency(value: number | null | undefined, options?: {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}): string {
  if (value === null || value === undefined) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2
  }).format(value);
}

/**
 * Format a number with appropriate decimal places
 */
export function formatNumber(value: number | null | undefined, options?: {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}): string {
  if (value === null || value === undefined) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2
  }).format(value);
}

/**
 * Format a token balance with the token symbol
 */
export function formatTokenBalance(
  balance: number | null | undefined, 
  symbol: string, 
  decimals: number = 2
): string {
  if (balance === null || balance === undefined) return `0 ${symbol}`;
  return `${balance.toFixed(decimals)} ${symbol}`;
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | null | undefined): string {
  if (!date) return 'Never';
  return date.toLocaleString();
}
