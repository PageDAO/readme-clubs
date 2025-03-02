// src/components/token/TokenDashboard.tsx
import React, { useState, useCallback } from 'react';
import BaseChainCard from './chains/BaseChainCard';
import EthereumChainCard from './chains/EthereumChainCard';
import { useAggregatedTokenData } from '../../hooks/useAggregatedTokenData';

/**
 * Enhanced token dashboard that includes aggregated data
 * from Base and Ethereum blockchains. This will be expanded further
 * to include additional chains as they are implemented.
 */
const TokenDashboard: React.FC = () => {
  // Use the aggregated data hook
  const {
    tvl,
    averagePrice,
    totalBalance,
    totalBalanceValue,
    isLoading,
    errors,
    lastUpdated,
    refreshAll,
    chains
  } = useAggregatedTokenData();
  
  // State to track which chains are visible
  const [visibleChains, setVisibleChains] = useState(chains.map(c => c.id));
  
  // Toggle chain visibility
  const toggleChain = useCallback((chainId: string) => {
    setVisibleChains(prev => {
      if (prev.includes(chainId)) {
        return prev.filter(id => id !== chainId);
      } else {
        return [...prev, chainId];
      }
    });
  }, []);
  
  // Format the last updated timestamp
  const formatDate = (date: Date | null) => {
    return date ? date.toLocaleString() : 'Never';
  };
  
  return (
    <div className="space-y-8">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">$PAGE Token Dashboard</h1>
        <p className="mb-6 text-gray-600">
          View $PAGE token data across different blockchains.
        </p>
        
        {/* Aggregate Data Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Aggregated $PAGE Data</h3>
            <button
              onClick={refreshAll}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Refreshing...' : 'Refresh All'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-gray-600">Average Price</p>
              <p className="text-2xl font-bold">
                ${averagePrice ? averagePrice.toFixed(6) : 'Loading...'}
              </p>
            </div>
            
            <div>
              <p className="text-gray-600">Total Value Locked</p>
              <p className="text-2xl font-bold">
                ${tvl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            
            <div>
              <p className="text-gray-600">Your Total Balance</p>
              <p className="text-2xl font-bold">
                {totalBalance.toFixed(2)} $PAGE
              </p>
              <p className="text-sm text-gray-500">
                ${totalBalanceValue.toFixed(2)} USD
              </p>
            </div>
            
            <div>
              <p className="text-gray-600">Tracked Chains</p>
              <p className="text-2xl font-bold">
                {visibleChains.length} of {chains.length}
              </p>
            </div>
          </div>
          
          {errors && errors.length > 0 && (
            <div className="mt-4 p-2 bg-red-50 text-red-600 rounded">
              <p className="font-bold">Errors:</p>
              <ul className="list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-4 text-sm text-gray-500">
            Last updated: {formatDate(lastUpdated)}
          </div>
        </div>
        
        {/* Chain Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="text-lg font-medium mb-3">Filter Chains</h3>
          <div className="flex flex-wrap gap-2">
            {chains.map(chain => (
              <button
                key={chain.id}
                onClick={() => toggleChain(chain.id)}
                className={`px-4 py-2 rounded-lg ${
                  visibleChains.includes(chain.id)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {chain.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Chain Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visibleChains.includes('base') && (
            <BaseChainCard />
          )}
          
          {visibleChains.includes('ethereum') && (
            <EthereumChainCard />
          )}
          
          {/* Future chains would go here */}
        </div>
        
        {/* Future Enhancement Note */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-blue-700">
          <h3 className="font-bold mb-2">Coming Soon</h3>
          <p>Support for Optimism, Polygon, and Cosmos chains will be added in future updates!</p>
        </div>
      </div>
    </div>
  );
};

export default TokenDashboard;