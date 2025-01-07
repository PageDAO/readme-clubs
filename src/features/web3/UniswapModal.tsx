import React from 'react';

interface UniswapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UniswapModal: React.FC<UniswapModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const uniswapURL = `https://app.uniswap.org/#/swap?outputCurrency=0xc4730f86d1f86ce0712a7b17ee919db7defad7fe&chain=base`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl h-[80vh] flex flex-col relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Trade $PAGE</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="flex-1">
          <iframe
            src={uniswapURL}
            className="w-full h-full rounded-lg"
            style={{ border: 'none' }}
            title="Uniswap Interface"
          />
        </div>
      </div>
    </div>
  );
};

export default UniswapModal;