import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useContractRead } from 'wagmi';
import { formatUnits } from 'viem';
import type { Address } from 'viem';
import UniswapModal from '../features/web3/UniswapModal';

// Contract addresses
const PAGE_TOKEN_ADDRESS = '0xc4730f86d1f86ce0712a7b17ee919db7defad7fe' as const;
const LP_CONTRACT_ADDRESS = '0x7989DD74dF816A32EE0DaC0f3f8e24d740fc5cB2' as const;

// ABIs
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
] as const;

const UNISWAP_V2_PAIR_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'getReserves',
    outputs: [
      { name: 'reserve0', type: 'uint112' },
      { name: 'reserve1', type: 'uint112' },
      { name: 'blockTimestampLast', type: 'uint32' },
    ],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'token0',
    outputs: [{ name: '', type: 'address' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'token1',
    outputs: [{ name: '', type: 'address' }],
    type: 'function',
  },
] as const;

type GetReservesResult = [bigint, bigint, number];

const HomePage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [isUniswapModalOpen, setIsUniswapModalOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Readme Clubs
        </h1>
        <p className="text-xl text-gray-600">
          Join the decentralized reading revolution
        </p>
      </div>

      {/* Main Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <a 
          href="https://pagedao.org" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
        >
          <h2 className="text-xl font-bold mb-2">PageDAO</h2>
          <p className="text-gray-600">Explore the PageDAO community and governance</p>
        </a>

        <a 
          href="/forum" 
          className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
        >
          <h2 className="text-xl font-bold mb-2">Club Forum</h2>
          <p className="text-gray-600">Join discussions about your favorite books</p>
        </a>

        <a 
          href="https://opensea.io/collection/readme-books" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
        >
          <h2 className="text-xl font-bold mb-2">Readme Books</h2>
          <p className="text-gray-600">Browse our NFT book collection on OpenSea</p>
        </a>
      </div>

      {/* Token Section */}
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Get Started with $PAGE</h2>
        <p className="text-gray-600 mb-4">
          Join our community by acquiring $PAGE tokens and participating in governance
        </p>
        <button
          onClick={() => setIsUniswapModalOpen(true)}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Trade $PAGE
        </button>
      </div>

      <UniswapModal
        isOpen={isUniswapModalOpen}
        onClose={() => setIsUniswapModalOpen(false)}
      />
    </div>
  );
};

export default HomePage;