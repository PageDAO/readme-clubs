// src/pages/InterChainPage.tsx
import React from 'react';
import TokenDashboard from '../components/token/TokenDashboard';

const InterChainPage: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">InterChain $PAGE Dashboard</h1>
      <TokenDashboard />
    </div>
  );
};

export default InterChainPage;