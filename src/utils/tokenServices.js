// Import the configuration from your existing files
const { OSMOSIS_PAGE_DENOM, OSMOSIS_LCD, POOL_ID, OSMO_USDC_POOL_ID } = require('../../src/constants/ibc');
const { PAGE_TOKENS, COSMOS_PAGE_TOKEN } = require('../../src/token/constants/tokenConfig');

// Cache for prices
let ethPriceCache = null;
let osmoPrice = null;
const REFRESH_INTERVALS = {
  PRICE_DATA: 60000 // 1 minute
};

/**
 * Fetches PAGE token prices across different chains
 */
async function fetchPagePrices() {
  const prices = {
    ethereum: 0,
    base: 0,
    optimism: 0,
    osmosis: 0
  };

  try {
    // First get base asset prices (ETH and OSMO)
    const ethPrice = await fetchETHPrice();
    const osmoPriceValue = await fetchOsmoPrice();
    
    // Get Ethereum PAGE price
    const ethPoolData = await fetchEVMPoolData(
      PAGE_TOKENS[0].lpAddress,
      PAGE_TOKENS[0].tokenIsToken0
    );
    prices.ethereum = calculateEVMPrice(ethPoolData, ethPrice);
    
    // Get Base PAGE price
    const basePoolData = await fetchEVMPoolData(
      PAGE_TOKENS[2].lpAddress, 
      PAGE_TOKENS[2].tokenIsToken0
    );
    prices.base = calculateEVMPrice(basePoolData, ethPrice);
    
    // Get Optimism PAGE price
    const optimismPoolData = await fetchEVMPoolData(
      PAGE_TOKENS[1].lpAddress,
      PAGE_TOKENS[1].tokenIsToken0
    );
    prices.optimism = calculateEVMPrice(optimismPoolData, ethPrice);
    
    // Get Osmosis PAGE price
    const osmosisPoolData = await fetchOsmosisPoolData(POOL_ID);
    prices.osmosis = calculateOsmosisPrice(osmosisPoolData, osmoPriceValue);
    
    return prices;
  } catch (error) {
    console.error("Error fetching prices:", error);
    return prices; 
  }
}

// Reusing your fetchETHPrice method from EVMClient.ts
async function fetchETHPrice() {
  // Check cache first
  const now = Date.now();
  if (ethPriceCache && now - ethPriceCache.timestamp < REFRESH_INTERVALS.PRICE_DATA) {
    return ethPriceCache.price;
  }
  
  try {
    console.log("Fetching ETH price from CoinGecko");
    
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const price = data.ethereum.usd;
    
    // Update cache
    ethPriceCache = {
      timestamp: now,
      price
    };
    
    return price;
  } catch (error) {
    console.error('Error fetching ETH price:', error);
    
    if (ethPriceCache) {
      console.log('Using cached ETH price as fallback');
      return ethPriceCache.price;
    }
    
    throw error;
  }
}

// Reusing your fetchOsmoPrice method from OsmosisClient.ts
async function fetchOsmoPrice() {
  // Check cache first
  const now = Date.now();
  if (osmoPrice && now - osmoPrice.timestamp < REFRESH_INTERVALS.PRICE_DATA) {
    return osmoPrice.price;
  }

  try {
    console.log("Fetching OSMO price from Osmosis API");
  
    // Fetch the OSMO/USDC pool data
    const response = await fetch(`${OSMOSIS_LCD}/osmosis/gamm/v1beta1/pools/${OSMO_USDC_POOL_ID}`);
  
    if (!response.ok) {
      throw new Error(`Failed to fetch OSMO/USDC pool data: ${response.statusText}`);
    }
  
    const data = await response.json();
    const assets = data.pool?.pool_assets;
  
    if (!assets || assets.length !== 2) {
      throw new Error('Invalid pool data structure');
    }
  
    // Find OSMO and USDC in the pool assets
    const osmoAsset = assets.find((asset) => 
      asset.token.denom === 'uosmo'
    );
  
    const usdcAsset = assets.find((asset) => 
      asset.token.denom.includes('ibc/') && 
      !asset.token.denom.includes(OSMOSIS_PAGE_DENOM)
    );
  
    if (!osmoAsset || !usdcAsset) {
      throw new Error('Could not identify OSMO or USDC in pool');
    }
  
    // USDC has 6 decimals, OSMO has 6 decimals
    const osmoAmount = Number(osmoAsset.token.amount) / 1e6;
    const usdcAmount = Number(usdcAsset.token.amount) / 1e6;
  
    // Calculate OSMO price: USDC amount / OSMO amount
    const price = usdcAmount / osmoAmount;
  
    // Update cache
    osmoPrice = {
      timestamp: now,
      price
    };
  
    return price;
  } catch (error) {
    console.error('Error fetching OSMO price:', error);
  
    if (osmoPrice) {
      return osmoPrice.price;
    }
    
    throw error;
  }
}

