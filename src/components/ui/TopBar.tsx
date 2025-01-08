import React from 'react'
import { useOrbis } from '../../contexts/OrbisContext'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

interface TopBarProps {
  onToggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }): JSX.Element => {
  const { isConnected, address } = useAccount();
  const { isConnected: isOrbisConnected, connectOrbis } = useOrbis();

  React.useEffect(() => {
    if (isConnected && address) {
      connectOrbis();
    }
  }, [isConnected, address, connectOrbis]);

  return (
    <div className="flex justify-between items-center p-4 bg-white shadow-md">
      <button onClick={onToggleSidebar} className="text-2xl">☰</button>
      <input
        type="text"
        placeholder="Search books..."
        className="px-4 py-2 border rounded"
      />
      <div className="flex items-center gap-4">
        <ConnectButton />
        {isOrbisConnected && <span className="text-sm">Orbis Connected</span>}
      </div>
    </div>
  );
};

export default TopBar;
