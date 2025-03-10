import { ChainMetadata } from '../types';

export const EVM_CHAINS: ChainMetadata[] = [
  {
    id: 1,
    name: 'Ethereum',
    type: 'evm',
    nativeToken: 'ETH',
    rpcUrl: 'https://ethereum.publicnode.com',
    explorerUrl: 'https://etherscan.io'
  },
  {
    id: 8453,
    name: 'Base',
    type: 'evm',
    nativeToken: 'ETH',
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org'
  },
  {
    id: 10,
    name: 'Optimism',
    type: 'evm',
    nativeToken: 'ETH',
    rpcUrl: 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io'
  }
];

export const COSMOS_CHAINS: ChainMetadata[] = [
  {
    id: 'osmosis-1',
    name: 'Osmosis',
    type: 'cosmos',
    nativeToken: 'OSMO',
    rpcUrl: 'https://rpc.osmosis.zone',
    explorerUrl: 'https://www.mintscan.io/osmosis'
  }
];

export const ALL_CHAINS = [...EVM_CHAINS, ...COSMOS_CHAINS];

export const getChainById = (id: string | number): ChainMetadata | undefined => {
  return ALL_CHAINS.find(chain => chain.id === id);
};
