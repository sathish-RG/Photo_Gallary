import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import TemplateCanvas from '../components/TemplateCanvas';
import { FiLayout, FiSettings, FiSave, FiX, FiImage, FiType, FiBox } from 'react-icons/fi';
import Button from '../components/ui/Button';

const AdminCreateTemplate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Template Data State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'birthday',
    thumbnailUrl: '',
  });

  // Visual Style State
  const [styleConfig, setStyleConfig] = useState({
    backgroundColor: '#ffffff',
    backgroundImageUrl: '',
    fontFamily: 'Inter',
    textColor: '#1f2937',
    animationType: 'fade-in',
    containerStyle: {
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      borderWidth: '0px',
      borderColor: '#e5e7eb',
    }
  });

  // Canvas Config
  const [canvasHeight, setCanvasHeight] = useState(600);

  // Layout Slots State
  const [layoutSlots, setLayoutSlots] = useState([]);
  const [activeTab, setActiveTab] = useState('basic');

  // Preset Styles
  const presets = {
    glass: {
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      containerStyle: {
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        borderWidth: '1px',
        borderColor: 'rgba(255, 255, 255, 0.5)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      }
    },
    solid: {
      backgroundColor: '#ffffff',
      containerStyle: {
        borderRadius: '12px',
        borderWidth: '0px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      }
    },
    bordered: {
      backgroundColor: '#ffffff',
      containerStyle: {
        borderRadius: '0px',
        borderWidth: '2px',
        borderColor: '#000000',
        boxShadow: 'none',
      }
    }
  };

  const handleApplyPreset = (presetName) => {
    const preset = presets[presetName];
    if (preset) {
      setStyleConfig(prev => ({
        ...prev,
        ...preset,
        containerStyle: { ...prev.containerStyle, ...preset.containerStyle }
      }));
    }
  };

  const { id } = useParams(); // Get ID from URL if editing
  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      fetchTemplateData();
    }
  }, [id]);

  const fetchTemplateData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/templates/${id}`);
      const template = res.data.data;

      setFormData({
        name: template.name,
        description: template.description,
        category: template.category,
        thumbnailUrl: template.thumbnailUrl,
      });

      if (template.styleConfig) {
        setStyleConfig(template.styleConfig);
      }

      if (template.layoutSlots) {
        setLayoutSlots(template.layoutSlots);
      }

      if (template.layoutConfig && template.layoutConfig.canvasHeight) {
        setCanvasHeight(template.layoutConfig.canvasHeight);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load template data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const payload = {
        ...formData,
        styleConfig,
        layoutConfig: {
          // Default layout config
          themeColor: styleConfig.textColor,
          showMessage: true,
          showTitle: true,
          canvasHeight: canvasHeight
        },
        layoutSlots
      };

      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/templates/${id}`, payload, config);
        toast.success('Template updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/templates', payload, config);
        toast.success('Template created successfully!');
      }

      navigate('/admin/templates');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-800">{isEditMode ? 'Edit Template' : 'Create New Template'}</h1>
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/templates')}
            icon={FiX}
          >
            Cancel
          </Button>
        </div>

        {/* Tabs Navigation */}
        <>
          <div className="mb-6 border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('basic')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'basic'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
              >
                <FiSettings className="w-4 h-4" />
                Basic Info & Style
              </button>
              <button
                onClick={() => setActiveTab('layout')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'layout'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
              >
                <FiLayout className="w-4 h-4" />
                Layout Designer ({layoutSlots.length} slots)
              </button>
            </nav>
          </div>

          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Form & Controls */}
              <div className="lg:col-span-5 space-y-6">

                {/* Basic Info Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
                    <FiSettings className="w-5 h-5 text-slate-500" />
                    Basic Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Template Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="e.g., Summer Vibes"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        rows="2"
                        placeholder="Brief description..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                          <option value="birthday">Birthday</option>
                          <option value="wedding">Wedding</option>
                          <option value="party">Party</option>
                          <option value="anniversary">Anniversary</option>
                          <option value="retro">Retro</option>
                          <option value="modern">Modern</option>
                          <option value="elegant">Elegant</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Thumbnail URL</label>
                        <input
                          type="text"
                          value={formData.thumbnailUrl}
                          onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Style Editor */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <FiImage className="w-5 h-5 text-slate-500" />
                      Visual Style
                    </h2>
                    <div className="flex gap-2">
                      <button onClick={() => handleApplyPreset('solid')} className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition-colors">Solid</button>
                      <button onClick={() => handleApplyPreset('glass')} className="px-2 py-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors">Glass</button>
                      <button onClick={() => handleApplyPreset('bordered')} className="px-2 py-1 text-xs bg-slate-800 text-white hover:bg-slate-700 rounded transition-colors">Bordered</button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Background</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={styleConfig.backgroundColor.startsWith('#') ? styleConfig.backgroundColor : '#ffffff'}
                            onChange={(e) => setStyleConfig({ ...styleConfig, backgroundColor: e.target.value })}
                            className="h-10 w-10 rounded cursor-pointer border-0"
                          />
                          <input
                            type="text"
                            value={styleConfig.backgroundColor}
                            onChange={(e) => setStyleConfig({ ...styleConfig, backgroundColor: e.target.value })}
                            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="#HEX or gradient"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Text Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={styleConfig.textColor}
                            onChange={(e) => setStyleConfig({ ...styleConfig, textColor: e.target.value })}
                            className="h-10 w-10 rounded cursor-pointer border-0"
                          />
                          <input
                            type="text"
                            value={styleConfig.textColor}
                            onChange={(e) => setStyleConfig({ ...styleConfig, textColor: e.target.value })}
                            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Typography & Animation */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                          <FiType className="w-3 h-3" /> Font Family
                        </label>
                        <select
                          value={styleConfig.fontFamily}
                          onChange={(e) => setStyleConfig({ ...styleConfig, fontFamily: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                          <option value="Inter">Inter (Sans)</option>
                          <option value="Playfair Display">Playfair (Serif)</option>
                          <option value="Montserrat">Montserrat (Modern)</option>
                          <option value="Courier Prime">Courier (Retro)</option>
                          <option value="Dancing Script">Dancing (Cursive)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Animation</label>
                        <select
                          value={styleConfig.animationType}
                          onChange={(e) => setStyleConfig({ ...styleConfig, animationType: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                          <option value="fade-in">Fade In</option>
                          <option value="slide-up">Slide Up</option>
                          <option value="zoom-in">Zoom In</option>
                          <option value="bounce">Bounce</option>
                          <option value="none">None</option>
                        </select>
                      </div>
                    </div>

                    {/* Container Style */}
                    <div className="space-y-3 border-t border-slate-100 pt-4">
                      <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                        <FiBox className="w-4 h-4" />
                        Container Properties
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Border Radius</label>
                          <input
                            type="text"
                            value={styleConfig.containerStyle.borderRadius}
                            onChange={(e) => setStyleConfig({
                              ...styleConfig,
                              containerStyle: { ...styleConfig.containerStyle, borderRadius: e.target.value }
                            })}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Border Width</label>
                          <input
                            type="text"
                            value={styleConfig.containerStyle.borderWidth}
                            onChange={(e) => setStyleConfig({
                              ...styleConfig,
                              containerStyle: { ...styleConfig.containerStyle, borderWidth: e.target.value }
                            })}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  isLoading={loading}
                  className="w-full py-3"
                  icon={FiSave}
                >
                  {isEditMode ? 'Update Template' : 'Create Template'}
                </Button>
              </div>

              {/* Right Column: Live Preview */}
              <div className="lg:col-span-7">
                <div className="sticky top-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-800">Live Preview</h2>
                    <span className="text-sm text-slate-500">This is how it will look</span>
                  </div>

                  {/* Preview Canvas */}
                  <div className="bg-slate-200 rounded-2xl p-8 min-h-[600px] flex items-center justify-center overflow-hidden relative border border-slate-300">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10"
                      style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                    </div>

                    {/* The Card Component */}
                    <motion.div
                      initial={false}
                      animate={styleConfig.animationType === 'none' ? {} : {
                        opacity: [0, 1],
                        y: styleConfig.animationType === 'slide-up' ? [20, 0] : 0,
                        scale: styleConfig.animationType === 'zoom-in' ? [0.9, 1] : 1
                      }}
                      transition={{ duration: 0.5 }}
                      className="w-full max-w-md p-8 relative overflow-hidden"
                      style={{
                        background: styleConfig.backgroundColor,
                        backgroundImage: styleConfig.backgroundImageUrl ? `url(${styleConfig.backgroundImageUrl})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        fontFamily: styleConfig.fontFamily,
                        color: styleConfig.textColor,
                        ...styleConfig.containerStyle
                      }}
                    >
                      <div className="text-center space-y-6 relative z-10">
                        <h1 className="text-4xl font-bold">Happy Birthday!</h1>

                        <div className="aspect-video bg-black/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20">
                          <span className="opacity-50">Media Placeholder</span>
                        </div>

                        <p className="text-lg leading-relaxed opacity-90">
                          Wishing you a day filled with happiness and a year filled with joy. Happy Birthday!
                        </p>

                        <div className="pt-4">
                          <button
                            className="px-6 py-2 rounded-full font-medium transition-transform hover:scale-105"
                            style={{
                              backgroundColor: styleConfig.textColor,
                              color: styleConfig.backgroundColor === '#ffffff' ? '#ffffff' : styleConfig.backgroundColor
                            }}
                          >
                            Open Gift
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Layout Designer Tab */}
          {
            activeTab === 'layout' && (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
                <div className="mb-4 flex items-center gap-4">
                  <label className="text-sm font-medium text-slate-700">Canvas Height (px):</label>
                  <input
                    type="number"
                    min="600"
                    max="2000"
                    step="50"
                    value={canvasHeight}
                    onChange={(e) => setCanvasHeight(parseInt(e.target.value) || 600)}
                    className="px-3 py-2 border border-slate-300 rounded-lg w-32 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <span className="text-xs text-slate-500">Increase height to add more slots</span>
                </div>
                <TemplateCanvas
                  slots={layoutSlots}
                  onSlotsChange={setLayoutSlots}
                  canvasWidth={900}
                  canvasHeight={canvasHeight}
                />
              </div>
            )
          }

          {/* Submit Button - Always Visible */}
          <div className="mt-8 flex justify-end gap-4">
            <Button
              variant="secondary"
              onClick={() => navigate('/admin/templates')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              isLoading={loading}
              icon={FiSave}
            >
              {isEditMode ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </>
      </div >
    </div >
  );
};

export default AdminCreateTemplate;
