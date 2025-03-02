// src/components/token/chains/OptimismChainCard.tsx
import React from 'react';
import { useOptimismChainData } from './OptimismChainData';

const OptimismChainCard: React.FC = () => {
  const {
    price,
    tvl,
    balance,
    loading,
    error,
    lastUpdated,
    refresh,
    ethUsdPrice
  } = useOptimismChainData();
  
  // Format the last updated timestamp
  const formatDate = (date: Date | null) => {
    return date ? date.toLocaleString() : 'Never';
  };
  
  // Format currency with commas for thousands
  const formatCurrency = (value: number | null) => {
    if (value === null) return 'Loading...';
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
  // Format PAGE token price with more decimal places
  const formatTokenPrice = (value: number | null) => {
    if (value === null) return 'Loading...';
    return value.toFixed(6);
  };

  if (loading && !price) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (error && !price) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Optimism Chain</h3>
        <div className="text-red-500 mb-4">
          {error}
        </div>
        <button
          onClick={() => refresh()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // Uniswap URL for the PAGE token on Optimism
  const uniswapUrl = `https://app.uniswap.org/swap?chain=optimism&outputCurrency=0xe67E77c47a37795c0ea40A038F7ab3d76492e803`;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Optimism Chain</h3>
        <button
          onClick={() => refresh()}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
        >
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* PAGE Price */}
        <div>
          <p className="text-gray-600">$PAGE Price</p>
          <p className="text-2xl font-bold">
            ${formatTokenPrice(price)}
          </p>
        </div>
        
        {/* TVL */}
        <div>
          <p className="text-gray-600">Total Value Locked</p>
          <p className="text-2xl font-bold">
            ${formatCurrency(tvl)}
          </p>
        </div>
        
        {/* ETH Price */}
        <div>
          <p className="text-gray-600">ETH Price</p>
          <p className="text-2xl font-bold">
            ${formatCurrency(ethUsdPrice)}
          </p>
        </div>
        
        {/* User Balance */}
        <div>
          <p className="text-gray-600">Your Balance</p>
          <p className="text-2xl font-bold">
            {balance.toFixed(2)} $PAGE
          </p>
          {price && (
            <p className="text-sm text-gray-500">
              ${(balance * price).toFixed(2)} USD
            </p>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <a
          href={uniswapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 inline-block"
        >
          Trade on Uniswap
        </a>
        
        <a
          href="https://optimistic.etherscan.io/token/0xe67E77c47a37795c0ea40A038F7ab3d76492e803"
          target="_blank"
          rel="noopener noreferrer" 
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 inline-block"
        >
          View on Optimism Explorer
        </a>
      </div>
      
      {/* Last Updated Info */}
      <div className="mt-4 text-sm text-gray-500">
        Last updated: {formatDate(lastUpdated)}
      </div>
    </div>
  );
};

export default OptimismChainCard;