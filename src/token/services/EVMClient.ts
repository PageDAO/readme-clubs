import { ethers } from 'ethers';
import { PriceData, BalanceData, PoolData } from '../types';
import { REFRESH_INTERVALS } from '../constants';

// Cache mechanism for ETH price
interface PriceCache {
  timestamp: number;
  price: number;
}

// Global cache variable
let ethPriceCache: PriceCache | null = null;

// Uniswap V3 constants
const UNISWAP_V3_FACTORY = "0x33128a8FC17869897dcE68Ed026d694621f6FD2f";
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006"; 

// Contract addresses for PAGE token on each chain
const PAGE_TOKEN_ADDRESSES = {
  1: "0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e",     // Ethereum
  10: "0xe67E77c47a37795c0ea40A038F7ab3d76492e803",    // Optimism
  8453: "0xc4730f86d1F86cE0712a7b17EE919Db7dEFad7FE"  // Base
};

// Pool addresses for PAGE/ETH on each chain
const POOL_ADDRESSES = {
  1: "0x292e42f0c7938332bB702f4f2e69a8C9985B029A",    // Ethereum
  10: "0x51274e5D8ffBD9C83C3D3f376BC11C126ADA9Cd3",   // Optimism
  8453: "0x36B17372A1088E45DcA488C6F2E214737F59F3C3"  // Base
};

// ABIs
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

const UNISWAP_V2_PAIR_ABI = [
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() view returns (address)",
  "function token1() view returns (address)"
];

const UNISWAP_V3_FACTORY_ABI = [
  "function getPool(address tokenA, address tokenB, uint24 fee) view returns (address pool)"
];

const UNISWAP_V3_POOL_ABI = [
  "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
  "function token0() view returns (address)",
  "function token1() view returns (address)"
];

/**
 * Client for interacting with EVM chains to fetch PAGE token data
 */
export class EVMClient {
  private providers: Record<number, ethers.providers.JsonRpcProvider>;
  
  constructor() {
    this.providers = {
      1: new ethers.providers.JsonRpcProvider('https://ethereum.publicnode.com'),
      10: new ethers.providers.JsonRpcProvider('https://mainnet.optimism.io'),
      8453: new ethers.providers.JsonRpcProvider('https://mainnet.base.org')
    };
  }
  
  /**
   * Get provider for a specific chain
   */
  private getProvider(chainId: number): ethers.providers.JsonRpcProvider {
    const provider = this.providers[chainId];
    if (!provider) {
      throw new Error(`Provider not found for chain ID: ${chainId}`);
    }
    return provider;
  }
  
