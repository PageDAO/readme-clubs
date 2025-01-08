import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Web3Provider } from './providers/Web3Provider'
import { OrbisProvider } from './contexts/OrbisContext'
import { ForumProvider } from './contexts/ForumContext'
import HomePage from './pages/HomePage'
import BrowseBooksPage from './pages/BrowseBooksPage'
import ProfilePage from './pages/ProfilePage'
import ForumPage from './pages/ForumPage'
import DetailPage from './pages/DetailPage'
import Layout from './components/layout/Layout'
import AboutPage from './pages/AboutPage'
import TokenPage from './pages/TokenPage'
import BookList from './features/books/BookList'

const queryClient = new QueryClient()

function App() {
  return (
    <Web3Provider>
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
                </Routes>
              </Layout>
            </BrowserRouter>
          </ForumProvider>
        </OrbisProvider>
      </QueryClientProvider>
    </Web3Provider>
  )
}

export default App
