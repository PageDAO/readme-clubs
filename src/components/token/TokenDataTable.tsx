// src/components/token/TokenDataTable.tsx
import React from 'react';
import { TokenPrice } from '../../hooks/useTokenPrices';

interface TokenDataTableProps {
  prices: TokenPrice[];
  selectedChainId: number | null;
  chainType: 'evm' | 'cosmos';
  onRefreshChain: (chainId: number | string) => void;
}

const TokenDataTable: React.FC<TokenDataTableProps> = (props) => {
  return (
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
            {props.prices.map((price, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">{String(price.chainId)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {price.usdPrice !== null ? `$${price.usdPrice.toFixed(6)}` : 'No data'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {price.tvl !== null ? `$${price.tvl.toLocaleString()}` : 'No data'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    onClick={() => props.onRefreshChain(price.chainId)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Refresh
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TokenDataTable;