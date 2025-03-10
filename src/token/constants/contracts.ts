// This is a simplified ABI with just the functions we need
export const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "string"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];

// WETH ABI for price calculations
export const WETH_ABI = ERC20_ABI;

// Uniswap V2 Pair ABI (simplified)
export const UNISWAP_V2_PAIR_ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "getReserves",
    "outputs": [
      {"name": "_reserve0", "type": "uint112"},
      {"name": "_reserve1", "type": "uint112"},
      {"name": "_blockTimestampLast", "type": "uint32"}
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "token0",
    "outputs": [{"name": "", "type": "address"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "token1",
    "outputs": [{"name": "", "type": "address"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];

export const CONTRACT_ADDRESSES = {
  PAGE: {
    1: '0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e',      // Ethereum
    8453: '0xc4730f86d1F86cE0712a7b17EE919Db7dEFad7FE',   // Base
    10: '0xe67E77c47a37795c0ea40A038F7ab3d76492e803'      // Optimism
  },
  POOLS: {
    1: '0x1234567890abcdef1234567890abcdef12345678',     // Replace with actual Ethereum pool address
    8453: '0x1234567890abcdef1234567890abcdef12345678',  // Replace with actual Base pool address
    10: '0x1234567890abcdef1234567890abcdef12345678'     // Replace with actual Optimism pool address
  }
};