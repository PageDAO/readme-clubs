import '@rainbow-me/rainbowkit/styles.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OrbisProvider } from './contexts/OrbisContext';
import { ForumProvider } from './contexts/ForumContext';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { mainnet, base, sepolia } from 'viem/chains';
import { http } from 'viem';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  walletConnectWallet,
  coinbaseWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { WagmiProvider } from 'wagmi';

// Import your components
import HomePage from './pages/HomePage';
import BrowseBooksPage from './pages/BrowseBooksPage';
import ProfilePage from './pages/ProfilePage';
import ForumPage from './pages/ForumPage';
import DetailPage from './pages/DetailPage';
import Layout from './components/layout/Layout';
import AboutPage from './pages/AboutPage';
import TokenPage from './pages/TokenPage';
import BookList from './features/books/BookList';
import MintPage from './pages/MintPage'; // Import the new MintPage

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        metaMaskWallet,
        walletConnectWallet,
        coinbaseWallet,
      ],
    },
  ],
  {
    projectId: '5e709b61d319ac0c7d59daa4240e3daf',
    appName: 'Readme Clubs',
  }
);

const config = getDefaultConfig({
  appName: 'Readme Clubs',
  projectId: '5e709b61d319ac0c7d59daa4240e3daf',
  chains: [base, sepolia, mainnet],
  ssr: true,
  transports: {
    [base.id]: http(),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
});

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider>
        <QueryClientProvider client={queryClient}>
          <OrbisProvider>
            <ForumProvider>
              <BrowserRouter>
                <Layout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/browse" element={<BrowseBooksPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/forum" element={<ForumPage />} />
                    <Route path="/books/:bookId/forum" element={<ForumPage />} />
                    <Route path="/books/:bookId/forum/:postId" element={<ForumPage />} />
                    <Route path="/forum/:postId" element={<ForumPage />} />
                    <Route path="/books" element={<BookList />} />
                    <Route path="/book/:bookId" element={<DetailPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/page-token" element={<TokenPage />} />
                    <Route path="/mint" element={<MintPage />} /> {/* Add the MintPage route */}
                  </Routes>
                </Layout>
              </BrowserRouter>
            </ForumProvider>
          </OrbisProvider>
        </QueryClientProvider>
      </RainbowKitProvider>
    </WagmiProvider>
  );
}

export default App;