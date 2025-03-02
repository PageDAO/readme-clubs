// src/components/token/TokenDetailCard.tsx
import React from 'react';
import { TokenPrice } from '../../hooks/useTokenPrices';
import { COSMOS_PAGE_TOKEN } from '../../hooks/useMultichainToken';

// Import types directly from the config file
import type { TokenConfig, CosmosTokenConfig } from '../../config/tokenConfig';

interface TokenDetailCardProps {
  chainType: 'evm' | 'cosmos';
  chainName: string;
  currentPrice?: TokenPrice;
  osmosisTokenData: { price: number, tvl?: number } | null;
  isLoadingOsmosisData: boolean;
  lastUpdated: Date | null;
  onRefresh: () => void;
  onTrade: () => void;
  // Use the imported types but with partial to make it more flexible
  currentToken: Partial<TokenConfig> | Partial<CosmosTokenConfig>;
}

const TokenDetailCard: React.FC<TokenDetailCardProps> = (props) => {
  // Format timestamps safely
  const formatDate = (date: Date | null) => {
    return date ? date.toLocaleString() : 'Never';
  };

  // Get DEX URL safely
  const getDexUrl = () => {
    if ('dexUrl' in props.currentToken && props.currentToken.dexUrl) {
      return props.currentToken.dexUrl;
    }
    return '#';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">{props.chainName} Details</h3>
        <button
          onClick={props.onRefresh}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
        >
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-gray-600">Price</p>
          <p className="text-2xl font-bold">
            {props.chainType === 'cosmos' && props.osmosisTokenData?.price 
              ? `$${props.osmosisTokenData.price.toFixed(6)}`
              : props.currentPrice?.usdPrice 
                ? `$${props.currentPrice.usdPrice.toFixed(6)}`
                : 'No data'}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Liquidity</p>
          <p className="text-2xl font-bold">
            {props.chainType === 'cosmos' && props.osmosisTokenData?.tvl 
              ? `$${props.osmosisTokenData.tvl.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
              : props.currentPrice?.tvl 
                ? `$${props.currentPrice.tvl.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                : 'No data'}
          </p>
        </div>
      </div>
      
      <div className="mt-6">
        <button
          onClick={props.onTrade}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mr-4"
        >
          Trade $PAGE
        </button>
        
        <a
          href={getDexUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 inline-block"
        >
          View on DEX
        </a>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        Last updated: {props.chainType === 'cosmos' 
          ? formatDate(props.lastUpdated)
          : formatDate(props.currentPrice?.lastUpdated || null)
        }
      </div>
    </div>

  );
};

export default TokenDetailCard;