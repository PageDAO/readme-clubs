import React from 'react';
import { useAccount, useBalance } from 'wagmi';

const HomePage: React.FC = () => {
  const { address } = useAccount();

  // Fetch user's ETH balance
  const { data: ethBalance } = useBalance({
    address,
  });

  // Fetch user's $PAGE balance (mock data for now)
  const pageBalance = 120; // Replace with actual $PAGE balance fetch logic

  // Mock $PAGE token price
  const pagePrice = 0.05; // Replace with actual $PAGE price fetch logic

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to Readme Clubs</h1>

      {/* Balances Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Your Balances</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-600">ETH Balance</p>
            <p className="text-2xl font-bold">
              {ethBalance ? `${parseFloat(ethBalance.formatted).toFixed(4)} ETH` : 'Loading...'}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-600">$PAGE Balance</p>
            <p className="text-2xl font-bold">{pageBalance} $PAGE</p>
          </div>
        </div>
      </div>

      {/* $PAGE Price Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">$PAGE Token Price</h2>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-2xl font-bold">${pagePrice}</p>
        </div>
      </div>

      {/* Liquidity Pool Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">Liquidity Pool</h2>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-600">Provide liquidity and earn rewards.</p>
          <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
            Go to Liquidity Pool
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;