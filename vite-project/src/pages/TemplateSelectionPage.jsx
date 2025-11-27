import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllTemplates } from '../api/templateApi';
import { toast } from 'react-toastify';

const TemplateSelectionPage = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredTemplate, setHoveredTemplate] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await getAllTemplates();
        setTemplates(response.data.data);
      } catch (error) {
        console.error('Error fetching templates:', error);
        toast.error('Failed to load templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleSelectTemplate = (templateId) => {
    if (templateId) {
      navigate(`/gallery/${folderId}/create-gift-card?templateId=${templateId}`);
    } else {
      navigate(`/gallery/${folderId}/create-gift-card`);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      party: 'bg-purple-500',
      wedding: 'bg-pink-500',
      retro: 'bg-amber-500',
      modern: 'bg-blue-500',
      elegant: 'bg-rose-500',
      birthday: 'bg-green-500',
      anniversary: 'bg-red-500',
      minimal: 'bg-gray-500',
      other: 'bg-indigo-500'
    };
    return colors[category] || colors.other;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Choose Your Template
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start with a stunning pre-designed template or create your own masterpiece from scratch
          </p>
        </motion.div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Start from Scratch Option */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            onClick={() => handleSelectTemplate(null)}
            className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden border-2 border-dashed border-gray-300 hover:border-purple-500 flex flex-col items-center justify-center min-h-[400px] transform hover:scale-105"
          >
            <div className="p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-300 transform group-hover:rotate-12">
                <svg className="w-12 h-12 text-purple-600 group-hover:text-purple-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Start from Scratch</h3>
              <p className="text-gray-600 mb-6">Build your gift card exactly how you want it with complete creative freedom</p>
              <div className="inline-flex items-center text-purple-600 font-semibold group-hover:text-purple-700">
                Create Now
                <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Template Cards */}
          {templates.map((template, index) => (
            <motion.div
              key={template._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onMouseEnter={() => setHoveredTemplate(template._id)}
              onMouseLeave={() => setHoveredTemplate(null)}
              className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200 hover:border-purple-400 transform hover:scale-105"
            >
              {/* Thumbnail */}
              <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <img
                  src={template.thumbnailUrl}
                  alt={template.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />

                {/* Category Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`${getCategoryColor(template.category)} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wide`}>
                    {template.category}
                  </span>
                </div>

                {/* Hover Overlay with Buttons */}
                <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-3 transition-opacity duration-300 ${hoveredTemplate === template._id ? 'opacity-100' : 'opacity-0'}`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.info('Preview feature coming soon!');
                    }}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-110 border border-white/30"
                  >
                    👁️ Preview
                  </button>
                  <button
                    onClick={() => handleSelectTemplate(template._id)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-110 shadow-lg"
                  >
                    Use Template
                  </button>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                  {template.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {template.description || 'A beautiful template for your gift card'}
                </p>

                {/* Features */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    Fully Customizable
                  </div>
                  <div className="text-purple-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
                    Select →
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {templates.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Templates Available</h3>
            <p className="text-gray-600 mb-6">Run the seeder script to populate templates</p>
            <code className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-sm">
              node server/seedTemplates.js
            </code>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TemplateSelectionPage;
