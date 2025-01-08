import React, { useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useChainId } from 'wagmi'

interface TopBarProps {
  onToggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }): JSX.Element => {
  const { isConnected, address } = useAccount()
  const chainId = useChainId()

  useEffect(() => {
    console.log('Connection state:', { isConnected, address, chainId })
  }, [isConnected, address, chainId])

  return (
    <div className="flex justify-between items-center p-4 bg-white shadow-md">
      <button onClick={onToggleSidebar} className="text-2xl">☰</button>
      <div className="flex items-center gap-4">
        <ConnectButton 
          chainStatus="icon"
          showBalance={false}
        />
      </div>
    </div>
  )
}
export default TopBar