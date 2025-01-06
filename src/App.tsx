import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from './pages/HomePage';
import BrowseBooksPage from './pages/BrowseBooksPage';
import ProfilePage from './pages/ProfilePage';
import ForumPage from './pages/ForumPage';
import DetailPage from './pages/DetailPage';
import Layout from './components/layout/Layout';
import AboutPage from './pages/AboutPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowseBooksPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/forum" element={<ForumPage />} />
            <Route path="/book/:bookId" element={<DetailPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;