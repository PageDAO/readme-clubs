// src/components/token/ChainSelector.tsx
import React from 'react'

interface Chain {
  id: number | string
  type: 'evm' | 'cosmos'
  name: string
}

interface ChainSelectorProps {
  availableChains: Chain[]
  selectedChainId: number | null
  chainType: 'evm' | 'cosmos'
  onSelectChain: (chainId: number) => void
  onSelectCosmosChain: () => void
}

const ChainSelector: React.FC<ChainSelectorProps> = ({
  availableChains,
  selectedChainId,
  chainType,
  onSelectChain,
  onSelectCosmosChain
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">Select Chain</h3>
      <div className="flex flex-wrap gap-2">
        {availableChains.map(chain => (
          <button
            key={typeof chain.id === 'string' ? chain.id : chain.id.toString()}
            onClick={() => {
              if (chain.type === 'evm' && typeof chain.id === 'number') {
                onSelectChain(chain.id)
              } else {
                onSelectCosmosChain()
              }
            }}
            className={`px-4 py-2 rounded-lg ${
              (selectedChainId === chain.id && chainType === 'evm') || 
              (chain.id === 'osmosis-1' && chainType === 'cosmos')
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {chain.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ChainSelector