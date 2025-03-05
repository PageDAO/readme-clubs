import { useState, useEffect, useCallback } from 'react';

export function useOsmoPrice() {
  const [osmoPrice, setOsmoPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchOsmoPrice = useCallback(async () => {
    setLoading(true);
    
    try {
      console.log('Fetching OSMO price');
      const response = await fetch(
        'https://min-api.cryptocompare.com/data/price?fsym=OSMO&tsyms=USD'
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      const price = data.USD;
      
      if (!price) {
        throw new Error('OSMO price not found in response');
      }
      
      console.log('Successfully fetched OSMO price:', price);
      setOsmoPrice(price);
      setError(null);
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
  }, [fetchOsmoPrice]);

  return { osmoPrice, loading, error, refetch: fetchOsmoPrice };
}

export default useOsmoPrice;
