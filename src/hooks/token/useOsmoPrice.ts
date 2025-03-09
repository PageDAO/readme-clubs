// src/hooks/token/useOsmoPrice.ts
import { useState, useEffect, useCallback } from 'react';

export function useOsmoPrice() {
  const [osmoPrice, setOsmoPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const fetchOsmoPrice = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching OSMO price from Osmosis API');
      
      // Fetch OSMO/USDC pool data - pool #678
      const response = await fetch('https://lcd.osmosis.zone/osmosis/gamm/v1beta1/pools/678');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Verify the pool structure
      const pool = data.pool;
      if (!pool || !pool.pool_assets || pool.pool_assets.length !== 2) {
        throw new Error('Invalid pool data structure');
      }
      
      // Find the USDC and OSMO tokens
      const usdcAsset = pool.pool_assets.find((asset: any) => 
        asset.token.denom === 'ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858'
      );
      
      const osmoAsset = pool.pool_assets.find((asset: any) => 
        asset.token.denom === 'uosmo'
      );
      
      if (!usdcAsset || !osmoAsset) {
        throw new Error('Could not identify tokens in pool');
      }
      
      // Convert to human readable amounts
      const usdcAmount = Number(usdcAsset.token.amount) / 1e6; // USDC has 6 decimals
      const osmoAmount = Number(osmoAsset.token.amount) / 1e6; // OSMO has 6 decimals
      
      // Calculate OSMO price in USD
      const price = usdcAmount / osmoAmount;
      
      console.log('Successfully calculated OSMO price:', {
        usdcAmount,
        osmoAmount,
        price
      });
      
      setOsmoPrice(price);
      setLastUpdated(new Date());
      return price;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching OSMO price';
      console.error('Failed to fetch OSMO price:', error);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOsmoPrice();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchOsmoPrice, 60000);
    return () => clearInterval(interval);
  }, [fetchOsmoPrice]);

  return { 
    osmoPrice, 
    loading, 
    error, 
    lastUpdated,
    refetch: fetchOsmoPrice 
  };
}

export default useOsmoPrice;