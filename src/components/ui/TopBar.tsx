import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useOrbis } from '../../contexts/OrbisContext'

interface TopBarProps {
  onToggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }): JSX.Element => {
  const { isConnected, address } = useAccount()
  const { connectOrbis } = useOrbis()

  React.useEffect(() => {
    if (isConnected && address) {
      connectOrbis()
    }
  }, [isConnected, address, connectOrbis])

  return (
    <div className="flex justify-between items-center p-4 bg-white shadow-md">
      <button onClick={onToggleSidebar} className="text-2xl">☰</button>
      <div className="flex items-center gap-4">
        <ConnectButton 
          chainStatus="icon"
          showBalance={true}
          accountStatus={{
            smallScreen: 'avatar',
            largeScreen: 'full',
          }}
        />
      </div>
    </div>
  )
}

export default TopBar