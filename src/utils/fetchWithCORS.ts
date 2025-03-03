// Enhanced fetchWithCors to handle different proxy formats
export async function fetchWithCors(url: string): Promise<any> {
  try {
    // Use a public CORS proxy
    const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    
    const response = await fetch(corsProxyUrl, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Handle different proxy response formats
    if (data.contents) {
      // Some proxies wrap the response in a 'contents' field
      try {
        return typeof data.contents === 'string' 
          ? JSON.parse(data.contents) 
          : data.contents;
      } catch (e) {
        console.warn('Could not parse proxy contents as JSON', e);
        return data;
      }
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    throw error;
  }
}