// Fetch Osmosis pool data
async function fetchOsmosisPoolData(poolId) {
  try {
    const response = await fetch(`${OSMOSIS_LCD}/osmosis/gamm/v1beta1/pools/${poolId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch pool data: ${response.statusText}`);
    }
    
    const data = await response.json();
    const assets = data.pool?.pool_assets;
    
    if (!assets || assets.length !== 2) {
      throw new Error('Invalid pool data structure');
    }
    
    // Find PAGE token and OSMO token in pool assets
    const pageAsset = assets.find((asset) => 
      asset.token.denom === OSMOSIS_PAGE_DENOM
    );
    
    const osmoAsset = assets.find((asset) => 
      asset.token.denom === 'uosmo'
    );
    
    if (!pageAsset || !osmoAsset) {
      throw new Error('Could not identify tokens in pool');
    }
    
    return {
      poolId,
      tokenAAmount: Number(pageAsset.token.amount) / Math.pow(10, COSMOS_PAGE_TOKEN.decimals),
      tokenBAmount: Number(osmoAsset.token.amount) / Math.pow(10, 6) // OSMO has 6 decimals
    };
  } catch (error) {
    console.error('Error fetching pool data:', error);
    throw error;
  }
}

// Calculate Osmosis PAGE price
function calculateOsmosisPrice(poolData, osmoPrice) {
  // PAGE price = OSMO amount * OSMO price / PAGE amount
  return (poolData.tokenBAmount * osmoPrice) / poolData.tokenAAmount;
}

// Fetch EVM pool data (adapting from your EVMClient)
async function fetchEVMPoolData(lpAddress, tokenIsToken0) {
  try {
    // This would normally use Ethers.js/viem, but for serverless we'll use an RPC endpoint
    const response = await fetch('https://eth.llamarpc.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [
          {
            to: lpAddress,
            data: '0x0902f1ac' // getReserves function signature
          },
          'latest'
        ]
      })
    });
    
    const data = await response.json();
    
    if (!data.result) {
      throw new Error('Invalid response from RPC');
    }
    
    // Decode the response (reserves0, reserves1, timestamp)
    const reserves0 = parseInt(data.result.substr(2, 64), 16);
    const reserves1 = parseInt(data.result.substr(66, 64), 16);
    
    return {
      tokenAAmount: tokenIsToken0 ? 
        reserves0 / Math.pow(10, 8) : // PAGE has 8 decimals
        reserves1 / Math.pow(10, 8),
      tokenBAmount: tokenIsToken0 ? 
        reserves1 / Math.pow(10, 18) : // ETH has 18 decimals
        reserves0 / Math.pow(10, 18)
    };
  } catch (error) {
    console.error('Error fetching EVM pool data:', error);
    throw error;
  }
}

// Calculate EVM PAGE price
function calculateEVMPrice(poolData, ethPrice) {
  // PAGE price = ETH amount * ETH price / PAGE amount
  return (poolData.tokenBAmount * ethPrice) / poolData.tokenAAmount;
}

module.exports = {
  fetchPagePrices
};
