import React from 'react';
import { TokenProvider, useToken } from '../contexts';
import { ChainCard, TokenSummary, WalletConnector } from '../components';

const InterChainTokenContent: React.FC = () => {
  const {
    chains,
    weightedPrice,
    totalTVL,
    totalBalance,
    marketCap,
    lastUpdated,
    isLoading,
    error,
    refreshAll,
    connectKeplr,
    isKeplrConnected
  } = useToken();

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">$PAGE Token Dashboard</h1>
      
      <WalletConnector
        isKeplrConnected={isKeplrConnected}
        connectKeplr={connectKeplr}
        keplrAddress={chains['osmosis-1']?.balanceData?.address || null}
      />
      
      <TokenSummary
        weightedPrice={weightedPrice}
        totalTVL={totalTVL}
        totalBalance={totalBalance}
        marketCap={marketCap}
        lastUpdated={lastUpdated}
        isLoading={isLoading}
        error={error}
        onRefresh={refreshAll}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(chains).map((chainData) => (
          <ChainCard 
            key={chainData.chainId}
            chainData={chainData}
            onRefresh={refreshAll}
          />
        ))}
      </div>
      
      {/* Coming soon section for EVM chains */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg text-blue-700">
        <h3 className="font-bold mb-2">Coming Soon</h3>
        <p>Support for Ethereum, Base, and Optimism chains will be added in the next update.</p>
      </div>
    </div>
  );
};

// Wrap the content with the provider
const InterChainTokenPage: React.FC = () => (
  <TokenProvider>
    <InterChainTokenContent />
  </TokenProvider>
);

export default InterChainTokenPage;
