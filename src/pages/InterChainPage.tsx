import React from 'react';
import TokenDashboard from '../components/token/TokenDashboard';
import { IBCTokenDetailCard } from '../components/token/IBCTokenDetailCard';
import { OSMOSIS_CHAIN_ID } from '../constants/ibc';

/**
 * Page component for the InterChain $PAGE data
 * Displays the multi-chain token dashboard with Base and Ethereum data
 * Now also includes Cosmos/IBC data
 */
const InterChainPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <TokenDashboard />
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">$PAGE on Cosmos</h2>
        <p className="mb-6 text-gray-600">
          The $PAGE token is also available on Cosmos chains via IBC (Inter-Blockchain Communication).
        </p>
        <IBCTokenDetailCard chainId={OSMOSIS_CHAIN_ID} />
      </div>
    </div>
  );
};

export default InterChainPage;
