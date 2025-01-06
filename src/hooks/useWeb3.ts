import { useState } from 'react';

const useWeb3 = () => {
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = () => {
    setIsConnected(true);
  };

  const disconnectWallet = () => {
    setIsConnected(false);
  };

  return { isConnected, connectWallet, disconnectWallet };
};

export default useWeb3;