// JavaScript version of token configuration for Netlify functions
const PAGE_TOKENS = [
    {
      chainId: 1, // mainnet
      address: '0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e',
      decimals: 8,
      symbol: 'PAGE',
      name: 'Page',
      logoURI: '/images/page-token-logo.png',
      lpAddress: '0x9a25d21e204f10177738edb0c3345bd88478aaa2', 
      dexUrl: 'https://app.uniswap.org/#/swap?outputCurrency=0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e',
      tokenIsToken0: true
    },
    {
      chainId: 10, // optimism
      address: '0xe67E77c47a37795c0ea40A038F7ab3d76492e803',
      decimals: 8,
      symbol: 'PAGE',
      name: 'Page',
      logoURI: '/images/page-token-logo.png',
      lpAddress: '0x5421DA31D54640b58355d8D16D78af84D34D2405', 
      dexUrl: 'https://app.uniswap.org/#/swap?outputCurrency=0xe67E77c47a37795c0ea40A038F7ab3d76492e803&chain=optimism',
      tokenIsToken0: false
    },
    {
      chainId: 8453, // base
      address: '0xc4730f86d1F86cE0712a7b17EE919Db7dEFad7FE',
      decimals: 8,
      symbol: 'PAGE',
      name: 'Page',
      logoURI: '/images/page-token-logo.png',
      lpAddress: '0x7989DD74dF816A32EE0DaC0f3f8e24d740fc5cB2',
      dexUrl: 'https://app.uniswap.org/#/swap?outputCurrency=0xc4730f86d1F86cE0712a7b17EE919Db7dEFad7FE&chain=base',
      tokenIsToken0: false
    }
  ];
  
  const COSMOS_PAGE_TOKEN = {
    chainId: 'osmosis-1',
    denom: 'ibc/23A62409E4AD8133116C249B1FA38EED30E500A115D7B153109462CD82C1CD99',
    decimals: 8,
    symbol: 'PAGE',
    name: 'Page',
    logoURI: '/images/page-token-logo.png',
    osmosisPoolId: '1344',
    dexUrl: 'https://app.osmosis.zone/pools/1344',
  };
  
  module.exports = {
    PAGE_TOKENS,
    COSMOS_PAGE_TOKEN
  };
  