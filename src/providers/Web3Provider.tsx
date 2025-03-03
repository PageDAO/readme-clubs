import { createConfig, http, WagmiProvider } from 'wagmi';
import { mainnet, base, optimism } from 'wagmi/chains';
import { walletConnect } from '@wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Create a WAGMI config with WalletConnect
export const wagmiConfig = createConfig({
  chains: [mainnet, base, optimism],
  connectors: [
    walletConnect({
      projectId: '5e709b61d319ac0c7d59daa4240e3daf', 
      showQrModal: true, // Show WalletConnect QR modal
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [optimism.id]: http(),
  },
});

// Create a QueryClient for React Query
const queryClient = new QueryClient();

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};