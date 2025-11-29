import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

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
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings);
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
          <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-rose-500 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Photographer Settings</h2>
                <p className="text-pink-100 text-sm mt-1">Protect your work with watermarks</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Watermark Toggle */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Enable Watermark</h3>
                  <p className="text-sm text-gray-600">Protect your images with a watermark overlay</p>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    watermarkSettings: {
                      ...settings.watermarkSettings,
                      enabled: !settings.watermarkSettings.enabled
                    }
                  })}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.watermarkSettings.enabled ? 'bg-pink-500' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.watermarkSettings.enabled ? 'translate-x-7' : 'translate-x-1'
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
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Allow Downloads</h3>
                  <p className="text-sm text-gray-600">Enable clean image downloads (e.g., after payment)</p>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    allowDownload: !settings.allowDownload
                  })}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.allowDownload ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.allowDownload ? 'translate-x-7' : 'translate-x-1'
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
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-medium hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PhotographerSettings;
