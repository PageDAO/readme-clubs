import React from 'react'
import { injected, coinbaseWallet, walletConnect } from 'wagmi/connectors'
import { useOrbis } from '../../contexts/OrbisContext'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

interface TopBarProps {
  onToggleSidebar: () => void
}

const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }) => {
  const { isConnected, address } = useAccount()
  const { connectAsync } = useConnect()
  const { disconnectAsync } = useDisconnect()
  const { isConnected: isOrbisConnected, connectOrbis } = useOrbis()

  React.useEffect(() => {
    if (isConnected && address) {
      connectOrbis()
    }
  }, [isConnected, address, connectOrbis])

  const handleConnect = async (connectorType: 'metamask' | 'walletconnect') => {
    try {
      const connector = connectorType === 'metamask' 
        ? injected()
        : walletConnect({
            projectId: '5e709b61d319ac0c7d59daa4240e3daf', // Get this from WalletConnect Dashboard
            showQrModal: true
          })
      
      await connectAsync({ connector })
    } catch (error) {
      console.error('Failed to connect:', error)
    }
  }

  return (
    <div className="flex justify-between items-center p-4 bg-white shadow-md">
      <button onClick={onToggleSidebar} className="text-2xl">☰</button>
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
              onClick={() => disconnectAsync()}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Disconnect
            </button>
          </>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => handleConnect('metamask')}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              MetaMask
            </button>
            <button
              onClick={() => handleConnect('walletconnect')}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              WalletConnect
            </button>
          </div>
        )}
        {isOrbisConnected && <span className="text-sm">Orbis Connected</span>}
      </div>
    </div>
  )
}

export default TopBar