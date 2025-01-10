import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Define the navigation items
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/browse', label: 'Browse Books' },
    { path: '/profile', label: 'Profile' },
    { path: '/forum', label: 'Forum' },
    { path: '/page-token', label: 'Page Token' },
    { path: '/mint', label: 'Mint a Book' }, // Add the new Mint route
    { path: '/about', label: 'About' },
  ];

  return (
    <div className={`w-64 p-4 bg-white shadow-md ${isCollapsed ? 'hidden' : 'block'}`}>
      <h2 className="text-xl font-bold mb-4">Navigation</h2>
      {navItems.map((item) => (
        <button
          key={item.path}
          className={`w-full text-left p-2 mb-2 rounded transition-colors ${
            location.pathname === item.path
              ? 'bg-blue-700 text-white'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          onClick={() => navigate(item.path)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default Sidebar;