import React from 'react';
import { TokenDataProvider, useTokenData } from './TokenDataProvider';
import { useIBCToken } from '../../providers/IBCTokenProvider';

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
  
  // Add IBC token data
  const {
    chains: ibcChains,
    isKeplrConnected,
    connectKeplr,
    refreshAllData: refreshIBCData
  } = useIBCToken();

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

  // Calculate aggregate values including Osmosis data
  const calculateAggregateValues = () => {
    const { base, ethereum, optimism } = chains;
    const osmosis = ibcChains['osmosis-1'];
    
    // Calculate total TVL across all chains
    const tvl = (base.tvl || 0) + (ethereum.tvl || 0) + (optimism.tvl || 0) + (osmosis?.tvl || 0);
    
    // Calculate total balance across all chains
    const totalBalance = base.balance + ethereum.balance + optimism.balance + (osmosis?.balance || 0);
    
    // Calculate TVL-weighted average price with proper type checking
    const validPrices = [
      base.price && base.tvl ? { price: base.price, tvl: base.tvl } : null,
      ethereum.price && ethereum.tvl ? { price: ethereum.price, tvl: ethereum.tvl } : null,
      optimism.price && optimism.tvl ? { price: optimism.price, tvl: optimism.tvl } : null,
      osmosis?.price && osmosis?.tvl ? { price: osmosis.price, tvl: osmosis.tvl } : null,
    ].filter((item): item is PriceItem => item !== null);
    
    const averagePrice = validPrices.length > 0
      ? validPrices.reduce((sum, item) => sum + (item.price * item.tvl), 0) / 
        validPrices.reduce((sum, item) => sum + item.tvl, 0)
      : null;
    
    const totalBalanceValue = totalBalance * (averagePrice || 0);
    
    // Calculate market cap using total supply
    const totalSupply = 100000000; // 100M PAGE tokens
    const marketCap = averagePrice ? totalSupply * averagePrice : null;
    
    return { tvl, totalBalance, averagePrice, totalBalanceValue, marketCap };
  };
  
  const { tvl, totalBalance, averagePrice, totalBalanceValue, marketCap } = calculateAggregateValues();

  // Function to refresh all data
  const refreshAllChainData = () => {
    refreshAllData(); // Refresh EVM chains
    refreshIBCData(); // Refresh IBC chains
  };

  if (loading && !ethPrice && Object.values(ibcChains).some(chain => chain.loading)) {
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
              onClick={refreshAllChainData}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh All'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
              <p className="text-gray-600">Market Cap</p>
              <p className="text-2xl font-bold">
                {formatCurrency(marketCap)}
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
        {/* EVM Chain Cards */}
        <h3 className="text-xl font-bold mb-4">EVM Chains</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {Object.entries(chains).map(([chainId, data]) => (
            <EVMChainCard 
              key={chainId}
              chainId={chainId as keyof typeof chains}
              data={data}
            />
          ))}
        </div>
        
        {/* Cosmos Chain Cards */}
        <h3 className="text-xl font-bold mb-4">Cosmos Chains</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Object.entries(ibcChains).map(([chainId, data]) => (
            <CosmosChainCard 
              key={chainId}
              chainId={chainId}
              data={data}
              isKeplrConnected={isKeplrConnected}
              connectKeplr={connectKeplr}
            />
          ))}
        </div>
        
        {/* Supply Breakdown */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Token Supply</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-gray-600">Total Supply</p>
              <p className="text-2xl font-bold">100,000,000 $PAGE</p>
            </div>
            <div>
              <p className="text-gray-600">Circulating Supply</p>
              <p className="text-2xl font-bold">42,500,000 $PAGE</p>
            </div>
          </div>
        </div>

        {/* If there's a note about future enhancements, keep it */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-blue-700">
          <h3 className="font-bold mb-2">Coming Soon</h3>
          <p>Support for more Cosmos chains will be added in future updates!</p>
        </div>
      </div>
    </div>
  );
};

// Define chain names outside the component
const evmChainNames = {
  base: 'Base',
  ethereum: 'Ethereum',
  optimism: 'Optimism'
} as const;

// EVM Chain card component
const EVMChainCard: React.FC<{
  chainId: keyof typeof evmChainNames;
  data: ChainData;
}> = ({ chainId, data }) => {
  const chainName = evmChainNames[chainId];
  
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

// Cosmos Chain card component
const CosmosChainCard: React.FC<{
  chainId: string;
  data: any; // Using 'any' for now, but should match the IBCToken chain data structure
  isKeplrConnected: boolean;
  connectKeplr: () => Promise<string | null>;
}> = ({ chainId, data, isKeplrConnected, connectKeplr }) => {
  // Get correct chain name
  const getChainName = (id: string) => {
    const chainNames: Record<string, string> = {
      'osmosis-1': 'Osmosis',
    };
    return chainNames[id] || id;
  };
  
  const chainName = getChainName(chainId);
  
  // Format currency for display
  const formatCurrency = (value: number | null) => {
    if (value === null) return 'Loading...';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">{chainName}</h3>
        {data.loading && (
          <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-purple-500 rounded-full"></div>
        )}
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-gray-600">Price</p>
          <div className="text-xl font-bold">
            {formatPrice(data.price)}
          </div>
        </div>
        <div>
          <p className="text-gray-600">TVL</p>
          <div className="text-xl font-bold">
            {formatCurrency(data.tvl)}
          </div>
        </div>
        
        <div>
          <p className="text-gray-600">Your Balance</p>
          <div className="text-xl font-bold">
            {data.balance.toFixed(2)} $PAGE
          </div>
          {data.price && (
            <p className="text-sm text-gray-500">
              {formatCurrency(data.balance * data.price)}
            </p>
          )}
        </div>
        
        {/* Add pool data if available */}
        {data.poolData && (
          <div>
            <p className="text-gray-600">Pool Info</p>
            <p className="text-sm">
              Pool #{data.poolData.poolId}
            </p>
          </div>
        )}
      </div>
      
      {/* Keplr connection button */}
      {!isKeplrConnected && (
        <div className="mt-4 p-3 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-700 mb-2">
            Connect Keplr wallet to view your balance
          </p>
          <button
            onClick={connectKeplr}
            className="w-full px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
          >
            Connect Keplr
          </button>
        </div>
      )}
      
      {/* Link to Osmosis for trading */}
      <div className="mt-4">
        <a 
          href={`https://app.osmosis.zone/assets/PAGE`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md hover:from-purple-600 hover:to-blue-600 text-center"
        >
          Trade on Osmosis
        </a>
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
