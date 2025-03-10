import React from 'react';
import { formatCurrency, formatTokenBalance, formatDate } from '../utils/formatting';

interface TokenSummaryProps {
  weightedPrice: number | null;
  totalTVL: number | null;
  totalBalance: number;
  marketCap: number | null;
  lastUpdated: Date | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
}

export const TokenSummary: React.FC<TokenSummaryProps> = ({
  weightedPrice,
  totalTVL,
  totalBalance,
  marketCap,
  lastUpdated,
  isLoading,
  error,
  onRefresh
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">$PAGE Token Summary</h3>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Refreshing...' : 'Refresh All'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <p className="text-gray-600">Current Price</p>
          <p className="text-2xl font-bold">
            {formatCurrency(weightedPrice, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}
          </p>
        </div>
        
        <div>
          <p className="text-gray-600">Total Value Locked</p>
          <p className="text-2xl font-bold">
            {formatCurrency(totalTVL)}
          </p>
        </div>
        
        <div>
          <p className="text-gray-600">Your Total Balance</p>
          <p className="text-2xl font-bold">
            {formatTokenBalance(totalBalance, 'PAGE')}
          </p>
          <p className="text-sm text-gray-500">
            {formatCurrency(totalBalance * (weightedPrice || 0))}
          </p>
        </div>
        
        <div>
          <p className="text-gray-600">Market Cap</p>
          <p className="text-2xl font-bold">
            {formatCurrency(marketCap)}
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
  );
};
