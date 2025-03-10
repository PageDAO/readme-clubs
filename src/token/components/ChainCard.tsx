import React from 'react';
import { ChainData } from '../types';
import { formatCurrency, formatTokenBalance, formatDate } from '../utils/formatting';

interface ChainCardProps {
  chainData: ChainData;
  onRefresh?: () => Promise<void>;
}

export const ChainCard: React.FC<ChainCardProps> = ({ chainData, onRefresh }) => {
  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    } else if (chainData.refresh) {
      await chainData.refresh();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">{chainData.name}</h3>
        {chainData.isLoading ? (
          <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
        ) : (
          <button 
            onClick={handleRefresh}
            className="text-blue-500 hover:text-blue-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-gray-600">Price</p>
          <p className="text-xl font-bold">
            {formatCurrency(chainData.price, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}
          </p>
        </div>
        
        <div>
          <p className="text-gray-600">TVL</p>
          <p className="text-xl font-bold">
            {formatCurrency(chainData.tvl)}
          </p>
        </div>
        
        <div>
          <p className="text-gray-600">Your Balance</p>
          <p className="text-xl font-bold">
            {formatTokenBalance(chainData.balance, 'PAGE')}
          </p>
          {chainData.price && (
            <p className="text-sm text-gray-500">
              {formatCurrency(chainData.balance * chainData.price)}
            </p>
          )}
        </div>
      </div>
      
      {chainData.error && (
        <div className="mt-3 p-2 bg-red-100 text-red-600 rounded text-sm">
          {chainData.error}
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        Last updated: {formatDate(chainData.lastUpdated)}
      </div>
    </div>
  );
};
