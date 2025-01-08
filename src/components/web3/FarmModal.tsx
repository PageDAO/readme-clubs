import React, { useState, useEffect } from 'react';
import { useAccount, useContractRead, useContractWrite } from 'wagmi';
import { formatEther, parseEther } from 'viem';

// Contract addresses
const WETH_ADDRESS = '0x4200000000000000000000000000000000000006';
const PAGE_TOKEN_ADDRESS = '0xc4730f86d1F86cE0712a7b17EE919Db7dEFad7FE';
const UNISWAP_V2_ROUTER = '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD';
const UNISWAP_V2_PAIR = '0x...'; // Need the PAGE-ETH LP token address
const FARM_CONTRACT = '0x...'; // Need the farming contract address

// ABIs
const UNISWAP_V2_ROUTER_ABI = [
  {
    inputs: [
      { name: 'tokenA', type: 'address' },
      { name: 'tokenB', type: 'address' },
      { name: 'amountADesired', type: 'uint256' },
      { name: 'amountBDesired', type: 'uint256' },
      { name: 'amountAMin', type: 'uint256' },
      { name: 'amountBMin', type: 'uint256' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' },
    ],
    name: 'addLiquidity',
    outputs: [
      { name: 'amountA', type: 'uint256' },
      { name: 'amountB', type: 'uint256' },
      { name: 'liquidity', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  }
];

const LP_TOKEN_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getReserves',
    outputs: [
      { name: '_reserve0', type: 'uint112' },
      { name: '_reserve1', type: 'uint112' },
      { name: '_blockTimestampLast', type: 'uint32' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
];

const FARM_ABI = [
  {
    inputs: [],
    name: 'APR',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'userInfo',
    outputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'rewardDebt', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: '_amount', type: 'uint256' }],
    name: 'deposit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: '_amount', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

const FarmModal = ({ isOpen, onClose }) => {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');
  const [activeTab, setActiveTab] = useState('add'); // 'add' or 'remove'

  // Get farm APR
  const { data: aprData } = useContractRead({
    address: FARM_CONTRACT,
    abi: FARM_ABI,
    functionName: 'APR',
  });

  // Get user's staked amount
  const { data: userInfo } = useContractRead({
    address: FARM_CONTRACT,
    abi: FARM_ABI,
    functionName: 'userInfo',
    args: [address],
  });

  // Get pool reserves and total supply
  const { data: poolData } = useContractRead({
    address: UNISWAP_V2_PAIR,
    abi: LP_TOKEN_ABI,
    functionName: 'getReserves',
  });

  const { data: totalSupply } = useContractRead({
    address: UNISWAP_V2_PAIR,
    abi: LP_TOKEN_ABI,
    functionName: 'totalSupply',
  });

  // Contract writes
  const { write: addLiquidity, isLoading: isAddingLiquidity } = useContractWrite({
    address: UNISWAP_V2_ROUTER,
    abi: UNISWAP_V2_ROUTER_ABI,
    functionName: 'addLiquidity',
  });

  const { write: stake, isLoading: isStaking } = useContractWrite({
    address: FARM_CONTRACT,
    abi: FARM_ABI,
    functionName: 'deposit',
  });

  const { write: unstake, isLoading: isUnstaking } = useContractWrite({
    address: FARM_CONTRACT,
    abi: FARM_ABI,
    functionName: 'withdraw',
  });

  // Calculate TVL and other stats
  const tvl = poolData ? formatEther(poolData[0]) * 2 : 0; // Simplified TVL calc
  const apr = aprData ? Number(formatEther(aprData)) : 0;
  const userStaked = userInfo ? formatEther(userInfo[0]) : '0';

  const handleAction = async () => {
    if (!amount) return;

    try {
      if (activeTab === 'add') {
        // First add liquidity
        await addLiquidity?.({
          args: [
            PAGE_TOKEN_ADDRESS,
            WETH_ADDRESS,
            parseEther(amount),
            parseEther(amount),
            0,
            0,
            address,
            Math.floor(Date.now() / 1000) + 60 * 20,
          ],
          value: parseEther(amount),
        });

        // Then stake LP tokens
        await stake?.({
          args: [parseEther(amount)],
        });
      } else {
        // Unstake LP tokens
        await unstake?.({
          args: [parseEther(amount)],
        });
      }
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Farm $PAGE-ETH LP</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Pool Stats */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">APR</span>
            <span className="font-medium">{apr.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">TVL</span>
            <span className="font-medium">${tvl.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Your Staked LP</span>
            <span className="font-medium">{userStaked} LP</span>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            className={`flex-1 py-2 rounded-md ${
              activeTab === 'add' ? 'bg-white shadow' : ''
            }`}
            onClick={() => setActiveTab('add')}
          >
            Add Liquidity
          </button>
          <button
            className={`flex-1 py-2 rounded-md ${
              activeTab === 'remove' ? 'bg-white shadow' : ''
            }`}
            onClick={() => setActiveTab('remove')}
          >
            Remove Liquidity
          </button>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount ({activeTab === 'add' ? 'ETH' : 'LP'})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 border rounded-lg"
            step="0.01"
            min="0"
            max={activeTab === 'remove' ? userStaked : undefined}
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleAction}
          disabled={isAddingLiquidity || isStaking || isUnstaking}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg disabled:opacity-50"
        >
          {isAddingLiquidity || isStaking || isUnstaking
            ? 'Processing...'
            : activeTab === 'add'
            ? 'Add and Stake'
            : 'Unstake and Remove'}
        </button>
      </div>
    </div>
  );
};

export default FarmModal;