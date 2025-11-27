// src/components/AdminSidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard Overview' },
  { to: '/admin/users', label: 'User Management' },
  { to: '/admin/templates/create', label: 'Create Template' },
  { to: '/admin/reported', label: 'Reported Content' },
];

const AdminSidebar = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block px-4 py-2 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
