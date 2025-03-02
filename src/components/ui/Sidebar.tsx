import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className={`w-64 p-4 bg-white shadow-md ${isCollapsed ? 'hidden' : 'block'}`}>
      <h2 className="text-xl font-bold mb-4">Navigation</h2>
      <button
        className={`w-full text-left p-2 mb-2 rounded ${
          location.pathname === '/' ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white'
        }`}
        onClick={() => navigate('/')}
      >
        Home
      </button>
      <button
        className={`w-full text-left p-2 mb-2 rounded ${
          location.pathname === '/interchain' ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white'
        }`}
        onClick={() => navigate('/interchain')}
      >
        InterChain $PAGE
      </button>
      <button
        className={`w-full text-left p-2 mb-2 rounded ${
          location.pathname === '/browse' ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white'
        }`}
        onClick={() => navigate('/browse')}
      >
        Browse Books
      </button>
      <button
        className={`w-full text-left p-2 mb-2 rounded ${
          location.pathname === '/profile' ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white'
        }`}
        onClick={() => navigate('/profile')}
      >
        Profile
      </button>
      <button
        className={`w-full text-left p-2 mb-2 rounded ${
          location.pathname === '/forum' ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white'
        }`}
        onClick={() => navigate('/forum')}
      >
        Forum
      </button>
      <button
        className={`w-full text-left p-2 mb-2 rounded ${
          location.pathname === '/page-token' ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white'
        }`}
        onClick={() => navigate('/page-token')}
      >
        Page Token
      </button>
      <button
        className={`w-full text-left p-2 mb-2 rounded ${
          location.pathname === '/about' ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white'
        }`}
        onClick={() => navigate('/about')}
      >
        About
      </button>
    </div>
  );
};

export default Sidebar;