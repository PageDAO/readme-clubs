import React from 'react';
import { TokenDataProvider, useTokenData } from './TokenDataProvider';

// Explicit types to match what's in TokenDataProvider
interface ChainData {
  price: number | null;
  tvl: number | null;
  balance: number;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface PriceItem {
  price: number;
  tvl: number;
}

// Separate component that uses the context
const TokenDashboardContent: React.FC = () => {
  const { 
    ethPrice,
    chains,
    loading,
    error,
    lastUpdated,
    refreshAllData
  } = useTokenData();

  // Format currency with 2 decimal places
  const formatCurrency = (value: number | null) => {
    if (value === null) return 'Loading...';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format price with more decimal places
  const formatPrice = (value: number | null) => {
    if (value === null) return 'Loading...';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 6,
      maximumFractionDigits: 6
    }).format(value);
  };

  // Format the last updated timestamp
  const formatDate = (date: Date | null) => {
    return date ? date.toLocaleString() : 'Never';
  };

  // Calculate aggregate values
  const calculateAggregateValues = () => {
    const { base, ethereum, optimism } = chains;
    
    const tvl = (base.tvl || 0) + (ethereum.tvl || 0) + (optimism.tvl || 0);
    const totalBalance = base.balance + ethereum.balance + optimism.balance;
    
    // Calculate TVL-weighted average price with proper type checking
    const validPrices = [
      base.price && base.tvl ? { price: base.price, tvl: base.tvl } : null,
      ethereum.price && ethereum.tvl ? { price: ethereum.price, tvl: ethereum.tvl } : null,
      optimism.price && optimism.tvl ? { price: optimism.price, tvl: optimism.tvl } : null,
    ].filter((item): item is PriceItem => item !== null);
    
    const averagePrice = validPrices.length > 0
      ? validPrices.reduce((sum, item) => sum + (item.price * item.tvl), 0) / 
        validPrices.reduce((sum, item) => sum + item.tvl, 0)
      : null;
    
    const totalBalanceValue = totalBalance * (averagePrice || 0);
    
    return { tvl, totalBalance, averagePrice, totalBalanceValue };
  };
  
  const { tvl, totalBalance, averagePrice, totalBalanceValue } = calculateAggregateValues();

  if (loading && !ethPrice) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
              onClick={refreshAllData}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh All'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-gray-600">Average Price</p>
              <p className="text-2xl font-bold">
                {formatPrice(averagePrice)}
              </p>
            </div>
            
            <div>
              <p className="text-gray-600">Total Value Locked</p>
              <p className="text-2xl font-bold">
                {formatCurrency(tvl)}
              </p>
            </div>
            
            <div>
              <p className="text-gray-600">Your Total Balance</p>
              <p className="text-2xl font-bold">
                {totalBalance.toFixed(2)} $PAGE
              </p>
              <p className="text-sm text-gray-500">
                {formatCurrency(totalBalanceValue)} USD
              </p>
            </div>
            
            <div>
              <p className="text-gray-600">ETH Price</p>
              <p className="text-2xl font-bold">
                {formatCurrency(ethPrice)}
              </p>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
              Error: {error}
            </div>
          )}
          
          <div className="mt-4 text-sm text-gray-500">
            Last updated: {formatDate(lastUpdated)}
          </div>
        </div>
        
        {/* Chain Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Object.entries(chains).map(([chainId, data]) => (
            <ChainCard 
              key={chainId}
              chainId={chainId as keyof typeof chains}
              data={data}
            />
          ))}
        </div>
        
        {/* Future Enhancement Note */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-blue-700">
          <h3 className="font-bold mb-2">Coming Soon</h3>
          <p>Support for Cosmos chains will be added in future updates!</p>
        </div>
      </div>
    </div>
  );
};
// Define chain names outside the component
const chainNames = {
    base: 'Base',
    ethereum: 'Ethereum',
    optimism: 'Optimism'
  } as const;
// Chain card component
const ChainCard: React.FC<{
    chainId: keyof typeof chainNames;
    data: ChainData;
  }> = ({ chainId, data }) => {
    const chainNames = {
      base: 'Base',
      ethereum: 'Ethereum',
      optimism: 'Optimism'
    } as const;
    
    const chainName = chainNames[chainId];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">{chainName}</h3>
        {data.loading && (
          <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
        )}
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-gray-600">Price</p>
          <p className="text-xl font-bold">
            {data.price !== null 
              ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 6,
                  maximumFractionDigits: 6
                }).format(data.price)
              : 'Loading...'}
          </p>
        </div>
        
        <div>
          <p className="text-gray-600">TVL</p>
          <p className="text-xl font-bold">
            {data.tvl !== null 
              ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(data.tvl)
              : 'Loading...'}
          </p>
        </div>
        
        <div>
          <p className="text-gray-600">Your Balance</p>
          <p className="text-xl font-bold">
            {data.balance.toFixed(2)} $PAGE
          </p>
        </div>
      </div>
      
      {data.error && (
        <div className="mt-3 p-2 bg-red-100 text-red-600 rounded text-sm">
          {data.error}
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        Last updated: {data.lastUpdated ? data.lastUpdated.toLocaleString() : 'Never'}
      </div>
    </div>
  );
};

// Wrap the content with the provider
const TokenDashboard: React.FC = () => (
  <TokenDataProvider>
    <TokenDashboardContent />
  </TokenDataProvider>
);

export default TokenDashboard;
