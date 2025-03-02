// src/components/token/TokenSummaryCard.tsx
import React from 'react'

interface TokenSummaryCardProps {
  aggregatePrice: number | null
  totalTVL: number
  balance: number
}

const TokenSummaryCard: React.FC<TokenSummaryCardProps> = ({ 
  aggregatePrice, 
  totalTVL, 
  balance 
}) => {
  return (
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
  )
}

export default TokenSummaryCard