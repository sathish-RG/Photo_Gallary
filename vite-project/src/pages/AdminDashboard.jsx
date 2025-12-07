// src/pages/AdminDashboard.jsx
import React from 'react';
import { FiUsers, FiImage, FiGift, FiActivity } from 'react-icons/fi';
import Card from '../components/ui/Card';

const AdminDashboard = () => {
  const stats = [
    { label: 'Total Users', value: '1,234', icon: FiUsers, color: 'bg-blue-500' },
    { label: 'Active Galleries', value: '856', icon: FiImage, color: 'bg-purple-500' },
    { label: 'Gift Cards Created', value: '3,421', icon: FiGift, color: 'bg-pink-500' },
    { label: 'System Status', value: 'Healthy', icon: FiActivity, color: 'bg-green-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Welcome to the Admin Panel</h2>
            <p className="text-slate-600">
              Use the sidebar to manage templates, generate batch QR codes, and configure system settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
