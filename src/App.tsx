// src/App.tsx
import '@rainbow-me/rainbowkit/styles.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OrbisProvider } from './contexts/OrbisContext'
import { ForumProvider } from './contexts/ForumContext'
import { IBCTokenProvider } from './providers/IBCTokenProvider'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { mainnet, optimism, base } from 'viem/chains'
import { http } from 'viem'

// Import your components
import InterChainPage from './pages/InterChainPage';

import HomePage from './pages/HomePage'
import BrowseBooksPage from './pages/BrowseBooksPage'
import ProfilePage from './pages/ProfilePage'
import ForumPage from './pages/ForumPage'
import DetailPage from './pages/DetailPage'
import Layout from './components/layout/Layout'
import AboutPage from './pages/AboutPage'
import TokenPage from './pages/TokenPage'
import BookList from './features/books/BookList'

const config = getDefaultConfig({
  appName: 'Readme Clubs',
  projectId: '5e709b61d319ac0c7d59daa4240e3daf',
  chains: [mainnet, optimism, base], 
  ssr: true,
  transports: {
    '1': http(),
    '10': http(), // Add Optimism transport
    '8453': http() // Add Base transport
  }
})

const queryClient = new QueryClient()

function App() {
  return (
    <RainbowKitProvider modalSize="compact">
      <QueryClientProvider client={queryClient}>
        <OrbisProvider>
          <ForumProvider>
            <IBCTokenProvider> {/* Add the IBCTokenProvider here */}
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
                    <Route path="/interchain" element={<InterChainPage />} />
                  </Routes>
                </Layout>
              </BrowserRouter>
            </IBCTokenProvider>
          </ForumProvider>
        </OrbisProvider>
      </QueryClientProvider>
    </RainbowKitProvider>
  )
}

export default App