  /**
   * Fetch ETH price using CoinGecko API (matching the approach in the existing code)
   */
  async fetchETHPrice(): Promise<number> {
    // Check cache first
    const now = Date.now();
    if (ethPriceCache && now - ethPriceCache.timestamp < REFRESH_INTERVALS.PRICE_DATA) {
      return ethPriceCache.price;
    }
    
    try {
      console.log("Fetching ETH price from CoinGecko");
      
      // Use CoinGecko API - this seems to be the approach used in the existing code
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
      
      console.log(`Fetched ETH price: ${price}`);
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
  
  /**
   * Fetch pool data for PAGE token on a specific chain
async fetchPoolData(chainId: number): Promise<PoolData> {
  console.log(`Attempting to fetch pool data for chain ID: ${chainId}`);
  
  try {
    const provider = this.getProvider(chainId);
    const poolAddress = POOL_ADDRESSES[chainId];
    
    if (!poolAddress) {
      throw new Error(`Pool address not found for chain ID: ${chainId}`);
    }
    
    const poolContract = new ethers.Contract(
      poolAddress,
      UNISWAP_V2_PAIR_ABI,
      provider
    );
    
    // Get token addresses
    const token0 = await poolContract.token0();
    const token1 = await poolContract.token1();
    
    // Get reserves
    const reserves = await poolContract.getReserves();
    const reserve0 = reserves.reserve0;
    const reserve1 = reserves.reserve1;
    
    // Determine which token is PAGE
    const pageTokenAddress = PAGE_TOKEN_ADDRESSES[chainId].toLowerCase();
    const isToken0Page = token0.toLowerCase() === pageTokenAddress;
    
    // Get token contracts to fetch decimals
    const token0Contract = new ethers.Contract(token0, ERC20_ABI, provider);
    const token1Contract = new ethers.Contract(token1, ERC20_ABI, provider);
    
    const token0Decimals = await token0Contract.decimals();
    const token1Decimals = await token1Contract.decimals();
    const token0Symbol = await token0Contract.symbol();
    const token1Symbol = await token1Contract.symbol();
    
    // Format amounts based on token decimals
    let pageAmount, otherAmount, otherSymbol;
    
    if (isToken0Page) {
      pageAmount = Number(ethers.utils.formatUnits(reserve0, token0Decimals));
      otherAmount = Number(ethers.utils.formatUnits(reserve1, token1Decimals));
      otherSymbol = token1Symbol;
    } else {
      pageAmount = Number(ethers.utils.formatUnits(reserve1, token1Decimals));
      otherAmount = Number(ethers.utils.formatUnits(reserve0, token0Decimals));
      otherSymbol = token0Symbol;
    }
    
    const result = {
      poolId: poolAddress,
      tokenAAmount: pageAmount,
      tokenBAmount: otherAmount,
      tokenASymbol: 'PAGE',
      tokenBSymbol: otherSymbol
    };
    
    console.log(`Successfully fetched pool data for chain ID: ${chainId}`);
    return result;
  } catch (error) {
    console.error(`Error fetching pool data for chain ${chainId}:`, error);
    throw error;
  }
}

async fetchAllTokenData(chainId: number, ethPrice: number, address?: string): Promise<{
  priceData: PriceData;
  poolData: PoolData;
  balanceData: BalanceData | null;
}> {
  console.log(`Fetching all token data for chain ID: ${chainId}, ETH price: ${ethPrice}`);
  
  try {
    // Fetch pool data
    const poolData = await this.fetchPoolData(chainId);
  /**
   * Calculate PAGE price based on pool data and ETH price
   */
  calculatePagePrice(poolData: PoolData, ethPrice: number): number {
    // PAGE price = ETH amount * ETH price / PAGE amount
    return (poolData.tokenBAmount * ethPrice) / poolData.tokenAAmount;
  }
  
  /**
   * Calculate TVL for the pool
   */
  calculateTVL(poolData: PoolData, pagePrice: number): number {
    // TVL = PAGE amount * PAGE price * 2 (because it's roughly half the pool)
    return poolData.tokenAAmount * pagePrice * 2;
  }
  
  /**
   * Fetch user balance for PAGE token
   */
  async fetchUserBalance(chainId: number, address: string): Promise<number> {
    try {
      const provider = this.getProvider(chainId);
      const pageAddress = PAGE_TOKEN_ADDRESSES[chainId];
      
      if (!pageAddress) {
        throw new Error(`PAGE token address not found for chain ID: ${chainId}`);
      }
      
      const tokenContract = new ethers.Contract(pageAddress, ERC20_ABI, provider);
      const decimals = await tokenContract.decimals();
      const balance = await tokenContract.balanceOf(address);
      
      return Number(ethers.utils.formatUnits(balance, decimals));
    } catch (error) {
      console.error(`Error fetching user balance for chain ${chainId}:`, error);
      throw error;
    }
  }
  
  /**
   * Fetch all token data for a specific chain
   */
  async fetchAllTokenData(chainId: number, ethPrice: number, address?: string): Promise<{
    priceData: PriceData;
    poolData: PoolData;
    balanceData: BalanceData | null;
  }> {
    try {
      // Fetch pool data
      const poolData = await this.fetchPoolData(chainId);
      
      // Calculate PAGE price and TVL
      const pagePrice = this.calculatePagePrice(poolData, ethPrice);
      const tvl = this.calculateTVL(poolData, pagePrice);
      
      const priceData: PriceData = {
        price: pagePrice,
        timestamp: Date.now(),
        error: null
      };
      
      // Fetch user balance if address is provided
      let balanceData: BalanceData | null = null;
      if (address) {
        const balance = await this.fetchUserBalance(chainId, address);
        balanceData = {
          balance,
          balanceUSD: balance * pagePrice,
          timestamp: Date.now(),
          error: null
        };
      }
      
      return {
        priceData,
        poolData,
        balanceData
      };
    } catch (error) {
      console.error(`Error fetching all token data for chain ${chainId}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        priceData: {
          price: null,
          timestamp: Date.now(),
          error: `Price fetch error: ${errorMessage}`
        },
        poolData: {
          poolId: POOL_ADDRESSES[chainId] || 'unknown',
          tokenAAmount: 0,
          tokenBAmount: 0,
          tokenASymbol: 'PAGE',
          tokenBSymbol: 'ETH'
        },
        balanceData: address ? {
          balance: 0,
          balanceUSD: null,
          timestamp: Date.now(),
          error: `Balance fetch error: ${errorMessage}`
        } : null
      };
    }
  }
}

// Export a singleton instance
export const evmClient = new EVMClient();