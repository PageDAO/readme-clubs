import React from 'react';

interface UniswapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UniswapModal: React.FC<UniswapModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const uniswapURL = `https://app.uniswap.org/swap?chain=base&outputCurrency=0xc4730f86d1f86ce0712a7b17ee919db7defad7fe`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Trade $PAGE</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        <iframe
          src={uniswapURL}
          width="100%"
          height="100%"
          style={{ border: 'none', borderRadius: '8px' }}
          title="Uniswap Widget"
        />
      </div>
    </div>
  );
};

export default UniswapModal; // Default export