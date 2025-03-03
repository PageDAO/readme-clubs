import { useState, useEffect, useCallback } from 'react';

export function useEthPrice() {
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchEthPrice = useCallback(async () => {
    setLoading(true);
    
    try {
      console.log('Fetching ETH price');
      const response = await fetch(
        'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD'
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      const price = data.USD;
      
      if (!price) {
        throw new Error('ETH price not found in response');
      }
      
      console.log('Successfully fetched ETH price:', price);
      setEthPrice(price);
      setError(null);
      return price;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching ETH price';
      console.error('Failed to fetch ETH price:', error);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEthPrice();
  }, [fetchEthPrice]);

  return { ethPrice, loading, error, refetch: fetchEthPrice };
}
