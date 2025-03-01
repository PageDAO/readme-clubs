// src/components/token/TokenDashboard.tsx
import React, { useEffect } from 'react'
import { useMultichainToken, COSMOS_PAGE_TOKEN, PAGE_TOKENS } from '../../hooks/useMultichainToken'
import { useTokenPrices, TokenPrice } from '../../hooks/useTokenPrices'

const TokenDashboard: React.FC = () => {
  const { 
    currentToken, 
    chainType,
    balance, 
    availableChains, 
    selectedChainId, 
    selectChain,
    selectCosmosChain,
    osmosisTokenData,
    refreshOsmosisData,
    isLoadingOsmosisData,
    lastUpdated
  } = useMultichainToken()
  
  const { 
    prices, 
    aggregatePrice, 
    totalTVL,
    refreshChainPrice,
    refreshAllPrices,
    isRefreshing
  } = useTokenPrices()
  
  const [isTradeModalOpen, setTradeModalOpen] = React.useState(false)

  // Find price for currently selected chain with type safety
  const currentPrice: TokenPrice | undefined = selectedChainId 
    ? prices.find(p => p.chainId === selectedChainId)
    : prices.find(p => p.chainId === COSMOS_PAGE_TOKEN.chainId)

  // Initial data load
  useEffect(() => {
    if (prices.every(p => p.usdPrice === null)) {
      refreshAllPrices()
    }
  }, [refreshAllPrices, prices])

  // Format timestamps safely
  const formatDate = (date: Date | null) => {
    return date ? date.toLocaleString() : 'Never'
  }

  // Helper to find chain name safely
  const getChainName = (chainId: number | string | undefined) => {
    if (!chainId) return 'Unknown'
    
    if (chainId === 'osmosis-1') return 'Osmosis'
    
    const chain = availableChains.find(c => c.id === chainId)
    return chain ? chain.name : 'Unknown'
  }

  return (
    <div className="space-y-8">
      {/* Refresh Bar */}
      <div className="flex justify-between items-center bg-white rounded-lg shadow-md p-4">
        <div>
          <h2 className="text-xl font-bold">$PAGE Token Dashboard</h2>
          <p className="text-sm text-gray-500">
            {prices.some(p => p.lastUpdated) 
              ? `Last updated: ${formatDate(
                  new Date(Math.max(...prices
                    .filter(p => p.lastUpdated !== null)
                    .map(p => (p.lastUpdated as Date).getTime())
                  ))
                )}`
              : 'No data loaded yet'}
          </p>
        </div>
        <button
          onClick={() => refreshAllPrices()}
          disabled={isRefreshing}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh All Data'}
        </button>
      </div>

      {/* Aggregate Token Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">$PAGE Token Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-gray-600">Average Price</p>
            <p className="text-3xl font-bold">
              ${aggregatePrice !== null ? aggregatePrice.toFixed(6) : 'Loading...'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Total Value Locked</p>
            <p className="text-3xl font-bold">
              ${totalTVL > 0 ? totalTVL.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 'Loading...'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Your Balance</p>
            <p className="text-3xl font-bold">
              {balance.toFixed(2)} $PAGE
            </p>
          </div>
        </div>
      </div>

      {/* Chain Selector */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Select Chain</h3>
        <div className="flex flex-wrap gap-2">
          {availableChains.map(chain => (
            <button
              key={typeof chain.id === 'string' ? chain.id : chain.id.toString()}
              onClick={() => {
                if (chain.type === 'evm' && typeof chain.id === 'number') {
                  selectChain(chain.id)
                } else {
                  selectCosmosChain()
                }
              }}
              className={`px-4 py-2 rounded-lg ${
                (selectedChainId === chain.id && chainType === 'evm') || 
                (chain.id === 'osmosis-1' && chainType === 'cosmos')
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {chain.name}
            </button>
          ))}
        </div>
      </div>

      {/* Current Chain Details */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">
            {getChainName(chainType === 'cosmos' ? 'osmosis-1' : selectedChainId)} Details
          </h3>
          <button
            onClick={() => {
              if (chainType === 'cosmos') {
                refreshOsmosisData()
              } else if (selectedChainId !== null && typeof selectedChainId === 'number') {
                refreshChainPrice(selectedChainId)
              }
            }}
            disabled={isLoadingOsmosisData || Boolean(currentPrice?.loading)}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm disabled:opacity-50"
          >
            {isLoadingOsmosisData || currentPrice?.loading 
              ? 'Refreshing...' 
              : 'Refresh'
            }
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600">Price</p>
            <p className="text-2xl font-bold">
              {chainType === 'cosmos' 
                ? (osmosisTokenData && 'price' in osmosisTokenData)
                  ? `$${osmosisTokenData.price.toFixed(6)}`
                  : isLoadingOsmosisData ? 'Loading...' : 'No data'
                : currentPrice?.loading
                  ? 'Loading...'
                  : currentPrice?.error
                    ? 'Error loading data'
                    : currentPrice?.usdPrice !== null
                      ? `$${currentPrice.usdPrice.toFixed(6)}`
                      : 'No data'
              }
            </p>
            {currentPrice?.error && (
              <p className="text-red-500 text-sm">{currentPrice.error}</p>
            )}
          </div>
          <div>
            <p className="text-gray-600">Liquidity</p>
            <p className="text-2xl font-bold">
              {chainType === 'cosmos' 
                ? (osmosisTokenData && 'tvl' in osmosisTokenData)
                  ? `$${osmosisTokenData.tvl.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                  : isLoadingOsmosisData ? 'Loading...' : 'No data'
                : currentPrice?.loading
                  ? 'Loading...'
                  : currentPrice?.error
                    ? 'Error loading data'
                    : currentPrice?.tvl !== null
                      ? `$${currentPrice.tvl.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                      : 'No data'
              }
            </p>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={() => setTradeModalOpen(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mr-4"
          >
            Trade $PAGE
          </button>
          
            href={chainType === 'cosmos' 
              ? COSMOS_PAGE_TOKEN.dexUrl 
              : currentToken.dexUrl
            }
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            View on DEX
          </a>
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          Last updated: {chainType === 'cosmos' 
            ? formatDate(lastUpdated)
            : formatDate(currentPrice?.lastUpdated || null)
          }
        </div>
      </div>

      {/* All Chains Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">All Chains</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chain</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TVL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {prices.map((price, index) => {
                const chainName = getChainName(price.chainId);
                const isSelected = (price.chainId === selectedChainId && chainType === 'evm') ||
                                  (price.chainId === 'osmosis-1' && chainType === 'cosmos');
                
                // Find the correct DEX URL
                let dexUrl = '';
                if (price.chainId === 'osmosis-1') {
                  dexUrl = COSMOS_PAGE_TOKEN.dexUrl;
                } else if (typeof price.chainId === 'number') {
                  const token = PAGE_TOKENS.find(t => t.chainId === price.chainId);
                  if (token) {
                    dexUrl = token.dexUrl;
                  }
                }
                
                return (
                  <tr key={index} className={isSelected ? 'bg-blue-50' : undefined}>
                    <td className="px-6 py-4 whitespace-nowrap">{chainName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {price.loading ? 'Loading...' : 
                       price.error ? 'Error' : 
                       price.usdPrice !== null ? `$${price.usdPrice.toFixed(6)}` : 'No data'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {price.loading ? 'Loading...' : 
                       price.error ? 'Error' : 
                       price.tvl !== null ? `$${price.tvl.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'No data'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => refreshChainPrice(price.chainId)}
                        disabled={price.loading}
                        className="text-blue-500 hover:text-blue-700 mr-4 disabled:opacity-50"
                      >
                        {price.loading ? 'Refreshing...' : 'Refresh'}
                      </button>
                      {dexUrl && (
                        
                          href={dexUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-500 hover:text-green-700"
                        >
                          Trade
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trade Modal */}
      {isTradeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Trade $PAGE on {getChainName(chainType === 'cosmos' ? 'osmosis-1' : selectedChainId)}
              </h2>
              <button 
                onClick={() => setTradeModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            
            {/* Iframe based on selected chain */}
            <iframe
              src={chainType === 'cosmos' 
                ? COSMOS_PAGE_TOKEN.dexUrl 
                : currentToken.dexUrl
              }
              className="w-full h-96 rounded-lg"
              title="Trade PAGE Token"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default TokenDashboard