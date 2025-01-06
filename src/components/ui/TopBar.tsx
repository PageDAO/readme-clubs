import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

interface TopBarProps {
  onToggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }) => {
  const { isConnected } = useAccount();

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
        <ConnectButton />
        {isConnected && <span className="text-sm">Connected</span>}
      </div>
    </div>
  );
};

export default TopBar;