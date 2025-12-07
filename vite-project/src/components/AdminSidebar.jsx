import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiGrid, FiUsers, FiLayout, FiPackage, FiFlag, FiSettings, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = ({ backgroundColor = '#ffffff', isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const isActive = (path) => location.pathname === path;

  // Determine text color based on background brightness (simple check)
  const isDark = backgroundColor.startsWith('#') && parseInt(backgroundColor.replace('#', ''), 16) < 0xffffff / 2;
  const textColor = isDark ? 'text-white' : 'text-slate-600';
  const hoverColor = isDark ? 'hover:bg-white/10 hover:text-white' : 'hover:bg-slate-50 hover:text-primary';

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: FiGrid },
    { path: '/admin/users', label: 'Users', icon: FiUsers },
    { path: '/admin/templates', label: 'Templates', icon: FiLayout },
    { path: '/admin/batch-generator', label: 'Batch QR', icon: FiPackage },
    { path: '/admin/reported', label: 'Reports', icon: FiFlag },
    { path: '/admin/settings', label: 'Settings', icon: FiSettings },
  ];

  return (
    <div
      className={`border-r border-slate-200 min-h-screen flex flex-col transition-all duration-300 relative ${isCollapsed ? 'w-20' : 'w-64'}`}
      style={{ backgroundColor }}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-6 bg-white border border-slate-200 rounded-full p-1 shadow-sm text-slate-400 hover:text-primary transition-colors z-50"
      >
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className={`p-6 border-b border-slate-100/10 transition-all duration-300 ${isCollapsed ? 'px-2 flex justify-center' : ''}`}>
        {isCollapsed ? (
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-hover rounded-lg flex items-center justify-center text-white font-bold text-lg">
            A
          </div>
        ) : (
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent whitespace-nowrap overflow-hidden">
            Admin Panel
          </h2>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const active = isActive(item.path) ||
            (item.path === '/admin/templates' && (location.pathname.includes('/admin/templates/create') || location.pathname.includes('/admin/templates/edit')));

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${active
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : `${textColor} ${hoverColor}`
                } ${isCollapsed ? 'justify-center px-2' : 'gap-3'}`}
              title={isCollapsed ? item.label : ''}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium whitespace-nowrap overflow-hidden">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100/10">
        <button
          onClick={logout}
          className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-300 ${textColor} hover:bg-red-50 hover:text-red-600 ${isCollapsed ? 'justify-center px-2' : 'gap-3'}`}
          title={isCollapsed ? "Logout" : ""}
        >
          <FiLogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium whitespace-nowrap overflow-hidden">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
