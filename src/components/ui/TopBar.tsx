import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'

interface TopBarProps {
  onToggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }): JSX.Element => {
  return (
    <div className="flex justify-between items-center p-4 bg-white shadow-md">
      <button onClick={onToggleSidebar} className="text-2xl">☰</button>
      <div className="flex items-center gap-4">
        <ConnectButton 
          chainStatus="icon"
          showBalance={false}
          accountStatus="address"
        />
      </div>
    </div>
  )
}
export default TopBar