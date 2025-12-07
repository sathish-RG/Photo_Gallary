import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiX, FiInfo, FiCheck } from 'react-icons/fi';
import Button from './ui/Button';

const PhotographerSettings = ({ isOpen, onClose, folderId, currentSettings, onUpdate }) => {
  const [settings, setSettings] = useState({
    watermarkSettings: {
      enabled: false,
      text: 'COPYRIGHT',
      opacity: 50,
      position: 'center',
      fontSize: 80,
    },
    allowDownload: false,
    allowClientSelection: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentSettings) {
      setSettings(prev => ({
        ...prev,
        ...currentSettings,
        watermarkSettings: {
          ...prev.watermarkSettings,
          ...(currentSettings.watermarkSettings || {})
        },
        allowClientSelection: currentSettings.allowClientSelection !== undefined
          ? currentSettings.allowClientSelection
          : prev.allowClientSelection
      }));
    }
  }, [currentSettings]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:5000/api/folders/${folderId}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Settings updated successfully!');
        onUpdate(data.data);
        onClose();
      } else {
        toast.error(data.error || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const positionOptions = [
    { value: 'center', label: 'Center' },
    { value: 'north', label: 'Top' },
    { value: 'south', label: 'Bottom' },
    { value: 'east', label: 'Right' },
    { value: 'west', label: 'Left' },
    { value: 'north_east', label: 'Top Right' },
    { value: 'north_west', label: 'Top Left' },
    { value: 'south_east', label: 'Bottom Right' },
    { value: 'south_west', label: 'Bottom Left' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-100 p-6 rounded-t-2xl flex items-center justify-between z-10">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Photographer Settings</h2>
              <p className="text-slate-500 text-sm mt-1">Configure album security and features</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-2 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Watermark Toggle */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">Enable Watermark</h3>
                  <p className="text-sm text-slate-500">Protect your images with a watermark overlay</p>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    watermarkSettings: {
                      ...settings.watermarkSettings,
                      enabled: !settings.watermarkSettings.enabled
                    }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.watermarkSettings.enabled ? 'bg-primary' : 'bg-slate-300'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.watermarkSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
            </div>

            {/* Watermark Settings (only show if enabled) */}
            {settings.watermarkSettings.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                {/* Watermark Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Watermark Text
                  </label>
                  <input
                    type="text"
                    value={settings.watermarkSettings.text}
                    onChange={(e) => setSettings({
                      ...settings,
                      watermarkSettings: {
                        ...settings.watermarkSettings,
                        text: e.target.value
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Enter watermark text"
                  />
                </div>

                {/* Opacity Slider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opacity: {settings.watermarkSettings.opacity}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.watermarkSettings.opacity}
                    onChange={(e) => setSettings({
                      ...settings,
                      watermarkSettings: {
                        ...settings.watermarkSettings,
                        opacity: parseInt(e.target.value)
                      }
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                </div>

                {/* Position Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  <select
                    value={settings.watermarkSettings.position}
                    onChange={(e) => setSettings({
                      ...settings,
                      watermarkSettings: {
                        ...settings.watermarkSettings,
                        position: e.target.value
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    {positionOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Font Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Size: {settings.watermarkSettings.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="40"
                    max="200"
                    step="10"
                    value={settings.watermarkSettings.fontSize}
                    onChange={(e) => setSettings({
                      ...settings,
                      watermarkSettings: {
                        ...settings.watermarkSettings,
                        fontSize: parseInt(e.target.value)
                      }
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                </div>
              </motion.div>
            )}

            {/* Allow Download Toggle */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">Allow Downloads</h3>
                  <p className="text-sm text-slate-500">Enable clean image downloads (e.g., after payment)</p>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    allowDownload: !settings.allowDownload
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.allowDownload ? 'bg-green-500' : 'bg-slate-300'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.allowDownload ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
            </div>

            {/* Allow Client Selection Toggle */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">Allow Client Selections</h3>
                  <p className="text-sm text-slate-500">Enable clients to select favorite photos and send them to you</p>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    allowClientSelection: !settings.allowClientSelection
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.allowClientSelection ? 'bg-primary' : 'bg-slate-300'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.allowClientSelection ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
            </div>

            {/* Preview Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900">How it works</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    When watermark is enabled, all images in this album will display with the watermark overlay.
                    Clean images are only accessible when "Allow Downloads" is enabled.
                    Client selections allow viewers to pick favorites and send them to you.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white px-6 py-4 rounded-b-2xl border-t border-slate-100 flex justify-end gap-3 z-10">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={loading}>
              Save Settings
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PhotographerSettings;
