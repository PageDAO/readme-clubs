import React from 'react';
import TopBar from '../ui/TopBar';
import Sidebar from '../ui/Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(true);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <TopBar onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <div className="flex flex-1">
        <Sidebar isCollapsed={isSidebarCollapsed} />
        <div className="flex-1 p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;