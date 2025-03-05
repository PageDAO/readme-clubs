// src/components/token/IBCTokenDetailCard.tsx
import React from 'react';
import { useIBCToken } from '../../providers/IBCTokenProvider';
import { useIBCPage } from '../../hooks/token/useIBCPage';

interface IBCTokenDetailCardProps {
  chainId: string;
  showStakingDetails?: boolean;
}

const IBCTokenDetailCard: React.FC<IBCTokenDetailCardProps> = ({
  chainId,
  showStakingDetails = true
}) => {
  const { chains, isKeplrConnected, connectKeplr } = useIBCToken();
  const chainData = chains[chainId];
  
  const { osmosis, userPositions, loading: pageDataLoading } = useIBCPage();
  
  // Get pool data for this specific chain
  const poolData = chainData.staking.poolId 
    ? osmosis.pools.find(p => p.id === chainData.staking.poolId) 
    : null;
  
  // Get user position in this pool
  const userPosition = userPositions?.osmosis.lpPositions.find(
    pos => pos.poolId === chainData.staking.poolId
  );
  
  if (!chainData) {
    return <div>Chain not supported</div>;
  }
  
  // Handle connect button click
  const handleConnect = () => {
    connectKeplr();
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <img 
              src="/images/osmosis-logo.svg" 
              alt={chainData.name} 
              className="w-8 h-8 mr-2" 
            />
            <h3 className="text-xl font-bold">{chainData.name}</h3>
          </div>
          {chainData.loading && (
            <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-purple-500 rounded-full"></div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-gray-600 mb-1">$PAGE Price</p>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold">
                {chainData.price !== null 
                  ? `$${chainData.price.toFixed(6)}`
                  : 'Loading...'}
              </p>
              {osmosis.tokenInfo.priceChange24h !== 0 && (
                <span className={`ml-2 text-sm ${osmosis.tokenInfo.priceChange24h > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {osmosis.tokenInfo.priceChange24h > 0 ? '+' : ''}{osmosis.tokenInfo.priceChange24h.toFixed(2)}%
                </span>
              )}
            </div>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Market Cap</p>
            <p className="text-2xl font-bold">
              ${osmosis.tokenInfo.marketCap.toLocaleString()}
            </p>
          </div>
        </div>
        
        {/* More token stats */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-gray-600 mb-1">24h Volume</p>
            <p className="text-xl font-bold">
              ${osmosis.tokenInfo.volume24h.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">TVL</p>
            <p className="text-xl font-bold">
              ${chainData.tvl?.toLocaleString() ?? 'Loading...'}
            </p>
          </div>
        </div>
        
        {/* User's balance */}
        {isKeplrConnected ? (
          <div className="p-4 bg-blue-50 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-800 font-medium">Your $PAGE Balance</p>
                <p className="text-2xl font-bold text-blue-900">
                  {chainData.balance.toFixed(2)} $PAGE
                </p>
                <p className="text-sm text-blue-700">
                  ≈ ${chainData.price ? (chainData.balance * chainData.price).toFixed(2) : '0.00'} USD
                </p>
              </div>
              <a 
                href="https://app.osmosis.zone/assets"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Transfer
              </a>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg mb-6">
            <p className="text-gray-600 mb-2">
              Connect your Keplr wallet to see your $PAGE balance.
            </p>
            <button
              onClick={handleConnect}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Connect Keplr Wallet
            </button>
          </div>
        )}
        
        {/* Staking Info */}
        {showStakingDetails && isKeplrConnected && (
          <div className={`p-4 rounded-lg mb-6 ${chainData.staking.isStaking ? 'bg-green-50' : 'bg-gray-50'}`}>
            <h4 className={`font-bold ${chainData.staking.isStaking ? 'text-green-800' : 'text-gray-800'} mb-2`}>
              {chainData.staking.isStaking ? 'Your Staking Position' : 'Not Currently Staking'}
            </h4>
            
            {chainData.staking.isStaking ? (
              <div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-green-700 text-sm">Staked Amount</p>
                    <p className="text-xl font-bold">{chainData.staking.stakedAmount.toFixed(2)} $PAGE</p>
                    {userPosition && (
                      <p className="text-sm text-green-700">
                        Value: ${userPosition.valueUsd.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-green-700 text-sm">Current APR</p>
                    <p className="text-xl font-bold">{poolData?.apr.toFixed(2) || 'N/A'}%</p>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-green-700 text-sm">Rewards Earned</p>
                  <p className="text-xl font-bold">{chainData.staking.rewards.toFixed(4)} $PAGE</p>
                </div>
                <div className="flex space-x-2">
                  <a 
                    href={`https://app.osmosis.zone/pool/${chainData.staking.poolId}`}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Manage Staking
                  </a>
                  <a 
                    href="https://app.osmosis.zone/assets"
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="px-4 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200"
                  >
                    Claim Rewards
                  </a>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-3">
                  Stake your $PAGE tokens to earn rewards and gain access to exclusive content.
                </p>
                <div className="mb-3">
                  <p className="text-gray-700 text-sm">Current Pool APR</p>
                  <p className="text-xl font-bold">{poolData?.apr.toFixed(2) || 'N/A'}%</p>
                </div>
                <a 
                  href={`https://app.osmosis.zone/pool/${chainData.staking.poolId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Start Staking
                </a>
              </div>
            )}
          </div>
        )}
        
        {/* DAO stats */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-bold text-gray-800 mb-3">Page DAO Stats</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Token Holders</p>
              <p className="text-lg font-bold">{pageDataLoading ? 'Loading...' : useIBCPage().dao.tokenHolders.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Proposals</p>
              <p className="text-lg font-bold">{pageDataLoading ? 'Loading...' : useIBCPage().dao.proposalCount}</p>
            </div>
            {userPositions && (
              <>
                <div>
                  <p className="text-gray-600 text-sm">Your Voting Power</p>
                  <p className="text-lg font-bold">{userPositions.governance.votingPower.toFixed(2)} PAGE</p>
                  <p className="text-xs text-gray-500">{userPositions.governance.votingPowerPercentage.toFixed(2)}% of total</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Your Proposals</p>
                  <p className="text-lg font-bold">Created: {userPositions.governance.proposals.created}</p>
                  <p className="text-xs text-gray-500">Voted: {userPositions.governance.proposals.voted}</p>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-4">
          <a 
            href="https://app.osmosis.zone/assets/PAGE"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-purple-600 text-white rounded text-center hover:bg-purple-700"
          >
            Trade on Osmosis
          </a>
          <a 
            href="https://www.mintscan.io/osmosis/assets/PAGE"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded text-center hover:bg-gray-200"
          >
            View Explorer
          </a>
        </div>
        
        {chainData.error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            Error: {chainData.error}
          </div>
        )}
        
        {chainData.lastUpdated && (
          <p className="mt-4 text-xs text-gray-500">
            Last updated: {chainData.lastUpdated.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default IBCTokenDetailCard;