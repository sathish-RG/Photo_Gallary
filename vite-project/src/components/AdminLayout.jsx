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
        // Simple fetch to avoid axios import if not needed, or use axios
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

  return (
    <div className="flex min-h-screen bg-gray-100" style={{ fontFamily: config.fontFamily }}>
      {config.showSidebar && <AdminSidebar backgroundColor={config.sidebarColor} />}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Dynamic Navbar Area if needed, or just content */}
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
