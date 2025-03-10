import { useState, useEffect, useCallback } from 'react';
import { evmClient } from '../services/EVMClient';
import { REFRESH_INTERVALS } from '../constants';

export function useEthPrice() {
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchEthPrice = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const price = await evmClient.fetchETHPrice();
      setEthPrice(price);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching ETH price:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchEthPrice();
    
    const intervalId = setInterval(fetchEthPrice, REFRESH_INTERVALS.PRICE_DATA);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchEthPrice]);
  
  return {
    ethPrice,
    lastUpdated,
    loading,
    error,
    refresh: fetchEthPrice
  };
}