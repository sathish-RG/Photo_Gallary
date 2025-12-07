import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FiSettings, FiSave, FiLayout } from 'react-icons/fi';
import Button from '../components/ui/Button';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    sidebarColor: '#1f2937',
    navbarColor: '#ffffff',
    fontFamily: 'Inter, sans-serif',
    showSidebar: true
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/config', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.data) {
        setConfig(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/admin/config', config, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Settings saved successfully! Refresh to see changes.');
      // Optional: Trigger a global state update or reload
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Dashboard Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Settings Form */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 flex items-center gap-2">
              <FiSettings className="w-5 h-5 text-slate-500" />
              Theme Customization
            </h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Sidebar Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.sidebarColor}
                  onChange={(e) => setConfig({ ...config, sidebarColor: e.target.value })}
                  className="h-10 w-10 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={config.sidebarColor}
                  onChange={(e) => setConfig({ ...config, sidebarColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Navbar Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.navbarColor}
                  onChange={(e) => setConfig({ ...config, navbarColor: e.target.value })}
                  className="h-10 w-10 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={config.navbarColor}
                  onChange={(e) => setConfig({ ...config, navbarColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Font Family</label>
              <select
                value={config.fontFamily}
                onChange={(e) => setConfig({ ...config, fontFamily: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="Inter, sans-serif">Inter (Default)</option>
                <option value="'Roboto', sans-serif">Roboto</option>
                <option value="'Open Sans', sans-serif">Open Sans</option>
                <option value="monospace">Monospace</option>
              </select>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSave}
                isLoading={saving}
                className="w-full py-3"
                icon={FiSave}
              >
                Save Changes
              </Button>
            </div>
          </div>

          {/* Live Preview */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <FiLayout className="w-5 h-5 text-slate-500" />
              Live Preview
            </h2>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-lg bg-slate-100 h-[400px] flex" style={{ fontFamily: config.fontFamily }}>
              {/* Preview Sidebar */}
              <div className="w-1/4 h-full p-4 text-white flex flex-col gap-4" style={{ backgroundColor: config.sidebarColor }}>
                <div className="h-6 w-3/4 bg-white/20 rounded"></div>
                <div className="h-4 w-full bg-white/10 rounded mt-4"></div>
                <div className="h-4 w-full bg-white/10 rounded"></div>
                <div className="h-4 w-full bg-white/10 rounded"></div>
              </div>

              {/* Preview Main Content */}
              <div className="flex-1 flex flex-col">
                {/* Preview Navbar */}
                <div className="h-14 border-b border-slate-200 flex items-center justify-end px-4 gap-2" style={{ backgroundColor: config.navbarColor }}>
                  <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
                </div>
                {/* Preview Content */}
                <div className="p-6">
                  <div className="h-32 bg-white rounded-lg shadow-sm border border-slate-200"></div>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-500 text-center">
              This is a miniature preview of how your dashboard will look.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
