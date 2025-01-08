import React from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { SwapWidget } from '@uniswap/widgets'; // Corrected import

const WETH_ADDRESS = '0x4200000000000000000000000000000000000006';
const PAGE_TOKEN_ADDRESS = '0xc4730f86d1F86cE0712a7b17EE919Db7dEFad7FE';

const TradeModal = ({ isOpen, onClose }) => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Trade $PAGE</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="uniswap-widget-container">
          <SwapWidget
            jsonRpcUrlMap={{
              8453: ['https://mainnet.base.org'],
            }}
            tokenList={[
              {
                address: PAGE_TOKEN_ADDRESS,
                name: 'Page',
                symbol: 'PAGE',
                decimals: 8,
                chainId: 8453,
                logoURI: 'https://example.com/page-logo.png',
              },
            ]}
            defaultInputToken={WETH_ADDRESS}
            defaultOutputToken={PAGE_TOKEN_ADDRESS}
            theme="light"
            width="100%"
          />
        </div>
      </div>
    </div>
  );
};

export default TradeModal;
