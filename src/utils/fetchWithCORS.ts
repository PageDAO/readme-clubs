// Enhanced fetchWithCors to handle different proxy formats and rate limiting
export async function fetchWithCors(url: string, maxRetries = 2): Promise<any> {
  let retries = 0;
  
  async function attemptFetch(): Promise<any> {
    try {
      // Try alternate CORS proxies in order of reliability
      const proxyUrls = [
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
      ];
      
      // Use the first proxy in our list
      const proxyUrl = proxyUrls[0];
      console.log(`Fetching from ${url} via proxy: ${proxyUrl}`);
      
      const response = await fetch(proxyUrl, {
        headers: {
          'Accept': 'application/json',
        }
      });
      
      // Check for rate limiting
      if (response.status === 429) {
        console.warn('Rate limited by CoinGecko API. Using fallback values.');
        throw new Error('API rate limit exceeded');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle different proxy response formats
      if (data.contents) {
        // Parse the contents string - check if it contains rate limit error
        try {
          const contents = typeof data.contents === 'string' 
            ? JSON.parse(data.contents) 
            : data.contents;
            
          // Check for rate limit error inside contents
          if (contents.status && contents.status.error_code === 429) {
            console.warn('Rate limited by CoinGecko API. Using fallback values.');
            throw new Error('API rate limit exceeded');
          }
          
          return contents;
        } catch (e) {
          console.warn('Could not parse proxy contents as JSON', e);
          return data;
        }
      }
      
      // Check if we have an error in the response data
      if (data.error) {
        throw new Error(data.error.message || 'Proxy error');
      }
      
      return data;
    } catch (error: unknown) {
      // Handle 'unknown' error type properly
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isRateLimitError = errorMessage === 'API rate limit exceeded';
      
      // If we have retries left and it's a rate limit error, wait and retry
      if (retries < maxRetries && isRateLimitError) {
        retries++;
        // Exponential backoff: wait longer for each retry
        const waitTime = Math.pow(2, retries) * 1000;
        console.log(`Retrying after ${waitTime}ms (attempt ${retries}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return attemptFetch();
      }
      
      console.error(`Error fetching from ${url}:`, error);
      throw error;
    }
  }
  
  return attemptFetch();
}
