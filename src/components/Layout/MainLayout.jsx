import React, { useState } from 'react';
import Topbar from '../Topbar.jsx';
import Sidebar from '../Sidebar.jsx';

const MainLayout = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        setActiveView={setActiveView}
      />
      
      {/* Main content */}
      <div className="lg:pl-64">
        <Topbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeView={activeView}
          setActiveView={setActiveView}
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="px-6 py-6">
          {React.cloneElement(children, { 
            searchQuery, 
            activeView,
            setActiveView 
          })}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
