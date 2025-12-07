// src/components/AdminLayout.jsx
import React from 'react';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children }) => {
  const [config, setConfig] = React.useState({
    sidebarColor: '#ffffff',
    navbarColor: '#ffffff',
    fontFamily: 'Inter, sans-serif',
    showSidebar: true
  });

  React.useEffect(() => {
    const fetchConfig = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/admin/config', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.data) {
          setConfig(data.data);
        }
      } catch (error) {
        console.error('Failed to load admin config', error);
      }
    };
    fetchConfig();
  }, []);

  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex min-h-screen bg-slate-50" style={{ fontFamily: config.fontFamily }}>
      {config.showSidebar && (
        <AdminSidebar
          backgroundColor={config.sidebarColor}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleSidebar}
        />
      )}
      <main className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
