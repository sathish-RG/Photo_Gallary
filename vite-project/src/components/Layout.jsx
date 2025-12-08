import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiImage,
  FiGift,
  FiSettings,
  FiMenu,
  FiSearch,
  FiBell,
  FiLogOut,
  FiX,
  FiUser
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: FiHome },
    { name: 'Albums', href: '/gallery', icon: FiImage },
    { name: 'Portfolio', href: '/portfolio/editor', icon: FiUser },
    { name: 'Gift Cards', href: '/gift-cards', icon: FiGift },
    { name: 'Settings', href: '/settings', icon: FiSettings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full relative">
      {/* Collapse Toggle Button (Desktop Only) */}
      <button
        onClick={toggleSidebar}
        className="hidden lg:flex absolute -right-3 top-6 bg-white border border-slate-200 rounded-full p-1 shadow-sm text-slate-400 hover:text-primary transition-colors z-50"
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

      <div className={`p-6 transition-all duration-300 ${isCollapsed ? 'px-2 items-center' : ''}`}>
        {isCollapsed ? (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
            M
          </div>
        ) : (
          <h1 className="text-2xl font-bold text-primary whitespace-nowrap overflow-hidden">MediaSaaS</h1>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={clsx(
                'flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300',
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:bg-slate-50 hover:text-text-primary',
                isCollapsed && 'justify-center px-2'
              )}
              title={isCollapsed ? item.name : ''}
            >
              <item.icon className={clsx("h-5 w-5 transition-all duration-300", isCollapsed ? "mr-0" : "mr-3")} />
              {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        {!isCollapsed ? (
          <div className="bg-slate-50 rounded-xl p-4 mb-4 transition-all duration-300">
            <div className="flex justify-between text-xs font-medium text-text-secondary mb-2">
              <span>Storage Used</span>
              <span>75%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: '75%' }}
              />
            </div>
            <p className="text-xs text-text-secondary mt-2">7.5 GB of 10 GB used</p>
          </div>
        ) : (
          <div className="mb-4 flex justify-center" title="7.5 GB of 10 GB used">
            <div className="w-8 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="bg-primary h-full" style={{ width: '75%' }} />
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={clsx(
            "flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors",
            isCollapsed && "justify-center px-2"
          )}
          title={isCollapsed ? "Logout" : ""}
        >
          <FiLogOut className={clsx("h-5 w-5 transition-all duration-300", isCollapsed ? "mr-0" : "mr-3")} />
          {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 z-50 h-screen bg-white border-r border-slate-100 transition-all duration-300 ease-in-out',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isCollapsed ? 'w-[80px]' : 'w-[250px]'
        )}
      >
        <div className="lg:hidden absolute top-4 right-4">
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-text-secondary">
            <FiX size={24} />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div
        className={clsx(
          "min-h-screen flex flex-col transition-all duration-300 ease-in-out",
          isCollapsed ? "lg:pl-[80px]" : "lg:pl-[250px]"
        )}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 mr-2 text-text-secondary hover:text-text-primary"
            >
              <FiMenu size={24} />
            </button>
            <h2 className="text-xl font-semibold text-text-primary">
              {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-slate-50 rounded-xl px-4 py-2 w-64 border border-slate-100 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
              <FiSearch className="text-text-secondary mr-2" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none focus:outline-none text-sm w-full text-text-primary placeholder:text-text-secondary"
              />
            </div>

            <button className="p-2 text-text-secondary hover:text-primary transition-colors relative">
              <FiBell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:block text-sm font-medium text-text-primary">
                {user?.username || 'User'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
