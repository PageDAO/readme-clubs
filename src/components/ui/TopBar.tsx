import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useOrbis } from '../../contexts/OrbisContext';

interface TopBarProps {
  onToggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }) => {
  const { isConnected, address } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { isConnected: isOrbisConnected, connectOrbis } = useOrbis();

  React.useEffect(() => {
    if (isConnected && address) {
      connectOrbis();
    }
  }, [isConnected, address, connectOrbis]);

  const handleConnect = async () => {
    try {
      if (connectors.length > 0) {
        await connectAsync({ connector: connectors[0] });
      }
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectAsync();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  return (
    <div className="flex justify-between items-center p-4 bg-white shadow-md">
      <button onClick={onToggleSidebar} className="text-2xl">
        ☰
      </button>
      <input
        type="text"
        placeholder="Search books..."
        className="px-4 py-2 border rounded"
      />
      <div className="flex items-center gap-4">
        {isConnected ? (
          <>
            <span className="text-sm">Connected: {address}</span>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={handleConnect}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Connect Wallet
          </button>
        )}
        {isOrbisConnected && <span className="text-sm">Orbis Connected</span>}
      </div>
    </div>
  );
};

export default TopBar;