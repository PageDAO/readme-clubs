import { useState, useEffect, useCallback } from 'react';
import { osmosisClient } from '../services/OsmosisClient'; // Import the instance
import { REFRESH_INTERVALS } from '../constants/';

export function useOsmoPrice() {
  const [osmoPrice, setOsmoPrice] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchOsmoPrice = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the instance instead of the class
      const price = await osmosisClient.fetchOsmoPrice();
      setOsmoPrice(price);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching OSMO price:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchOsmoPrice();
    
    const intervalId = setInterval(fetchOsmoPrice, REFRESH_INTERVALS.PRICE_DATA);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchOsmoPrice]);
  
  return {
    osmoPrice,
    lastUpdated,
    loading,
    error,
    refresh: fetchOsmoPrice
  };
}