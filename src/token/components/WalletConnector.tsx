import React from 'react';

interface WalletConnectorProps {
  isKeplrConnected: boolean;
  connectKeplr: () => Promise<string | null>;
  keplrAddress?: string | null;
}

export const WalletConnector: React.FC<WalletConnectorProps> = ({
  isKeplrConnected,
  connectKeplr,
  keplrAddress
}) => {
  const handleConnectKeplr = async () => {
    try {
      await connectKeplr();
    } catch (error) {
      console.error('Error connecting to Keplr:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-bold mb-4">Connect Wallet</h3>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleConnectKeplr}
          disabled={isKeplrConnected}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {isKeplrConnected ? 'Keplr Connected' : 'Connect Keplr'}
        </button>
        
        {isKeplrConnected && keplrAddress && (
          <div className="flex items-center text-sm text-gray-500">
            <span className="truncate max-w-xs">{keplrAddress}</span>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        Connect your wallet to view your $PAGE balance across supported chains.
      </div>
    </div>
  );
};
