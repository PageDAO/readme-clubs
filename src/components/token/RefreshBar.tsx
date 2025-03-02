// src/components/token/RefreshBar.tsx
import React from 'react'
import { TokenPrice } from '../../hooks/useTokenPrices'

interface RefreshBarProps {
  prices: TokenPrice[]
  isRefreshing: boolean
  onRefresh: () => void
  title?: string
}

const RefreshBar: React.FC<RefreshBarProps> = ({ 
  prices, 
  isRefreshing, 
  onRefresh,
  title = "$PAGE Token Dashboard"
}) => {
  // Format timestamps safely
  const formatDate = (date: Date | null) => {
    return date ? date.toLocaleString() : 'Never'
  }

  // Get the most recent update timestamp
  const getLastUpdateTimestamp = () => {
    const timestamps = prices
      .filter(p => p.lastUpdated !== null)
      .map(p => (p.lastUpdated as Date).getTime())
    
    return timestamps.length > 0 
      ? new Date(Math.max(...timestamps))
      : null
  }

  return (
    <div className="flex justify-between items-center bg-white rounded-lg shadow-md p-4">
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm text-gray-500">
          {prices.some(p => p.lastUpdated) 
            ? `Last updated: ${formatDate(getLastUpdateTimestamp())}`
            : 'No data loaded yet'}
        </p>
      </div>
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {isRefreshing ? 'Refreshing...' : 'Refresh All Data'}
      </button>
    </div>
  )
}

export default RefreshBar