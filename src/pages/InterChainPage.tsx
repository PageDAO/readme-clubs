// src/pages/InterChainPage.tsx
import React from 'react';
import TokenDashboard from '../components/token/TokenDashboard';

/**
 * Page component for the InterChain $PAGE data
 * Displays the multi-chain token dashboard with Base and Ethereum data
 */
const InterChainPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <TokenDashboard />
    </div>
  );
};

export default InterChainPage;