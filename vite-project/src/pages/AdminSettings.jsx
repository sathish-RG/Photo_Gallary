import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

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

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Settings Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <h2 className="text-xl font-semibold mb-4">Theme Customization</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sidebar Color</label>
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Navbar Color</label>
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
              <select
                value={config.fontFamily}
                onChange={(e) => setConfig({ ...config, fontFamily: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="Inter, sans-serif">Inter (Default)</option>
                <option value="'Roboto', sans-serif">Roboto</option>
                <option value="'Open Sans', sans-serif">Open Sans</option>
                <option value="monospace">Monospace</option>
              </select>
            </div>

            <div className="pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-pink-600 text-white py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Live Preview */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Live Preview</h2>
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg bg-gray-100 h-[400px] flex" style={{ fontFamily: config.fontFamily }}>
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
                <div className="h-14 border-b border-gray-200 flex items-center justify-end px-4 gap-2" style={{ backgroundColor: config.navbarColor }}>
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                </div>
                {/* Preview Content */}
                <div className="p-6">
                  <div className="h-32 bg-white rounded-lg shadow-sm border border-gray-200"></div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center">
              This is a miniature preview of how your dashboard will look.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
