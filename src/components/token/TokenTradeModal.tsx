// src/components/token/TokenTradeModal.tsx
import React from 'react'

interface TokenTradeModalProps {
  isOpen: boolean
  onClose: () => void
  chainName: string
  dexUrl: string
}

const TokenTradeModal: React.FC<TokenTradeModalProps> = ({
  isOpen,
  onClose,
  chainName,
  dexUrl
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Trade $PAGE on {chainName}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            &times;
          </button>
        </div>
        
        {/* Iframe based on selected chain */}
        <iframe
          src={dexUrl}
          className="w-full h-96 rounded-lg"
          title="Trade PAGE Token"
        />
      </div>
    </div>
  )
}

export default TokenTradeModal